import os
from dotenv import load_dotenv

# .env needs to load before anything else reads env vars
load_dotenv()

from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routes.p1_banking import router as p1_router
from routes.p2_cybersec import router as p2_router
from routes.p3_retail   import router as p3_router
from routes.p4_energy   import router as p4_router

app = FastAPI(
    title="ET AI Hackathon — Agentic Edition",
    description="Backend for all 4 problem statements: Banking, CyberSec, Retail, Energy",
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

app.include_router(p1_router)
app.include_router(p2_router)
app.include_router(p3_router)
app.include_router(p4_router)


@app.get("/api/health")
async def health():
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "anthropic_key_set": bool(api_key) and api_key != "your_anthropic_api_key_here",
        "problems": ["P1-Banking", "P2-Cybersec", "P3-Retail", "P4-Energy"],
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
    print("  ET AI Hackathon — Python Backend Starting")
    print("=" * 56)
    print(f"  API Key:   {'✅ Set' if key_ok else '❌ MISSING — add to .env'}")
    print(f"  Docs:      http://localhost:5000/docs")
    print(f"  Health:    http://localhost:5000/api/health")
    print(f"  P1 Bank:   http://localhost:5000/api/p1/...")
    print(f"  P2 Cyber:  http://localhost:5000/api/p2/...")
    print(f"  P3 Retail: http://localhost:5000/api/p3/...")
    print(f"  P4 Energy: http://localhost:5000/api/p4/...")
    print("=" * 56 + "\n")

    if not key_ok:
        print("  ⚠️  WARNING: ANTHROPIC_API_KEY not set!")
        print("  Copy .env.example → .env and add your key.\n")
