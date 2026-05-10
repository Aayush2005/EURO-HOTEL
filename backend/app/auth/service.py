from typing import Any
from uuid import UUID

import httpx
from jose import JWTError, jwt

from app.config import settings


AUTHENTICATED_AUDIENCE = "authenticated"
ALLOWED_ALGORITHMS = {"ES256", "RS256"}

# Cache populated at startup via load_jwks()
_jwks: dict[str, Any] = {"keys": []}


async def load_jwks() -> None:
    global _jwks
    url = f"{str(settings.supabase_url).rstrip('/')}/auth/v1/.well-known/jwks.json"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        _jwks = resp.json()


def verify_supabase_jwt(token: str) -> dict[str, Any] | None:
    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg")
        kid = header.get("kid")

        # Reject any algorithm not in the JWKS allowlist — prevents HS256 confusion attacks
        if alg not in ALLOWED_ALGORITHMS:
            return None

        matching_key = next(
            (k for k in _jwks.get("keys", []) if k.get("kid") == kid),
            None,
        )
        if matching_key is None:
            return None

        payload = jwt.decode(
            token,
            matching_key,
            algorithms=[alg],
            audience=AUTHENTICATED_AUDIENCE,
            issuer=settings.supabase_auth_issuer,
        )

    except JWTError:
        return None

    subject = payload.get("sub")
    email = payload.get("email")
    token_role = payload.get("role")

    if not subject or not email or token_role != AUTHENTICATED_AUDIENCE:
        return None

    try:
        UUID(str(subject))
    except ValueError:
        return None

    return payload
