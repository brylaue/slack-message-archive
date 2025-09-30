#!/usr/bin/env bash

set -euo pipefail

echo "🔧 Render build: starting"

# Clean potentially stale lockfiles that can conflict with render cache
echo "🧹 Cleaning lockfiles (safe)"
rm -f yarn.lock || true
rm -f package-lock.json || true
rm -f client/package-lock.json || true

echo "📦 Installing server dependencies"
npm install --no-audit --no-fund

echo "📦 Installing client dependencies"
pushd client >/dev/null
npm install --no-audit --no-fund
echo "🏗️ Building client"
npm run build
popd >/dev/null

echo "🔍 Verifying build output"
./verify-build.sh

echo "✅ Render build: completed successfully"

