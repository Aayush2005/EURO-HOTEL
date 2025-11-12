"""
Background tasks for cleanup operations
"""
import asyncio
import logging
from datetime import datetime, timedelta
from app.models.pending_registration import PendingRegistration

logger = logging.getLogger(__name__)

async def cleanup_expired_pending_registrations():
    """
    Delete pending registrations older than 10 minutes
    Runs continuously in the background
    """
    while True:
        try:
            # Calculate cutoff time (10 minutes ago)
            cutoff_time = datetime.utcnow() - timedelta(minutes=10)
            
            # Find and delete expired pending registrations
            expired = await PendingRegistration.find(
                PendingRegistration.created_at < cutoff_time
            ).to_list()
            
            if expired:
                deleted_count = 0
                for pending in expired:
                    await pending.delete()
                    deleted_count += 1
                
                logger.info(f"Cleaned up {deleted_count} expired pending registrations")
            
            # Run every 5 minutes
            await asyncio.sleep(300)
            
        except Exception as e:
            logger.error(f"Error in cleanup task: {e}")
            # Wait a bit before retrying on error
            await asyncio.sleep(60)
