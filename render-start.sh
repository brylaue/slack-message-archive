#!/bin/bash

echo "🚀 Starting Slack Message Viewer on Render..."

# Check if we're in production
if [ "$NODE_ENV" = "production" ]; then
    echo "🌍 Production environment detected"
    
    # Create logs directory if it doesn't exist
    mkdir -p logs
    
    # Check if PM2 is available
    if command -v pm2 &> /dev/null; then
        echo "📊 Starting with PM2..."
        
        # Start the application with PM2
        npm run start:pm2
        
        # Monitor the application
        echo "📈 Application started. Monitoring logs..."
        npm run logs:pm2
    else
        echo "⚠️  PM2 not available, starting with Node directly..."
        npm start
    fi
else
    echo "🔧 Development environment detected"
    npm start
fi