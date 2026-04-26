from fastapi import APIRouter, HTTPException

from app.services.room_service import RoomService

router = APIRouter(prefix="/api/rooms", tags=["rooms"])

@router.get("/", response_model=list[dict])
async def get_rooms():
    """Return all rooms."""
    try:
        return await RoomService.get_all_rooms()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch rooms")
