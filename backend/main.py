import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Configure logging early so import-time logs are visible
logging.basicConfig(level=logging.INFO)

from app.auth.routes import router as auth_router
from app.auth.service import load_jwks
from app.routes.rooms import router as rooms_router
from app.config import settings
from app.db import close_db_pool, init_db_pool

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up...")
    await init_db_pool()
    logger.info("Connected to Supabase (PostgreSQL)")
    await load_jwks()
    logger.info("Loaded Supabase JWKS")
    
    yield
    # Shutdown
    logger.info("Shutting down...")
    await close_db_pool()
    logger.info("Disconnected from database")

app = FastAPI(
    title="Euro Hotel API",
    description="Hotel booking API with Supabase Auth JWT verification",
    version="1.0.0",
    lifespan=lifespan
)

# Local rate limiter (no dependency on auth/JWT routes)
limiter = Limiter(key_func=get_remote_address)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security middleware - disabled for development
# app.add_middleware(
#     TrustedHostMiddleware, 
#     allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app"]
# )

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(rooms_router)

@app.get("/")
async def root():
    return {
        "message": "Euro Hotel Authentication API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
