from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)
ENV_FILE = Path(__file__).resolve().parents[1] / ".env"


def _load_env_file() -> None:
    """Load .env in a simple, predictable way (supports # in values)."""
    if not ENV_FILE.exists():
        logger.warning("Config file not found: %s", ENV_FILE)
        return

    for raw_line in ENV_FILE.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ[key.strip()] = value.strip().strip('"').strip("'")


_load_env_file()
logger.info("Loading config from %s (exists=%s)", ENV_FILE, ENV_FILE.exists())

class Settings(BaseSettings):
    # Supabase Configuration
    supabase_host: str = os.getenv("SUPABASE_HOST", "")
    supabase_port: int = int(os.getenv("SUPABASE_PORT", "6543"))
    supabase_database: str = os.getenv("SUPABASE_DATABASE", "postgres")
    supabase_user: str = os.getenv("SUPABASE_USER", "")
    supabase_password: str = os.getenv("SUPABASE_PASSWORD", "")
    supabase_connection_string: str = os.getenv("SUPABASE_CONNECTION_STRING", "")
    
     
    # CORS
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Rate limiting
    rate_limit_per_minute: int = 5
    
    # OTP
    otp_expire_minutes: int = 10
    
    # API Key
    api_key: str = os.getenv("API_KEY", "")
    
    class Config:
        env_file = str(ENV_FILE)
        extra = "ignore"  # Ignore extra fields like old MONGODB_URI

settings = Settings()
logger.info("Config loaded (api_key_configured=%s)", bool(settings.api_key))