# Render Deployment Guide

This guide covers deploying the Slack Message Viewer application to Render, a modern cloud platform for hosting web services.

## Prerequisites

- [Render account](https://render.com) (free tier available)
- Slack app configured with OAuth permissions
- Git repository with your code

## Step 1: Prepare Your Slack App

### 1.1 Create Slack App
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name: "Slack Message Viewer"
4. Workspace: `actdienasty.slack.com`

### 1.2 Configure OAuth Scopes
Navigate to "OAuth & Permissions" and add these scopes:
- `channels:history` - View public channel messages
- `channels:read` - View public channel info
- `groups:history` - View private channel messages
- `groups:read` - View private channel info
- `im:history` - View direct messages
- `im:read` - View direct message info
- `mpim:history` - View group direct messages
- `mpim:read` - View group direct message info
- `users:read` - View user information

### 1.3 Install App to Workspace
1. Go to "OAuth & Permissions"
2. Click "Install to Workspace"
3. Authorize the app
4. Copy the **Bot User OAuth Token** (`xoxb-...`)
5. Copy the **User OAuth Token** (`xoxp-...`)

### 1.4 Update Redirect URLs
1. Go to "OAuth & Permissions"
2. Add your Render URL to "Redirect URLs":
   ```
   https://your-app-name.onrender.com/api/auth/slack/callback
   ```

## Step 2: Deploy to Render

### 2.1 Connect Repository
1. Log into [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Select the repository with your Slack Message Viewer code

### 2.2 Configure Service
Use these settings:

**Basic Settings:**
- **Name**: `slack-message-viewer` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)

**Build & Deploy:**
- **Build Command**: `npm run install-all && npm run build`
- **Start Command**: `npm start`
- **Auto-Deploy**: ✅ Enabled

### 2.3 Environment Variables
Add these environment variables in Render:

**Required Variables:**
```
NODE_ENV=production
PORT=10000
SLACK_WORKSPACE=actdienasty.slack.com
```

**Secrets (Mark as Secret):**
```
SLACK_CLIENT_ID=your_client_id
SLACK_CLIENT_SECRET=your_client_secret
SLACK_SIGNING_SECRET=your_signing_secret
SLACK_BOT_TOKEN=xoxb-your_bot_token
SLACK_USER_TOKEN=xoxp-your_user_token
```

**Optional Variables:**
```
FRONTEND_URL=https://your-app-name.onrender.com
SESSION_SECRET=your_custom_session_secret
```

### 2.4 Advanced Settings
- **Health Check Path**: `/api/auth/status`
- **Instance Type**: `Starter` (free tier) or higher for production

## Step 3: Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build the frontend
   - Start the service

3. Wait for the build to complete (usually 2-5 minutes)

## Step 4: Verify Deployment

### 4.1 Check Health
- Visit your app URL: `https://your-app-name.onrender.com`
- Check the health endpoint: `/api/auth/status`

### 4.2 Test Slack Authentication
1. Click "Continue with Slack" on your app
2. Complete OAuth flow
3. Verify you can see your channels

## Step 5: Custom Domain (Optional)

1. Go to your service in Render Dashboard
2. Click "Settings" → "Custom Domains"
3. Add your domain
4. Update DNS records as instructed
5. Update Slack redirect URL to use your custom domain

## Troubleshooting

### Common Issues

#### 1. Build Failures
**Problem**: Build command fails
**Solution**: 
- Check `package.json` scripts
- Verify Node.js version compatibility
- Check for missing dependencies

#### 2. OAuth Errors
**Problem**: "Failed to get access token"
**Solution**:
- Verify redirect URL in Slack app matches exactly
- Check environment variables are set correctly
- Ensure CORS is configured properly

#### 3. Session Issues
**Problem**: Users get logged out frequently
**Solution**:
- Check `SESSION_SECRET` is set
- Verify cookie settings for production
- Consider using external session storage

#### 4. Port Issues
**Problem**: App won't start
**Solution**:
- Ensure `PORT` is set to `10000` (Render's default)
- Check no other services use the same port

### Debug Commands

```bash
# Check build logs in Render
# Go to your service → "Logs" tab

# Check environment variables
# Go to your service → "Environment" tab

# Restart service
# Go to your service → "Manual Deploy" → "Clear build cache & deploy"
```

## Performance Optimization

### 1. Enable Auto-Scaling
- Go to "Settings" → "Auto-Scaling"
- Set minimum and maximum instances
- Configure scaling rules

### 2. Use CDN
- Enable Render's built-in CDN
- Optimize static assets
- Compress images and files

### 3. Database Considerations
- For production, consider external database
- Use Redis for session storage
- Implement proper caching strategies

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use Render's secret management
- Rotate secrets regularly

### 2. HTTPS
- Render provides HTTPS by default
- Use secure cookies in production
- Implement proper CORS policies

### 3. Rate Limiting
- Consider adding rate limiting middleware
- Monitor API usage
- Set appropriate limits

## Monitoring & Maintenance

### 1. Health Checks
- Monitor `/api/auth/status` endpoint
- Set up external monitoring
- Configure alerts for downtime

### 2. Logs
- Review logs regularly
- Set up log aggregation
- Monitor error rates

### 3. Updates
- Keep dependencies updated
- Monitor security advisories
- Test updates in staging first

## Cost Optimization

### Free Tier Limits
- **Starter Plan**: $0/month
  - 750 hours/month
  - 512 MB RAM
  - Shared CPU
  - Sleeps after 15 minutes of inactivity

### Paid Plans
- **Standard Plan**: $7/month
  - Always on
  - 512 MB RAM
  - Shared CPU
  - Custom domains

- **Pro Plan**: $25/month
  - Always on
  - 1 GB RAM
  - Dedicated CPU
  - Auto-scaling

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Slack API Documentation](https://api.slack.com/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [Render Community](https://community.render.com/)

---

**Need Help?** Check the main README.md for application-specific issues or create an issue in your repository.