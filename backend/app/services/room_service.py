from pathlib import Path
from typing import Any

from app.transaction_pooler import fetch_all, fetch_one


QUERY_DIR = Path(__file__).resolve().parents[2] / "query" / "rooms"
GET_ALL_ROOMS_SQL = (QUERY_DIR / "get_all_rooms.sql").read_text(encoding="utf-8")
GET_ROOM_BY_TYPE_SQL = (QUERY_DIR / "get_room_by_type.sql").read_text(encoding="utf-8")


def _serialize_room(row: dict) -> dict[str, Any]:
    return {
        "room_type": row["room_type"],
        "room_base_price": float(row["room_base_price"]),
        "tax_percent": float(row["tax_percent"]),
        "room_final_price": float(row["room_final_price"]),
        "max_occupancy": int(row["max_occupancy"] or 0),
        "available_rooms": int(row["available_rooms"] or 0),
        "amenities": row["amenities"] or [],
        "description": row["description"],
    }


class RoomService:
    @staticmethod
    async def get_all_rooms() -> list[dict[str, Any]]:
        rows = await fetch_all(GET_ALL_ROOMS_SQL)
        return [_serialize_room(row) for row in rows]

    @staticmethod
    async def get_room_by_type(room_type: str) -> dict[str, Any] | None:
        row = await fetch_one(GET_ROOM_BY_TYPE_SQL, room_type)
        return _serialize_room(row) if row else None
