from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.routers import documents, ai_suggestions, analytics, auth
from app.database import init_db, close_db
from app.services.ollama_service import OllamaService

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    
    # Initialize Ollama service
    ollama_service = OllamaService()
    await ollama_service.initialize()
    app.state.ollama_service = ollama_service
    
    yield
    
    # Shutdown
    await close_db()

app = FastAPI(
    title="WriteFlow Pro API",
    description="AI-powered document editing and writing assistance API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(ai_suggestions.router, prefix="/api/ai", tags=["ai-suggestions"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

@app.get("/")
async def root():
    return {"message": "WriteFlow Pro API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "WriteFlow Pro API"}