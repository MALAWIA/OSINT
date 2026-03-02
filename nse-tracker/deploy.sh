#!/bin/bash
# NSE Intelligence Tracker - Vercel Deployment Script
# This script automates the deployment process for both backend and frontend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
PROJECT_NAME="nse-tracker"

echo -e "${BLUE}🚀 NSE Intelligence Tracker - Vercel Deployment${NC}"
echo -e "${BLUE}============================================${NC}"

# Function to print colored status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}🔍 Checking prerequisites...${NC}"

# Check if Vercel CLI is installed
if command_exists vercel; then
    print_status "Vercel CLI is installed"
else
    print_error "Vercel CLI is not installed"
    echo "Please install it with: npm i -g vercel"
    exit 1
fi

# Check if Node.js is installed (for frontend)
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "Node.js is installed ($NODE_VERSION)"
else
    print_error "Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Python is installed (for backend)
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version)
    print_status "Python is installed ($PYTHON_VERSION)"
else
    print_error "Python is not installed"
    exit 1
fi

# Validate environment
echo -e "\n${YELLOW}🔒 Validating environment...${NC}"

cd "$BACKEND_DIR"
if python3 validate_env.py; then
    print_status "Environment validation passed"
else
    print_error "Environment validation failed"
    exit 1
fi

# Deploy Backend
echo -e "\n${BLUE}📦 Deploying Backend API...${NC}"
cd "$BACKEND_DIR"

# Check if logged in to Vercel
if ! vercel whoami >/dev/null 2>&1; then
    print_warning "Not logged in to Vercel"
    echo "Please run: vercel login"
    exit 1
fi

# Deploy backend
echo "Deploying backend to Vercel..."
if vercel --prod --name "$PROJECT_NAME-api"; then
    print_status "Backend deployed successfully"
    
    # Get backend URL
    BACKEND_URL=$(vercel ls --name "$PROJECT_NAME-api" 2>/dev/null | grep -oP '"Deployment"' | head -1 | grep -o '"https://[^"]*"' | sed 's/"//g')
    echo -e "${GREEN}Backend URL: $BACKEND_URL${NC}"
else
    print_error "Backend deployment failed"
    exit 1
fi

# Deploy Frontend
echo -e "\n${BLUE}🎨 Deploying Frontend...${NC}"
cd "../$FRONTEND_DIR"

# Update frontend environment with backend URL
if [ -n "$BACKEND_URL" ]; then
    echo "REACT_APP_API_URL=$BACKEND_URL/api" > .env.production
    print_status "Updated frontend API URL: $BACKEND_URL/api"
fi

# Build frontend
echo "Building frontend..."
if npm run build; then
    print_status "Frontend built successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

# Deploy frontend
echo "Deploying frontend to Vercel..."
if vercel --prod --name "$PROJECT_NAME" --cwd frontend; then
    print_status "Frontend deployed successfully"
    
    # Get frontend URL
    FRONTEND_URL=$(vercel ls --name "$PROJECT_NAME" 2>/dev/null | grep -oP '"Deployment"' | head -1 | grep -o '"https://[^"]*"' | sed 's/"//g')
    echo -e "${GREEN}Frontend URL: $FRONTEND_URL${NC}"
else
    print_error "Frontend deployment failed"
    exit 1
fi

# Configure environment variables in Vercel
echo -e "\n${YELLOW}⚙️  Configuring production environment variables...${NC}"

# Backend environment variables
echo "Setting backend environment variables..."
vercel env add USE_SUPABASE=true --scope "$PROJECT_NAME-api"
vercel env add SUPABASE_URL="https://uirsqaibxvfpbzswktot.supabase.co" --scope "$PROJECT_NAME-api"
vercel env add SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpcnNxYWlieHZmcGJ6c3drdG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NDYzN30.Y3HOXhh2yVvQqwSAupScWwfIy27tVAc-1oL-C_yBM10" --scope "$PROJECT_NAME-api"
vercel env add SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpcnNxYWlieHZmcGJ6c3drdG90Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI4ODYzNywiZXhwIjoyMDg3ODY0NjM3fQ.RX2kZb9yrJozkUNDm9IiVzXkKNfD-z4NgW_qRzzXwQE" --scope "$PROJECT_NAME-api"
vercel env add JWT_SECRET="NSE_Tracker_2026_Production_Secure_Key_Kenya_Stock_Exchange_Intelligence_Platform_v1_0" --scope "$PROJECT_NAME-api"
vercel env add ALLOWED_ORIGINS="$FRONTEND_URL,https://*.vercel.app" --scope "$PROJECT_NAME-api"
vercel env add DEBUG=false --scope "$PROJECT_NAME-api"
vercel env add ENVIRONMENT=production --scope "$PROJECT_NAME-api"

# Frontend environment variables
echo "Setting frontend environment variables..."
vercel env add REACT_APP_API_URL="$BACKEND_URL/api" --scope "$PROJECT_NAME"
vercel env add REACT_APP_ENVIRONMENT=production --scope "$PROJECT_NAME"
vercel env add REACT_APP_DEBUG=false --scope "$PROJECT_NAME"

# Summary
echo -e "\n${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}Backend API:${NC} $BACKEND_URL"
echo -e "${GREEN}Frontend App:${NC} $FRONTEND_URL"
echo -e "${GREEN}API Docs:${NC} $BACKEND_URL/docs"
echo -e "\n${YELLOW}📋 Next Steps:${NC}"
echo "1. Visit your frontend: $FRONTEND_URL"
echo "2. Test the application"
echo "3. Monitor logs in Vercel dashboard"
echo "4. Set up custom domain (optional)"
echo -e "\n${YELLOW}⚠️  Important Notes:${NC}"
echo "• Database password should be set in Vercel environment variables"
echo "• Monitor usage and costs in Vercel dashboard"
echo "• Check logs for any deployment issues"
echo -e "\n${GREEN}✅ Happy deploying!${NC}"
