from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.user import User, Session
from app.models.booking import Room, RoomInventory, Booking, Payment, PromoCode, AuditLog
from app.models.pending_registration import PendingRegistration
from app.config import settings

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def connect_to_mongo():
    """Create database connection"""
    db.client = AsyncIOMotorClient(settings.mongodb_uri)
    db.database = db.client[settings.database_name]
    
    # Initialize beanie with all models
    await init_beanie(
        database=db.database,
        document_models=[
            User, Session, Room, RoomInventory, 
            Booking, Payment, PromoCode, AuditLog, PendingRegistration
        ]
    )

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()