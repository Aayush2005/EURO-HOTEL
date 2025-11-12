#!/usr/bin/env python3
"""
Setup TTL (Time To Live) index for pending_registrations collection
This will automatically delete documents after 10 minutes
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import connect_to_mongo, db

async def setup_ttl_index():
    """Setup TTL index for automatic deletion"""
    await connect_to_mongo()
    
    pending_collection = db.database["pending_registrations"]
    
    print("Setting up TTL index for pending_registrations...")
    print("=" * 60)
    
    try:
        # Drop existing index if it exists without TTL
        try:
            await pending_collection.drop_index("created_at_1")
            print("   Dropped existing created_at index")
        except Exception:
            pass
        
        # Create TTL index - documents will be deleted 10 minutes (600 seconds) after created_at
        await pending_collection.create_index(
            "created_at",
            expireAfterSeconds=600  # 10 minutes
        )
        print("✅ TTL index created successfully!")
        print("   Pending registrations will be automatically deleted after 10 minutes")
        
    except Exception as e:
        print(f"⚠️  Error creating TTL index: {e}")
        print("   The background cleanup task will still work")
    
    # List all indexes
    print("\nCurrent indexes on pending_registrations:")
    indexes = await pending_collection.list_indexes().to_list(length=None)
    for idx in indexes:
        print(f"   - {idx['name']}: {idx.get('key', {})}")
        if 'expireAfterSeconds' in idx:
            print(f"     TTL: {idx['expireAfterSeconds']} seconds")
    
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(setup_ttl_index())
