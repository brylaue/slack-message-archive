#!/usr/bin/env bash

set -euo pipefail

echo "🔧 Render build: starting"

echo "📦 Installing server dependencies"
npm install

echo "📦 Installing client dependencies"
cd client
npm install
echo "🏗️ Building client"
npm run build
cd ..

echo "🔍 Verifying build output"
./verify-build.sh

echo "✅ Render build: completed successfully"

