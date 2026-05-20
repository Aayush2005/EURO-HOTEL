from __future__ import annotations

from datetime import UTC, datetime

from asyncpg import Connection
from fastapi import HTTPException


class AllocationEngine:
    @staticmethod
    async def auto_allocate_for_booking(connection: Connection, booking_id: int) -> list[dict]:
        rows = await connection.fetch(
            """
            SELECT br.id AS booking_room_id, br.room_type_id, b.check_in, b.check_out
            FROM hotel.booking_rooms br
            JOIN hotel.bookings b ON b.id = br.booking_id
            WHERE br.booking_id = $1 AND br.room_id IS NULL
            ORDER BY br.id
            """,
            booking_id,
        )

        assignments: list[dict] = []
        # Track rooms assigned within this loop so the exclusion list is always
        # up-to-date on the same pgbouncer server connection (transaction mode
        # can route auto-commit statements to different backend connections, so
        # the NOT EXISTS check alone may not see earlier iterations' UPDATEs).
        assigned_in_session: list[int] = []

        async with connection.transaction():
            for item in rows:
                room = await connection.fetchrow(
                    """
                    SELECT r.id
                    FROM hotel.rooms r
                    WHERE r.room_type_id = $1
                      AND r.status NOT IN ('maintenance','out_of_service')
                      AND r.id != ALL($4::int[])
                      AND NOT EXISTS (
                        SELECT 1
                        FROM hotel.booking_rooms br2
                        JOIN hotel.bookings b2 ON b2.id = br2.booking_id
                        WHERE br2.room_id = r.id
                          AND b2.booking_status IN ('pending','confirmed','checked_in')
                          AND b2.check_in  < $3
                          AND b2.check_out > $2
                      )
                    ORDER BY r.id
                    LIMIT 1
                    FOR UPDATE SKIP LOCKED
                    """,
                    item["room_type_id"],
                    item["check_in"],
                    item["check_out"],
                    assigned_in_session,
                )
                if not room:
                    break
                await connection.execute(
                    "UPDATE hotel.booking_rooms SET room_id = $2 WHERE id = $1",
                    item["booking_room_id"],
                    room["id"],
                )
                assigned_in_session.append(room["id"])
                assignments.append({"booking_room_id": item["booking_room_id"], "room_id": room["id"]})

            await connection.execute(
                "UPDATE hotel.bookings SET updated_at = $2 WHERE id = $1",
                booking_id,
                datetime.now(UTC),
            )

        return assignments

    @staticmethod
    async def assign_room(connection: Connection, booking_room_id: int, room_id: int) -> None:
        row = await connection.fetchrow(
            """
            SELECT br.id, br.room_type_id, b.check_in, b.check_out
            FROM hotel.booking_rooms br
            JOIN hotel.bookings b ON b.id = br.booking_id
            WHERE br.id = $1
            """,
            booking_room_id,
        )
        if not row:
            raise HTTPException(status_code=404, detail="booking room not found")

        room = await connection.fetchrow(
            "SELECT id, room_type_id, status FROM hotel.rooms WHERE id = $1",
            room_id,
        )
        if not room or room["room_type_id"] != row["room_type_id"]:
            raise HTTPException(status_code=400, detail="room type mismatch")
        if room["status"] in {"maintenance", "out_of_service"}:
            raise HTTPException(status_code=400, detail="room unavailable")

        overlap = await connection.fetchval(
            """
            SELECT 1
            FROM hotel.booking_rooms br
            JOIN hotel.bookings b ON b.id = br.booking_id
            WHERE br.room_id = $1
              AND b.booking_status IN ('pending','confirmed','checked_in')
              AND b.check_in < $3
              AND b.check_out > $2
            LIMIT 1
            """,
            room_id,
            row["check_in"],
            row["check_out"],
        )
        if overlap:
            raise HTTPException(status_code=409, detail="room overlaps with active booking")

        await connection.execute("UPDATE hotel.booking_rooms SET room_id = $2 WHERE id = $1", booking_room_id, room_id)
