# Slack Message Viewer

A web application that allows you to view Slack messages older than 90 days, which are not accessible through Slack's free subscription. The app connects to your Slack workspace using OAuth 2.0 authentication and fetches historical messages using Slack's official API.

## Features

- 🔐 **Secure OAuth 2.0 Authentication** with Slack
- 📱 **Modern, Responsive UI** built with React and Tailwind CSS
- 📅 **90+ Day Message Access** beyond free tier limits
- 🔍 **Channel Search & Filtering** for easy navigation
- 📄 **Pagination Support** for large message histories
- 👥 **User Information Display** with caching
- 🎨 **Slack-inspired Design** with custom styling

## Prerequisites

- Node.js 16+ and npm
- A Slack workspace (actdienasty.slack.com)
- Slack App with appropriate permissions

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd slack-message-viewer
npm run install-all
```

### 2. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Enter app name: "Slack Message Viewer"
4. Select your workspace: `actdienasty.slack.com`

### 3. Configure Slack App Settings

#### OAuth & Permissions
1. Navigate to "OAuth & Permissions" in the sidebar
2. Add the following scopes:
   - `channels:history` - View public channel messages
   - `channels:read` - View public channel info
   - `groups:history` - View private channel messages
   - `groups:read` - View private channel info
   - `im:history` - View direct messages
   - `im:read` - View direct message info
   - `mpim:history` - View group direct messages
   - `mpim:read` - View group direct message info
   - `users:read` - View user information

#### App Home
1. Go to "App Home" in the sidebar
2. Enable "Allow users to send Slash commands and messages from the messages tab"

#### Basic Information
1. Note down your **Client ID** and **Client Secret**
2. Copy your **Signing Secret**

### 4. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your Slack app credentials:
```env
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_BOT_TOKEN=xoxb-your_bot_token
SLACK_USER_TOKEN=xoxp-your_user_token

PORT=3001
SESSION_SECRET=your_random_session_secret
NODE_ENV=development
SLACK_WORKSPACE=actdienasty.slack.com
```

### 5. Install App to Workspace

1. Go to "OAuth & Permissions" in your Slack app
2. Click "Install to Workspace"
3. Authorize the app with the requested permissions
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
5. Copy the **User OAuth Token** (starts with `xoxp-`)

### 6. Run the Application

#### Development Mode
```bash
# Terminal 1: Start backend server
npm run dev

# Terminal 2: Start frontend (in client directory)
cd client
npm start
```

#### Production Mode
```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Usage

1. **Login**: Click "Continue with Slack" to authenticate with your workspace
2. **Select Channel**: Browse and search through available channels
3. **View Messages**: Click on a channel to see messages older than 90 days
4. **Load More**: Use pagination to load additional historical messages
5. **Navigation**: Use the back button to return to channel selection

## API Endpoints

- `GET /api/auth/slack` - Get Slack OAuth URL
- `GET /api/auth/slack/callback` - Handle OAuth callback
- `GET /api/channels` - List user's channels
- `GET /api/messages/:channelId` - Get channel messages
- `GET /api/user/:userId` - Get user information
- `GET /api/auth/status` - Check authentication status
- `POST /api/auth/logout` - Logout user

## Security Features

- **OAuth 2.0 Authentication** with Slack
- **Session Management** with secure cookies
- **CORS Protection** for cross-origin requests
- **Helmet.js** for security headers
- **Environment Variables** for sensitive data

## Technical Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React 18, Tailwind CSS
- **Authentication**: Slack OAuth 2.0
- **Styling**: Tailwind CSS with custom Slack theme
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Troubleshooting

### Common Issues

1. **"Failed to get access token"**
   - Verify your Client ID and Client Secret
   - Check that redirect URI matches exactly

2. **"Not authenticated" errors**
   - Clear browser cookies and try again
   - Ensure session secret is set

3. **"Failed to fetch channels"**
   - Verify Bot Token has correct permissions
   - Check that app is installed to workspace

4. **No messages older than 90 days**
   - This is normal if your workspace is new
   - Messages are filtered server-side

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=slack:*
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues related to:
- **Slack API**: Check [Slack API documentation](https://api.slack.com/)
- **App Configuration**: Verify OAuth settings and permissions
- **Technical Issues**: Check the troubleshooting section above

---

**Note**: This application is designed for personal use and accessing your own workspace data. Ensure compliance with Slack's Terms of Service and your organization's policies.