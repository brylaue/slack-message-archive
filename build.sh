#!/bin/bash

echo "🔨 Building Slack Message Viewer..."

# Install server dependencies
echo "📦 Installing server dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install

# Build client
echo "🏗️ Building client..."
npm run build

# Check if build was successful
if [ -f "build/index.html" ]; then
    echo "✅ Client build successful!"
    echo "📁 Build files created in client/build/"
else
    echo "❌ Client build failed!"
    exit 1
fi

echo "🎉 Build complete!"