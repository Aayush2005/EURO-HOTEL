from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool
from urllib.parse import quote_plus

from app.config import settings


pool: AsyncConnectionPool | None = None


def _build_connection_string() -> str:
    if settings.supabase_connection_string:
        return settings.supabase_connection_string

    if (
        settings.supabase_host
        and settings.supabase_user
        and settings.supabase_password
        and settings.supabase_database
    ):
        encoded_user = quote_plus(settings.supabase_user)
        encoded_password = quote_plus(settings.supabase_password)
        return (
            f"postgresql://{encoded_user}:{encoded_password}"
            f"@{settings.supabase_host}:{settings.supabase_port}/{settings.supabase_database}"
        )

    raise RuntimeError("Supabase transaction pooler credentials are not configured")


async def connect_pool() -> None:
    global pool
    if pool is None:
        pool = AsyncConnectionPool(
            conninfo=_build_connection_string(),
            min_size=2,
            max_size=10,
            kwargs={"row_factory": dict_row},
        )
        await pool.open()


async def close_pool() -> None:
    global pool
    if pool is not None:
        await pool.close()
        pool = None


async def fetch_all(query: str, params: tuple = ()) -> list[dict]:
    if pool is None:
        await connect_pool()

    if pool is None:
        raise RuntimeError("Transaction pool is not initialized")

    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(query, params)
            rows = await cur.fetchall()
            return list(rows)


async def fetch_one(query: str, *args) -> dict | None:
    if pool is None:
        await connect_pool()

    if pool is None:
        raise RuntimeError("Transaction pool is not initialized")

    params = args[0] if len(args) == 1 and isinstance(args[0], tuple) else args
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(query, params)
            return await cur.fetchone()
