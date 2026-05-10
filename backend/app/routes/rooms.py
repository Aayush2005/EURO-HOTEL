from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.services.room_service import RoomService


limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api/rooms", tags=["rooms"])


@router.get("/", response_model=list[dict])
@limiter.limit("60/minute")
async def get_rooms(request: Request):
    try:
        return await RoomService.get_all_rooms()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch rooms")


@router.get("/{room_type}", response_model=dict)
@limiter.limit("60/minute")
async def get_room(request: Request, room_type: str):
    try:
        room = await RoomService.get_room_by_type(room_type)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch room")
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return room
