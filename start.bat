@echo off
REM ─────────────────────────────────────────────────────────
REM  ET AI Hackathon — Full Stack Startup (Windows)
REM ─────────────────────────────────────────────────────────

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║   ET AI Hackathon — Full Stack Startup               ║
echo ╚══════════════════════════════════════════════════════╝
echo.

REM ── Check .env ────────────────────────────────────────────
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo ⚠  Created backend\.env
    echo    Open backend\.env and set: ANTHROPIC_API_KEY=sk-ant-YOUR_KEY
    echo    Get your key at: https://console.anthropic.com
    pause
)

REM ── Backend setup ─────────────────────────────────────────
echo Setting up Python backend...
cd backend

if not exist venv (
    python -m venv venv
)

call venv\Scripts\activate
pip install -r requirements.txt -q
echo ✅ Backend ready

REM ── Start backend in new window ───────────────────────────
start "ET Hackathon - Backend (port 5000)" cmd /k "venv\Scripts\activate && uvicorn main:app --reload --port 5000"

cd ..

REM ── Frontend setup ────────────────────────────────────────
echo Setting up React frontend...
cd frontend

if not exist node_modules (
    echo Installing npm packages - first time takes ~2 minutes...
    npm install
)

echo ✅ Frontend ready
echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║  Backend:  http://localhost:5000/docs                ║
echo ║  Frontend: http://localhost:3000  (opening now...)   ║
echo ╚══════════════════════════════════════════════════════╝
echo.

npm start
