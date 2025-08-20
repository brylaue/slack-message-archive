const express = require('express');
const cors = require('cors');
const session = require('express-session');
const helmet = require('helmet');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://slack-message-viewer.onrender.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Slack API routes
app.get('/api/auth/slack', (req, res) => {
  const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=channels:history,channels:read,groups:history,groups:read,im:history,im:read,mpim:history,mpim:read,users:read&redirect_uri=${encodeURIComponent(`${req.protocol}://${req.get('host')}/api/auth/slack/callback`)}`;
  res.json({ authUrl: slackAuthUrl });
});

app.get('/api/auth/slack/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code not provided' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code: code,
        redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/slack/callback`
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
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Slack workspace: ${process.env.SLACK_WORKSPACE}`);
});