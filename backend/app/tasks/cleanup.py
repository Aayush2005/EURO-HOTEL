"""
Background tasks for cleanup operations
"""
import asyncio
import logging
from datetime import datetime, timedelta
from app.database import get_supabase
from app.services.booking_service import BookingService

logger = logging.getLogger(__name__)

async def cleanup_expired_pending_registrations():
    """
    Delete pending registrations older than 10 minutes
    and release expired booking holds.
    Runs continuously in the background.
    """
    while True:
        try:
            supabase = get_supabase()
            
            # Calculate cutoff time (10 minutes ago)
            cutoff_time = (datetime.utcnow() - timedelta(minutes=10)).isoformat()
            
            # Find and delete expired pending registrations
            result = supabase.table("pending_registrations").select("id").lt("created_at", cutoff_time).execute()
            
            if result.data:
                deleted_count = 0
                for pending in result.data:
                    supabase.table("pending_registrations").delete().eq("id", pending["id"]).execute()
                    deleted_count += 1
                
                if deleted_count > 0:
                    logger.info(f"Cleaned up {deleted_count} expired pending registrations")
            
            # Also release expired booking holds
            try:
                await BookingService.release_expired_holds()
            except Exception as e:
                logger.error(f"Error releasing expired holds: {e}")
            
            # Run every 5 minutes
            await asyncio.sleep(300)
            
        except Exception as e:
            logger.error(f"Error in cleanup task: {e}")
            # Wait a bit before retrying on error
            await asyncio.sleep(60)
