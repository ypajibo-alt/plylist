#!/bin/bash

# Quick start script for Tubi PlayApp Integration
# This script starts both the API server (chatgpt-app) and PlayApp

echo "🎬 Starting Tubi PlayApp Integration..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if chatgpt-app directory exists
if [ ! -d "/Users/asriram/chatgpt-app" ]; then
    echo "❌ Error: chatgpt-app directory not found at /Users/asriram/chatgpt-app"
    exit 1
fi

# Check if we're in the plylist directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the plylist directory"
    exit 1
fi

echo "${BLUE}📦 Step 1: Building API server...${NC}"
cd /Users/asriram/chatgpt-app
npm run build > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to build chatgpt-app"
    echo "Run 'cd /Users/asriram/chatgpt-app && npm install && npm run build' manually"
    exit 1
fi

echo "${GREEN}✅ API server built successfully${NC}"
echo ""

echo "${BLUE}🚀 Step 2: Starting servers...${NC}"
echo ""
echo "${YELLOW}⚡ Starting API server on port 3000...${NC}"
echo "   (Tubi API, automatic token generation)"
echo ""

# Start chatgpt-app in background
cd /Users/asriram/chatgpt-app
npm start > /tmp/chatgpt-app.log 2>&1 &
API_PID=$!

# Wait for API server to be ready
echo "   Waiting for API server..."
for i in {1..30}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "${GREEN}   ✅ API server ready on port 3000${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo "❌ Error: API server failed to start after 30 seconds"
        echo "Check logs: tail /tmp/chatgpt-app.log"
        kill $API_PID 2>/dev/null
        exit 1
    fi
done

echo ""
echo "${YELLOW}⚡ Starting PlayApp...${NC}"
echo "   (Next.js will auto-select port 3001 if 3000 is taken)"
echo ""

# Start PlayApp (this will run in foreground)
cd /Users/asriram/plylist
npm run dev

# If we get here, user pressed Ctrl+C
echo ""
echo "${YELLOW}🛑 Shutting down servers...${NC}"
kill $API_PID 2>/dev/null
echo "${GREEN}✅ Servers stopped${NC}"

