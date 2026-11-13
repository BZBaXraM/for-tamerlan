#!/bin/bash

# EduAI — Start All Servers
# Usage: bash start-all.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         EduAI — Interactive 3D AI Teacher                 ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}⚠️  node_modules not found. Running npm install...${NC}"
  npm install
  echo ""
fi

# Check if Silero venv exists
if [ ! -d "silero-server/venv" ]; then
  echo -e "${YELLOW}⚠️  Silero venv not found. Running setup...${NC}"
  cd silero-server
  bash setup.sh
  cd ..
  echo ""
fi

# Function to check if port is in use
check_port() {
  lsof -i:"$1" >/dev/null 2>&1
}

# Kill existing processes if ports are in use
if check_port 8765; then
  echo -e "${YELLOW}⚠️  Port 8765 already in use. Killing existing process...${NC}"
  lsof -ti:8765 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

if check_port 3000; then
  echo -e "${YELLOW}⚠️  Port 3000 already in use. Killing existing process...${NC}"
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

echo -e "${GREEN}🚀 Starting Silero TTS Server...${NC}"
cd silero-server
nohup bash start.sh > ../silero.log 2>&1 &
SILERO_PID=$!
cd ..

echo -e "   PID: $SILERO_PID"
echo -e "   Logs: tail -f silero.log"
echo ""

# Wait for Silero to start
echo "⏳ Waiting for Silero server to start..."
for i in {1..15}; do
  if curl -s http://localhost:8765/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Silero TTS ready on http://localhost:8765${NC}"
    break
  fi
  if [ $i -eq 15 ]; then
    echo -e "${RED}❌ Silero server failed to start. Check silero.log${NC}"
    exit 1
  fi
  sleep 1
done
echo ""

echo -e "${GREEN}🚀 Starting Vite Dev Server...${NC}"
nohup npm run dev > vite.log 2>&1 &
VITE_PID=$!

echo -e "   PID: $VITE_PID"
echo -e "   Logs: tail -f vite.log"
echo ""

# Wait for Vite to start
echo "⏳ Waiting for Vite dev server to start..."
for i in {1..10}; do
  if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Vite dev server ready on http://localhost:3000${NC}"
    break
  fi
  if [ $i -eq 10 ]; then
    echo -e "${YELLOW}⚠️  Vite server may be on different port. Check vite.log${NC}"
  fi
  sleep 1
done
echo ""

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    ✅ ALL SERVERS READY                   ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║  Frontend:       http://localhost:3000                    ║"
echo "║  Silero TTS:     http://localhost:8765                    ║"
echo "║                                                           ║"
echo "║  Test page:      open test-tts.html                       ║"
echo "║                                                           ║"
echo "║  Stop servers:   bash stop-all.sh                         ║"
echo "║  View logs:      tail -f silero.log vite.log              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🎉 Open your browser:${NC} http://localhost:3000"
echo ""
echo "Process IDs saved to .pids file"
echo "$SILERO_PID" > .pids
echo "$VITE_PID" >> .pids

# Optionally open browser (uncomment if desired)
# sleep 2
# open http://localhost:3000
