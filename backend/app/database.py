from supabase import create_client, Client
from app.config import settings

# Supabase client instance
supabase: Client = None

def get_supabase() -> Client:
    """Get the Supabase client instance"""
    global supabase
    if supabase is None:
        supabase = create_client(settings.supabase_url, settings.supabase_key)
    return supabase

async def connect_to_db():
    """Initialize Supabase client"""
    global supabase
    supabase = create_client(settings.supabase_url, settings.supabase_key)

async def close_db_connection():
    """Close database connection (no-op for Supabase REST client)"""
    pass
