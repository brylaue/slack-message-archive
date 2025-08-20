#!/bin/bash

echo "🚀 Starting Slack Message Viewer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm run install-all

echo "🔧 Starting backend server..."
npm run dev &

echo "⏳ Waiting for backend to start..."
sleep 5

echo "🌐 Starting frontend..."
cd client && npm start &

echo "✅ Application is starting up!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait