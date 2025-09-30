const express = require('express');
const cors = require('cors');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const helmet = require('helmet');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
// Enable trusting proxy headers so req.protocol is accurate on Render/Heroku
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://slack.com"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://slack-message-viewer.onrender.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create sessions directory if it doesn't exist
const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

app.use(session({
  store: new FileStore({
    path: sessionsDir,
    ttl: 86400, // 24 hours
    reapInterval: 3600 // 1 hour
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Slack API routes
app.get('/api/auth/slack', (req, res) => {
  const clientId = process.env.SLACK_CLIENT_ID;
  if (!clientId) {
    console.error('Slack OAuth error: SLACK_CLIENT_ID is not set');
    return res.status(500).json({
      error: 'Slack OAuth is not configured',
      details: 'Missing SLACK_CLIENT_ID. Set it in your environment.',
    });
  }

  const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${baseUrl}/api/auth/slack/callback`;

  const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(clientId)}&scope=channels:history,channels:read,groups:history,groups:read,im:history,im:read,mpim:history,mpim:read,users:read&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.json({ authUrl: slackAuthUrl });
});

app.get('/api/auth/slack/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code not provided' });
  }

  try {
    // Exchange code for access token
    const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code: code,
        redirect_uri: `${baseUrl}/api/auth/slack/callback`
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.ok) {
      throw new Error(tokenData.error || 'Failed to get access token');
    }

    // Store tokens in session
    req.session.slackAccessToken = tokenData.access_token;
    req.session.slackUserId = tokenData.authed_user?.id;
    
    res.redirect('/');
  } catch (error) {
    console.error('Slack auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.get('/api/channels', async (req, res) => {
  if (!req.session.slackAccessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const response = await fetch('https://slack.com/api/conversations.list', {
      headers: {
        'Authorization': `Bearer ${req.session.slackAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.error || 'Failed to fetch channels');
    }

    const channels = data.channels
      .filter(channel => channel.is_member)
      .map(channel => ({
        id: channel.id,
        name: channel.name,
        is_private: channel.is_private,
        is_im: channel.is_im,
        is_mpim: channel.is_mpim
      }));

    res.json({ channels });
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

app.get('/api/messages/:channelId', async (req, res) => {
  if (!req.session.slackAccessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { channelId } = req.params;
  const { limit = 100, oldest = 0 } = req.query;

  try {
    const response = await fetch(`https://slack.com/api/conversations.history?channel=${channelId}&limit=${limit}&oldest=${oldest}`, {
      headers: {
        'Authorization': `Bearer ${req.session.slackAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.error || 'Failed to fetch messages');
    }

    // Filter messages older than 90 days (7776000 seconds)
    const ninetyDaysAgo = Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60);
    const oldMessages = data.messages.filter(msg => {
      const messageTime = parseInt(msg.ts);
      return messageTime < ninetyDaysAgo;
    });

    res.json({ 
      messages: oldMessages,
      has_more: data.has_more,
      oldest_ts: data.messages.length > 0 ? data.messages[data.messages.length - 1].ts : null
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.get('/api/user/:userId', async (req, res) => {
  if (!req.session.slackAccessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { userId } = req.params;

  try {
    const response = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
      headers: {
        'Authorization': `Bearer ${req.session.slackAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.error || 'Failed to fetch user info');
    }

    res.json({ user: data.user });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

app.get('/api/auth/status', (req, res) => {
  res.json({ 
    authenticated: !!req.session.slackAccessToken,
    userId: req.session.slackUserId,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'slack-message-viewer',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const buildPath = path.join(__dirname, 'client', 'build');
  
  // Check if build directory exists
  if (require('fs').existsSync(buildPath)) {
    console.log('✅ Build directory found:', buildPath);
    app.use(express.static(buildPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    console.log('❌ Build directory not found:', buildPath);
    console.log('📁 Current directory contents:', require('fs').readdirSync(__dirname));
    
    // Fallback if build doesn't exist
    app.get('/', (req, res) => {
      res.json({ 
        message: 'Slack Message Viewer API',
        status: 'running',
        build: 'not found - check build process',
        debug: {
          currentDir: __dirname,
          buildPath: buildPath,
          exists: require('fs').existsSync(buildPath),
          contents: require('fs').readdirSync(__dirname)
        }
      });
    });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💬 Slack workspace: ${process.env.SLACK_WORKSPACE}`);
    console.log(`🔒 HTTPS: ${process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

// Graceful shutdown
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
}

// Expose app for testing
module.exports = app;