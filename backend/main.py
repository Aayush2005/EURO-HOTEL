import logging
from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Depends

# Configure logging early so import-time logs are visible
logging.basicConfig(level=logging.INFO)

from middleware.auth import ApiKeyAuth
from app.routes.rooms import router as rooms_router
from app.config import settings
from app.transaction_pooler import connect_pool, close_pool

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up...")
    await connect_pool()
    logger.info("Connected to Supabase (PostgreSQL)")
    
    yield
    # Shutdown
    logger.info("Shutting down...")
    await close_pool()
    logger.info("Disconnected from database")

app = FastAPI(
    title="Euro Hotel Authentication API",
    description="Authentication and user management system for Euro Hotel",
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
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include routers
app.include_router(rooms_router, dependencies=[Depends(ApiKeyAuth)])

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
