from pathlib import Path
from typing import Any

from app.transaction_pooler import fetch_all


QUERY_DIR = Path(__file__).resolve().parents[2] / "query" / "rooms"
GET_ALL_ROOMS_SQL = (QUERY_DIR / "get_all_rooms.sql").read_text(encoding="utf-8")


class RoomService:
    @staticmethod
    async def get_all_rooms() -> list[dict[str, Any]]:
        rows = await fetch_all(GET_ALL_ROOMS_SQL)
        return [
            {
                "room_type": row["room_type"],
                "room_base_price": float(row["room_base_price"]),
                "tax_percent": float(row["tax_percent"]),
                "room_final_price": float(row["room_final_price"]),
                "available_rooms": int(row["available_rooms"] or 0),
                "amenities": row["amenities"] or [],
                "description": row["description"],
            }
            for row in rows
        ]
