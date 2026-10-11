import os
from dotenv import load_dotenv

# load .env before anything else reads environment variables
load_dotenv()

from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routes.sentinel import router as sentinel_router

app = FastAPI(
    title="SentinelAI — Prompt Injection Firewall",
    description="Agentic cybersecurity firewall that detects prompt injection attacks across 9 attack vectors",
    version="1.0.0",
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sentinel_router)


@app.get("/api/health")
async def health():
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "anthropic_key_set": bool(api_key) and api_key != "your_anthropic_api_key_here",
        "service": "SentinelAI Prompt Injection Firewall",
    }


@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception):
    print(f"Unhandled error on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )


@app.on_event("startup")
async def startup():
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    key_ok = bool(api_key) and api_key != "your_anthropic_api_key_here"

    print("\n" + "=" * 56)
    print("  SentinelAI — Prompt Injection Firewall")
    print("=" * 56)
    print(f"  API Key:  {'✅ Set' if key_ok else '❌ MISSING — add to .env'}")
    print(f"  Docs:     http://localhost:5000/docs")
    print(f"  Health:   http://localhost:5000/api/health")
    print(f"  Scan:     POST http://localhost:5000/api/sentinel/scan")
    print(f"  Explain:  POST http://localhost:5000/api/sentinel/explain")
    print(f"  Test:     POST http://localhost:5000/api/sentinel/generate_test")
    print("=" * 56 + "\n")

    if not key_ok:
        print("  ⚠️  WARNING: ANTHROPIC_API_KEY not set!")
        print("  Copy .env.example → .env and paste your key.\n")
