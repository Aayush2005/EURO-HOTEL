"""
Room management routes for EURO HOTEL
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.booking import Room, RoomType

router = APIRouter(prefix="/api/rooms", tags=["rooms"])

@router.get("/", response_model=List[dict])
async def get_rooms(
    room_type: Optional[str] = Query(None, description="Filter by room type"),
    max_occupancy: Optional[int] = Query(None, description="Filter by maximum occupancy"),
    min_price: Optional[float] = Query(None, description="Filter by minimum price"),
    max_price: Optional[float] = Query(None, description="Filter by maximum price"),
    available_only: bool = Query(True, description="Show only available rooms")
):
    """Get all rooms with optional filtering"""
    try:
        # Build query filters
        filters = {}
        
        if room_type:
            try:
                filters["room_type"] = RoomType(room_type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid room type: {room_type}")
        
        if max_occupancy:
            filters["max_occupancy"] = {"$gte": max_occupancy}
        
        if min_price or max_price:
            price_filter = {}
            if min_price:
                price_filter["$gte"] = min_price
            if max_price:
                price_filter["$lte"] = max_price
            filters["base_price"] = price_filter
        
        # Get rooms from database
        rooms = await Room.find(filters).to_list()
        
        # Convert to frontend format
        rooms_data = []
        for room in rooms:
            room_dict = {
                "id": str(room.id),
                "slug": room.slug,
                "title": room.title,
                "description": room.description,
                "room_type": room.room_type.value,
                "amenities": room.amenities,
                "images": [
                    {
                        "url": img.url,
                        "alt": img.alt,
                        "is_primary": img.is_primary
                    }
                    for img in room.images
                ],
                "base_price": room.base_price,
                "max_occupancy": room.max_occupancy,
                "bed_configuration": room.bed_configuration,
                "room_size": room.room_size,
                "view": room.view,
                "available": True
            }
            rooms_data.append(room_dict)
        
        return rooms_data
        
    except Exception as e:
        print(f"Error fetching rooms: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch rooms")

@router.get("/{slug}", response_model=dict)
async def get_room_by_slug(slug: str):
    """Get a specific room by slug"""
    try:
        room = await Room.find_one(Room.slug == slug)
        
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        
        # Convert to frontend format
        room_dict = {
            "id": str(room.id),
            "slug": room.slug,
            "title": room.title,
            "description": room.description,
            "room_type": room.room_type.value,
            "amenities": room.amenities,
            "images": [
                {
                    "url": img.url,
                    "alt": img.alt,
                    "is_primary": img.is_primary
                }
                for img in room.images
            ],
            "base_price": room.base_price,
            "max_occupancy": room.max_occupancy,
            "bed_configuration": room.bed_configuration,
            "room_size": room.room_size,
            "view": room.view,
            "floor": room.floor,
            "cancellation_policy": room.cancellation_policy.value,
            "metadata": room.metadata,
            "available": True  # For now, assume all rooms are available
        }
        
        return room_dict
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching room {slug}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch room")

@router.get("/types/", response_model=List[dict])
async def get_room_types():
    """Get all available room types"""
    try:
        room_types = []
        for room_type in RoomType:
            # Get count of rooms for each type
            count = await Room.find(Room.room_type == room_type).count()
            if count > 0:
                room_types.append({
                    "value": room_type.value,
                    "label": room_type.value.replace("_", " ").title(),
                    "count": count
                })
        
        return room_types
        
    except Exception as e:
        print(f"Error fetching room types: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch room types")