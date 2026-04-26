from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, onboarding, research, findings, pins, ws

app = FastAPI(title="Humantic AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(onboarding.router, prefix="/api", tags=["Onboarding"])
app.include_router(research.router, prefix="/api", tags=["Research"])
app.include_router(findings.router, prefix="/api", tags=["Findings"])
app.include_router(pins.router, prefix="/api", tags=["Pins"])
app.include_router(ws.router, tags=["WebSocket"])


@app.get("/")
async def root():
    return {"status": "ok", "message": "Humantic AI is running"}
