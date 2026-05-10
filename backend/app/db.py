from collections.abc import AsyncIterator
import json
from typing import Any

import asyncpg
from asyncpg import Pool, Record

from app.config import settings


pool: Pool | None = None


async def _init_connection(conn: asyncpg.Connection) -> None:
    await conn.set_type_codec(
        "jsonb",
        encoder=json.dumps,
        decoder=json.loads,
        schema="pg_catalog",
    )
    await conn.set_type_codec(
        "json",
        encoder=json.dumps,
        decoder=json.loads,
        schema="pg_catalog",
    )


async def init_db_pool() -> None:
    global pool
    if pool is not None:
        return

    pool = await asyncpg.create_pool(
        dsn=settings.database_url,
        min_size=settings.db_pool_min_size,
        max_size=settings.db_pool_max_size,
        command_timeout=30,
        statement_cache_size=0,
        init=_init_connection,
    )


async def close_db_pool() -> None:
    global pool
    if pool is not None:
        await pool.close()
        pool = None


async def get_db_pool() -> Pool:
    if pool is None:
        await init_db_pool()
    if pool is None:
        raise RuntimeError("Database pool is not initialized")
    return pool


async def get_db() -> AsyncIterator[asyncpg.Connection]:
    db_pool = await get_db_pool()
    async with db_pool.acquire() as connection:
        yield connection


def record_to_dict(record: Record | None) -> dict[str, Any] | None:
    return dict(record) if record is not None else None


def records_to_dicts(records: list[Record]) -> list[dict[str, Any]]:
    return [dict(record) for record in records]
