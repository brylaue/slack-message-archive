# 🚀 Quick Start: Deploy to Render (Paid Starter Plan)

You're all set! This guide will get your Slack Message Viewer deployed to Render in minutes.

## ⚡ One-Command Deployment

Run this script to prepare everything:

```bash
./deploy-to-render.sh
```

This script will:
- ✅ Check all prerequisites
- ✅ Install dependencies
- ✅ Build the application
- ✅ Commit and push your code
- ✅ Guide you through Render setup

## 🎯 Render Dashboard Setup

### 1. Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your Git repository

### 2. Configure Service
Use these exact settings:

**Basic Settings:**
- **Name**: `slack-message-viewer` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)

**Build & Deploy:**
- **Build Command**: `npm run render-build`
- **Start Command**: `./render-start.sh`
- **Health Check Path**: `/health`
- **Auto-Deploy**: ✅ Enabled

### 3. Environment Variables
Add these in Render:

**Required (Mark as Secret):**
```
SLACK_CLIENT_ID=your_client_id
SLACK_CLIENT_SECRET=your_client_secret
SLACK_SIGNING_SECRET=your_signing_secret
SLACK_BOT_TOKEN=xoxb-your_bot_token
SLACK_USER_TOKEN=xoxp-your_user_token
```

**Auto-Set by Render:**
```
NODE_ENV=production
PORT=10000
SESSION_SECRET=auto_generated
SLACK_WORKSPACE=actdienasty.slack.com
COOKIE_SECURE=true
COOKIE_SAMESITE=none
COOKIE_HTTPONLY=true
MAX_REQUEST_SIZE=10mb
SESSION_TIMEOUT=86400000
LOG_LEVEL=info
ENABLE_DEBUG_LOGGING=false
```

## 🔑 Get Your Slack Credentials

### 1. Create Slack App
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. "Create New App" → "From scratch"
3. Name: "Slack Message Viewer"
4. Workspace: `actdienasty.slack.com`

### 2. Add OAuth Scopes
In "OAuth & Permissions":
- `channels:history`
- `channels:read`
- `groups:history`
- `groups:read`
- `im:history`
- `im:read`
- `mpim:history`
- `mpim:read`
- `users:read`

### 3. Install & Get Tokens
1. Click "Install to Workspace"
2. Copy **Bot User OAuth Token** (`xoxb-...`)
3. Copy **User OAuth Token** (`xoxp-...`)
4. Note **Client ID** and **Client Secret**

### 4. Update Redirect URL
Add to "Redirect URLs":
```
https://your-app-name.onrender.com/api/auth/slack/callback
```

## 🚀 Deploy!

1. Click "Create Web Service" in Render
2. Wait for build to complete (2-5 minutes)
3. Your app will be live at: `https://your-app-name.onrender.com`

## ✅ Verify Deployment

1. **Health Check**: Visit `/health` endpoint
2. **Slack Login**: Click "Continue with Slack"
3. **Channel List**: Should see your channels
4. **Old Messages**: Access messages >90 days

## 🔧 Troubleshooting

### Build Fails?
- Check build logs in Render
- Verify `package.json` scripts
- Ensure all dependencies listed

### OAuth Errors?
- Verify redirect URL matches exactly
- Check all environment variables set
- Ensure Slack app permissions correct

### App Won't Start?
- Check `PORT=10000`
- Verify all required env vars set
- Check service logs in Render

## 📊 Paid Starter Plan Benefits

Your paid plan includes:
- ✅ **Always On** - No sleeping after inactivity
- ✅ **512 MB RAM** - Plenty for the app
- ✅ **Shared CPU** - Good performance
- ✅ **Custom Domains** - Add your own domain
- ✅ **Auto-scaling** - Handle traffic spikes
- ✅ **Priority Support** - Get help when needed

## 🆘 Need Help?

- **Render Issues**: Check [Render Docs](https://render.com/docs)
- **Slack Issues**: Check [Slack API Docs](https://api.slack.com/)
- **App Issues**: Check the main README.md
- **Deployment Issues**: Use DEPLOYMENT_CHECKLIST.md

---

**🎉 You're all set! Run `./deploy-to-render.sh` and follow the prompts.**