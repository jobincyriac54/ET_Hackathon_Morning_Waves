#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  ET AI Hackathon — Full Stack Startup Script
#  Starts both Python backend and React frontend
# ─────────────────────────────────────────────────────────────

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   ET AI Hackathon — Full Stack Startup               ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Check Python ───────────────────────────────────────────
if ! command -v python3 &>/dev/null && ! command -v python &>/dev/null; then
  echo "❌ Python not found. Install from https://python.org"
  exit 1
fi
PYTHON=$(command -v python3 || command -v python)
echo "✅ Python: $($PYTHON --version)"

# ── Check Node ─────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org"
  exit 1
fi
echo "✅ Node.js: $(node --version)"

# ── Check .env ─────────────────────────────────────────────
if [ ! -f "$BACKEND_DIR/.env" ]; then
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
  echo ""
  echo "⚠️  Created backend/.env — please add your API key:"
  echo "   ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE"
  echo ""
  echo "   Get your key at: https://console.anthropic.com"
  echo ""
  read -p "   Press Enter after adding your key to continue..."
fi

API_KEY=$(grep ANTHROPIC_API_KEY "$BACKEND_DIR/.env" | cut -d'=' -f2)
if [ -z "$API_KEY" ] || [ "$API_KEY" = "your_anthropic_api_key_here" ]; then
  echo "❌ ANTHROPIC_API_KEY not set in backend/.env"
  echo "   Edit backend/.env and add your key."
  exit 1
fi
echo "✅ API key found"

# ── Backend: venv + deps ───────────────────────────────────
echo ""
echo "📦 Setting up Python backend..."
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
  echo "   Creating virtual environment..."
  $PYTHON -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt -q
echo "✅ Backend dependencies ready"

# ── Frontend: deps ─────────────────────────────────────────
echo ""
echo "📦 Setting up React frontend..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
  echo "   Installing npm packages (first time takes ~2 minutes)..."
  npm install --silent
fi
echo "✅ Frontend dependencies ready"

# ── Start both servers ─────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Starting servers...                                 ║"
echo "║                                                      ║"
echo "║  Backend:  http://localhost:5000/docs                ║"
echo "║  Frontend: http://localhost:3000                     ║"
echo "║                                                      ║"
echo "║  Press Ctrl+C to stop both servers                   ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Start backend in background
cd "$BACKEND_DIR"
source venv/bin/activate
uvicorn main:app --reload --port 5000 &
BACKEND_PID=$!

# Give backend 2 seconds to start
sleep 2

# Start frontend in foreground (keeps script alive)
cd "$FRONTEND_DIR"
npm start

# When frontend exits, kill backend too
kill $BACKEND_PID 2>/dev/null
echo "Both servers stopped."
