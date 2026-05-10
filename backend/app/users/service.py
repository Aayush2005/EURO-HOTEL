from typing import Any, Literal
from uuid import UUID

import asyncpg


UserRole = Literal["user", "admin", "manager", "receptionist"]

USER_COLUMNS = "id, email, full_name, phone, role, is_active, created_at, last_login_at"

GET_USER_BY_ID_SQL = f"""
SELECT {USER_COLUMNS}
FROM hotel.users
WHERE id = $1;
"""

UPSERT_AUTH_USER_SQL = f"""
INSERT INTO hotel.users (id, email, role, last_login_at)
VALUES ($1, $2, 'user', NOW())
ON CONFLICT (id)
DO UPDATE SET
    email = EXCLUDED.email,
    last_login_at = NOW()
RETURNING {USER_COLUMNS};
"""

UPDATE_USER_PROFILE_SQL = f"""
UPDATE hotel.users
SET
    full_name = $2,
    phone = $3
WHERE id = $1
RETURNING {USER_COLUMNS};
"""


async def get_user_by_id(connection: asyncpg.Connection, user_id: UUID) -> dict[str, Any] | None:
    row = await connection.fetchrow(GET_USER_BY_ID_SQL, user_id)
    return dict(row) if row else None


async def sync_supabase_user(
    connection: asyncpg.Connection,
    user_id: UUID,
    email: str,
) -> dict[str, Any]:
    row = await connection.fetchrow(UPSERT_AUTH_USER_SQL, user_id, email)
    if row is None:
        raise RuntimeError("Failed to sync authenticated user")
    return dict(row)


async def update_user_profile(
    connection: asyncpg.Connection,
    user_id: UUID,
    full_name: str | None,
    phone: str | None,
) -> dict[str, Any]:
    row = await connection.fetchrow(UPDATE_USER_PROFILE_SQL, user_id, full_name, phone)
    if row is None:
        raise RuntimeError("Failed to update user profile")
    return dict(row)
