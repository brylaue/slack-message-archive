#!/bin/bash

echo "🔍 Verifying build process..."

# Check if we're in the right directory
echo "📁 Current directory: $(pwd)"
echo "📁 Contents:"
ls -la

# Check if client directory exists
if [ -d "client" ]; then
    echo "✅ Client directory found"
    
    # Check if client/build exists
    if [ -d "client/build" ]; then
        echo "✅ Client build directory found"
        echo "📁 Build contents:"
        ls -la client/build/
        
        # Check if index.html exists
        if [ -f "client/build/index.html" ]; then
            echo "✅ index.html found - build successful!"
            exit 0
        else
            echo "❌ index.html not found in build directory"
            exit 1
        fi
    else
        echo "❌ Client build directory not found"
        echo "📁 Client directory contents:"
        ls -la client/
        exit 1
    fi
else
    echo "❌ Client directory not found"
    exit 1
fi