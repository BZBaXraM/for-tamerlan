#!/bin/bash

# EduAI — Stop All Servers
# Usage: bash stop-all.sh

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         EduAI — Stopping All Servers                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Stop by PIDs if .pids file exists
if [ -f ".pids" ]; then
  echo "📋 Stopping processes from .pids file..."
  while read pid; do
    if ps -p "$pid" > /dev/null 2>&1; then
      echo -e "   Killing PID: $pid"
      kill -9 "$pid" 2>/dev/null || true
    fi
  done < .pids
  rm .pids
  echo ""
fi

# Stop by ports (fallback)
echo "🔍 Checking for processes on ports..."

if lsof -i:8765 >/dev/null 2>&1; then
  echo -e "${YELLOW}   Found process on port 8765 (Silero TTS)${NC}"
  lsof -ti:8765 | xargs kill -9 2>/dev/null || true
  echo -e "${GREEN}   ✅ Stopped Silero TTS server${NC}"
else
  echo "   Port 8765: Not in use"
fi

if lsof -i:3000 >/dev/null 2>&1; then
  echo -e "${YELLOW}   Found process on port 3000 (Vite Dev)${NC}"
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
  echo -e "${GREEN}   ✅ Stopped Vite dev server${NC}"
else
  echo "   Port 3000: Not in use"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                 ✅ ALL SERVERS STOPPED                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "To restart: bash start-all.sh"
