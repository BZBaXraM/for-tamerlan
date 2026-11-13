#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Silero TTS Server — one-time setup
# Run once: bash setup.sh
# Then start: bash start.sh
# ─────────────────────────────────────────────────────────────
set -e

VENV_DIR="$(dirname "$0")/venv"

echo "▶ Creating virtual environment..."
python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"

echo "▶ Upgrading pip..."
pip install --upgrade pip --quiet

echo "▶ Installing dependencies (torch, fastapi, soundfile...)..."
pip install -r "$(dirname "$0")/requirements.txt" --quiet

echo ""
echo "✅ Setup complete."
echo "   Run the server:  bash silero-server/start.sh"
