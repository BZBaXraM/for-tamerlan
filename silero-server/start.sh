#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Start the Silero TTS server
# Usage: bash silero-server/start.sh
# ─────────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"

if [ ! -d "$VENV_DIR" ]; then
  echo "❌  Virtual environment not found. Run first:"
  echo "    bash silero-server/setup.sh"
  exit 1
fi

source "$VENV_DIR/bin/activate"

echo "🚀 Starting Silero TTS server on http://localhost:8765"
echo "   Language: Azerbaijani (aze_gamat)"
echo "   Press Ctrl+C to stop."
echo ""

cd "$SCRIPT_DIR"
python server.py
