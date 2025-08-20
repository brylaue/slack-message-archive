#!/bin/bash

echo "🚀 Slack Message Viewer - Render Deployment Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm $(npm -v) detected"

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_success "Git $(git --version) detected"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a Git repository. Please initialize Git first."
    exit 1
fi

print_success "Git repository detected"

# Check if we have uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes. Consider committing them before deployment."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled. Please commit your changes first."
        exit 1
    fi
fi

# Install dependencies
print_status "Installing dependencies..."
if npm run install-all; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Build the application
print_status "Building the application..."
if npm run build; then
    print_success "Application built successfully"
else
    print_error "Failed to build application"
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_warning ".env.production file not found. Creating template..."
    cp .env.example .env.production
    print_status "Please edit .env.production with your Slack credentials"
fi

# Check if .env exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.production .env
    print_status "Please edit .env with your Slack credentials"
fi

# Git operations
print_status "Preparing for deployment..."

# Add all files
git add .

# Commit if there are changes
if ! git diff-index --quiet HEAD --; then
    git commit -m "Deploy to Render - $(date)"
    print_success "Changes committed"
else
    print_status "No changes to commit"
fi

# Push to remote
print_status "Pushing to remote repository..."
if git push; then
    print_success "Code pushed to remote repository"
else
    print_error "Failed to push to remote repository"
    exit 1
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to [Render Dashboard](https://dashboard.render.com)"
echo "2. Create a new Web Service"
echo "3. Connect your Git repository"
echo "4. Use these settings:"
echo "   - Build Command: npm run render-build"
echo "   - Start Command: ./render-start.sh"
echo "   - Health Check Path: /health"
echo "5. Add your Slack credentials as environment variables"
echo "6. Deploy!"
echo ""
echo "📚 For detailed instructions, see RENDER_DEPLOYMENT.md"
echo "✅ For deployment checklist, see DEPLOYMENT_CHECKLIST.md"
echo ""
echo "🔗 Your app will be available at: https://your-app-name.onrender.com"