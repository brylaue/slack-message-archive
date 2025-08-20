# Deployment Guide

This guide covers deploying the Slack Message Viewer application to production environments.

## Prerequisites

- Node.js 18+ installed on your server
- Domain name (optional but recommended)
- SSL certificate (required for production)
- Process manager (PM2 recommended)

## Production Deployment

### 1. Environment Setup

```bash
# Set production environment
export NODE_ENV=production

# Set secure session secret
export SESSION_SECRET=$(openssl rand -hex 32)

# Set Slack credentials
export SLACK_CLIENT_ID=your_client_id
export SLACK_CLIENT_SECRET=your_client_secret
export SLACK_SIGNING_SECRET=your_signing_secret
export SLACK_BOT_TOKEN=xoxb-your_bot_token
export SLACK_USER_TOKEN=xoxp-your_user_token
```

### 2. Build and Deploy

```bash
# Install dependencies
npm run install-all

# Build frontend
npm run build

# Start production server
npm start
```

### 3. Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'slack-message-viewer',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 4. Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production
RUN cd client && npm ci --only=production

# Copy source code
COPY . .

# Build frontend
RUN cd client && npm run build

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t slack-message-viewer .
docker run -p 3001:3001 --env-file .env slack-message-viewer
```

### 6. Environment Variables

Create a `.env` file in production:

```env
NODE_ENV=production
PORT=3001
SESSION_SECRET=your_secure_session_secret

# Slack Configuration
SLACK_CLIENT_ID=your_client_id
SLACK_CLIENT_SECRET=your_client_secret
SLACK_SIGNING_SECRET=your_signing_secret
SLACK_BOT_TOKEN=xoxb-your_bot_token
SLACK_USER_TOKEN=xoxp-your_user_token
SLACK_WORKSPACE=actdienasty.slack.com
```

### 7. Security Considerations

- **HTTPS**: Always use HTTPS in production
- **Session Secret**: Use a strong, random session secret
- **Environment Variables**: Never commit `.env` files
- **Rate Limiting**: Consider adding rate limiting middleware
- **CORS**: Restrict CORS origins to your domain
- **Headers**: Use security headers (already included with Helmet.js)

### 8. Monitoring and Logging

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs slack-message-viewer

# Restart application
pm2 restart slack-message-viewer
```

### 9. Backup and Recovery

```bash
# Backup environment variables
cp .env .env.backup

# Backup PM2 configuration
pm2 save

# Restore from backup
cp .env.backup .env
pm2 resurrect
```

## Troubleshooting Production Issues

### Common Problems

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3001
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Memory Issues**
   ```bash
   # Monitor memory usage
   pm2 monit
   
   # Restart with more memory
   pm2 restart slack-message-viewer --max-memory-restart 1G
   ```

3. **SSL Issues**
   ```bash
   # Test SSL configuration
   openssl s_client -connect your-domain.com:443
   ```

### Performance Optimization

- Use PM2 cluster mode for multiple CPU cores
- Enable gzip compression in Nginx
- Use CDN for static assets
- Implement caching strategies
- Monitor and optimize database queries (if applicable)

## Scaling Considerations

- **Horizontal Scaling**: Use load balancer with multiple instances
- **Vertical Scaling**: Increase server resources
- **Database**: Consider external database for session storage
- **Caching**: Implement Redis for session and data caching
- **CDN**: Use CDN for static assets

---

For additional support, refer to the main README.md file or create an issue in the repository.