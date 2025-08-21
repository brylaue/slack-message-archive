#!/bin/bash

echo "🚫 Aggressively forcing npm usage..."

# Remove any package manager lock files
echo "🧹 Removing all lock files..."
rm -f yarn.lock package-lock.json client/package-lock.json
rm -f .yarnrc.yml .yarnrc

# Create .npmrc to force npm
echo "📝 Creating .npmrc to force npm..."
cat > .npmrc << EOF
engine-strict=true
package-lock=true
prefer-offline=true
audit=false
fund=false
use-yarn=false
EOF

# Install server dependencies with npm
echo "📦 Installing server dependencies with npm..."
npm install --prefer-offline --no-audit --no-fund

# Install client dependencies with npm
echo "📦 Installing client dependencies with npm..."
cd client
npm install --prefer-offline --no-audit --no-fund

# Build client
echo "🏗️ Building client with npm..."
npm run build

# Verify build
echo "🔍 Verifying build..."
if [ -f "build/index.html" ]; then
    echo "✅ Build successful! index.html found."
    echo "📁 Build contents:"
    ls -la build/
else
    echo "❌ Build failed! index.html not found."
    echo "📁 Client directory contents:"
    ls -la
    exit 1
fi

echo "🎉 Build completed successfully with npm!"