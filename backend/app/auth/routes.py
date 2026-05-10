from typing import Any

from asyncpg import Connection
from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.auth.dependencies import get_current_user, require_roles
from app.auth.schemas import UpdateProfileRequest
from app.db import get_db
from app.users.service import update_user_profile


limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["authentication"])


@router.get("/me")
@limiter.limit("60/minute")
async def me(request: Request, user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    return {"user": user}


@router.patch("/me")
@limiter.limit("10/minute")
async def update_me(
    request: Request,
    payload: UpdateProfileRequest,
    user: dict[str, Any] = Depends(get_current_user),
    connection: Connection = Depends(get_db),
) -> dict[str, Any]:
    full_name = payload.full_name.strip() if payload.full_name else None
    updated_user = await update_user_profile(
        connection,
        user["id"],
        full_name,
        payload.phone,
    )
    return {"user": updated_user}
