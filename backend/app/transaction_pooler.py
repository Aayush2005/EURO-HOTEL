from typing import Any

from app.db import close_db_pool, get_db_pool, init_db_pool


async def connect_pool() -> None:
    await init_db_pool()


async def close_pool() -> None:
    await close_db_pool()


async def fetch_all(query: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    db_pool = await get_db_pool()
    async with db_pool.acquire() as connection:
        rows = await connection.fetch(query, *params)
        return [dict(row) for row in rows]


async def fetch_one(query: str, *args: Any) -> dict[str, Any] | None:
    params = args[0] if len(args) == 1 and isinstance(args[0], tuple) else args
    db_pool = await get_db_pool()
    async with db_pool.acquire() as connection:
        row = await connection.fetchrow(query, *params)
        return dict(row) if row else None
