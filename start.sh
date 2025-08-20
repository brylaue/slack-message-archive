#!/bin/bash

echo "🚀 Starting Slack Message Viewer on Render..."

# Check if we're in production
if [ "$NODE_ENV" = "production" ]; then
    echo "🌍 Production environment detected"
    echo "🔧 Starting with Node.js..."
    exec node server.js
else
    echo "🔧 Development environment detected"
    exec npm start
fi