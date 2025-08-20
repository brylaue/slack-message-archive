# Deployment Checklist for Render

Use this checklist to ensure your Slack Message Viewer application is ready for deployment to Render.

## Pre-Deployment Checklist

### ✅ Code Repository
- [ ] Code is committed to Git repository
- [ ] Repository is accessible from Render
- [ ] All dependencies are properly listed in package.json
- [ ] No sensitive data (API keys, secrets) in code
- [ ] .env files are in .gitignore

### ✅ Slack App Configuration
- [ ] Slack app created at [api.slack.com/apps](https://api.slack.com/apps)
- [ ] App name: "Slack Message Viewer"
- [ ] Workspace: `actdienasty.slack.com`
- [ ] OAuth scopes added:
  - [ ] `channels:history`
  - [ ] `channels:read`
  - [ ] `groups:history`
  - [ ] `groups:read`
  - [ ] `im:history`
  - [ ] `im:read`
  - [ ] `mpim:history`
  - [ ] `mpim:read`
  - [ ] `users:read`
- [ ] App installed to workspace
- [ ] Bot User OAuth Token copied (`xoxb-...`)
- [ ] User OAuth Token copied (`xoxp-...`)
- [ ] Client ID noted
- [ ] Client Secret noted
- [ ] Signing Secret copied

### ✅ Environment Variables Ready
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `SLACK_CLIENT_ID` (your client ID)
- [ ] `SLACK_CLIENT_SECRET` (your client secret)
- [ ] `SLACK_SIGNING_SECRET` (your signing secret)
- [ ] `SLACK_BOT_TOKEN` (your bot token)
- [ ] `SLACK_USER_TOKEN` (your user token)
- [ ] `SLACK_WORKSPACE=actdienasty.slack.com`
- [ ] `SESSION_SECRET` (random string, Render can generate)

## Render Deployment Checklist

### ✅ Service Creation
- [ ] New Web Service created in Render
- [ ] Git repository connected
- [ ] Branch selected (usually `main`)
- [ ] Environment set to `Node`
- [ ] Region selected (closest to users)

### ✅ Build Configuration
- [ ] Build Command: `npm run render-build`
- [ ] Start Command: `npm start`
- [ ] Auto-Deploy enabled
- [ ] Instance Type: Starter (or higher)

### ✅ Environment Variables Set
- [ ] All required variables added
- [ ] Slack credentials marked as "Secret"
- [ ] No typos in variable names
- [ ] Values copied correctly

### ✅ Advanced Settings
- [ ] Health Check Path: `/health`
- [ ] Custom domain configured (if needed)
- [ ] Environment variables verified

## Post-Deployment Checklist

### ✅ Service Health
- [ ] Build completed successfully
- [ ] Service status: "Live"
- [ ] Health check endpoint responding
- [ ] App accessible at Render URL

### ✅ Slack Integration
- [ ] Redirect URL updated in Slack app
- [ ] OAuth flow working
- [ ] Can authenticate with Slack
- [ ] Channels loading correctly
- [ ] Old messages accessible

### ✅ Functionality Testing
- [ ] Login/logout working
- [ ] Channel list displays
- [ ] Channel search working
- [ ] Messages older than 90 days visible
- [ ] Pagination working
- [ ] User information displaying

### ✅ Security Verification
- [ ] HTTPS working (Render provides by default)
- [ ] Session cookies secure
- [ ] CORS properly configured
- [ ] No sensitive data exposed

## Troubleshooting Checklist

### 🔍 Build Issues
- [ ] Check build logs in Render
- [ ] Verify package.json scripts
- [ ] Check Node.js version compatibility
- [ ] Ensure all dependencies listed

### 🔍 Runtime Issues
- [ ] Check service logs
- [ ] Verify environment variables
- [ ] Test health check endpoint
- [ ] Check Slack API responses

### 🔍 OAuth Issues
- [ ] Verify redirect URL matches exactly
- [ ] Check Slack app permissions
- [ ] Ensure tokens are correct
- [ ] Test OAuth flow step by step

## Performance Checklist

### ⚡ Optimization
- [ ] Frontend assets optimized
- [ ] Images compressed
- [ ] CDN enabled (if available)
- [ ] Caching implemented

### 📊 Monitoring
- [ ] Health checks configured
- [ ] Logs being collected
- [ ] Error monitoring set up
- [ ] Performance metrics tracked

## Security Checklist

### 🔒 Production Security
- [ ] Environment variables secured
- [ ] HTTPS enforced
- [ ] Secure cookies configured
- [ ] CORS policies appropriate
- [ ] Rate limiting considered

### 🔒 Maintenance
- [ ] Dependencies updated
- [ ] Security patches applied
- [ ] Secrets rotated regularly
- [ ] Access logs reviewed

## Final Verification

### 🎯 Ready for Production
- [ ] All functionality working
- [ ] Security measures in place
- [ ] Performance acceptable
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team trained on usage

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Version**: _______________

**Notes**: _______________