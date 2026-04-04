"""
Room management routes for EURO HOTEL
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.booking import RoomDB, RoomType
from app.database import get_supabase

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
        supabase = get_supabase()
        
        # Start building query
        query = supabase.table("rooms").select("*")
        
        # Apply filters
        if room_type:
            try:
                RoomType(room_type)  # Validate room type
                query = query.eq("room_type", room_type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid room type: {room_type}")
        
        if max_occupancy:
            query = query.gte("max_occupancy", max_occupancy)
        
        if min_price:
            query = query.gte("base_price", min_price)
        
        if max_price:
            query = query.lte("base_price", max_price)
        
        if available_only:
            query = query.eq("active", True)
        
        # Execute query
        result = query.execute()
        
        # Convert to frontend format
        rooms_data = []
        for room in result.data:
            room_dict = {
                "id": str(room["id"]),
                "slug": room["slug"],
                "title": room["title"],
                "description": room["description"],
                "room_type": room["room_type"],
                "amenities": room.get("amenities", []),
                "images": room.get("images", []),
                "base_price": room["base_price"],
                "max_occupancy": room["max_occupancy"],
                "bed_configuration": room["bed_configuration"],
                "room_size": room["room_size"],
                "view": room["view"],
                "available": True
            }
            rooms_data.append(room_dict)
        
        return rooms_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching rooms: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch rooms")

@router.get("/{slug}", response_model=dict)
async def get_room_by_slug(slug: str):
    """Get a specific room by slug"""
    try:
        supabase = get_supabase()
        
        result = supabase.table("rooms").select("*").eq("slug", slug).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Room not found")
        
        room = result.data[0]
        
        # Convert to frontend format
        room_dict = {
            "id": str(room["id"]),
            "slug": room["slug"],
            "title": room["title"],
            "description": room["description"],
            "room_type": room["room_type"],
            "amenities": room.get("amenities", []),
            "images": room.get("images", []),
            "base_price": room["base_price"],
            "max_occupancy": room["max_occupancy"],
            "bed_configuration": room["bed_configuration"],
            "room_size": room["room_size"],
            "view": room["view"],
            "floor": room["floor"],
            "cancellation_policy": room["cancellation_policy"],
            "room_metadata": room.get("room_metadata", {}),
            "available": True
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
        supabase = get_supabase()
        
        room_types = []
        for room_type in RoomType:
            # Get count of rooms for each type
            result = supabase.table("rooms").select("id", count="exact").eq("room_type", room_type.value).execute()
            count = result.count if hasattr(result, 'count') and result.count else len(result.data)
            
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
