from collections.abc import Callable, Sequence
from typing import Any
from uuid import UUID

from asyncpg import Connection
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.service import verify_supabase_jwt
from app.db import get_db
from app.users.service import UserRole, sync_supabase_user


bearer_scheme = HTTPBearer(auto_error=False)


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    connection: Connection = Depends(get_db),
) -> dict[str, Any]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _unauthorized()

    payload = verify_supabase_jwt(credentials.credentials)
    if payload is None:
        raise _unauthorized()

    user = await sync_supabase_user(
        connection,
        user_id=UUID(str(payload["sub"])),
        email=str(payload["email"]),
    )

    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    return user


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    connection: Connection = Depends(get_db),
) -> dict[str, Any] | None:
    if credentials is None or credentials.scheme.lower() != "bearer":
        return None

    payload = verify_supabase_jwt(credentials.credentials)
    if payload is None:
        return None

    user = await sync_supabase_user(
        connection,
        user_id=UUID(str(payload["sub"])),
        email=str(payload["email"]),
    )
    return user if user["is_active"] else None


async def get_current_active_user(user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    return user


def require_roles(allowed_roles: Sequence[UserRole]) -> Callable[..., Any]:
    allowed = set(allowed_roles)

    async def role_dependency(user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
        if user["role"] not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
        return user

    return role_dependency
