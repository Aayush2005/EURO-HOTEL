import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

logging.basicConfig(level=logging.INFO)

from app.auth.routes import router as auth_router
from app.auth.service import load_jwks
from app.routes.rooms import router as rooms_router
from app.routes.bookings import router as bookings_router
from app.routes.payments import router as payments_router
from app.routes.admin_bookings import router as admin_bookings_router
from app.config import settings
from app.db import close_db_pool, init_db_pool

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")
    await init_db_pool()
    logger.info("Connected to Supabase (PostgreSQL)")
    await load_jwks()
    logger.info("Loaded Supabase JWKS")
    yield
    logger.info("Shutting down...")
    await close_db_pool()
    logger.info("Disconnected from database")


_is_production = settings.environment == "production"
app = FastAPI(
    title="Euro Hotel API",
    description="Hotel booking API with Supabase Auth JWT verification",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if _is_production else "/docs",
    redoc_url=None if _is_production else "/redoc",
    openapi_url=None if _is_production else "/openapi.json",
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(rooms_router)
app.include_router(bookings_router)
app.include_router(payments_router)
app.include_router(admin_bookings_router)


@app.get("/")
async def root():
    return {"message": "Euro Hotel API", "version": "1.0.0", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
