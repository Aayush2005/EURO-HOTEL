from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
import logging
import asyncio

from app.database import connect_to_db, close_db_connection
from app.routes.auth import router as auth_router, limiter
from app.routes.booking import router as booking_router
from app.routes.payment import router as payment_router
from app.routes.admin import router as admin_router
from app.routes.rooms import router as rooms_router
from app.config import settings
from app.tasks import cleanup_expired_pending_registrations

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up...")
    await connect_to_db()
    logger.info("Connected to Supabase (PostgreSQL)")
    
    # Start background cleanup task
    cleanup_task = asyncio.create_task(cleanup_expired_pending_registrations())
    logger.info("Started background cleanup task for pending registrations")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        logger.info("Cleanup task cancelled")
    await close_db_connection()
    logger.info("Disconnected from database")

app = FastAPI(
    title="Euro Hotel Authentication API",
    description="Authentication and user management system for Euro Hotel",
    version="1.0.0",
    lifespan=lifespan
)

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
app.include_router(auth_router)
app.include_router(booking_router)
app.include_router(payment_router)
app.include_router(admin_router)
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
