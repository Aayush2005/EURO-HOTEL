from fastapi import Header, HTTPException, status
from app.config import settings

def ApiKeyAuth(
    x_api_key: str | None = Header(default=None),
):
    provided_key = (x_api_key or "").strip()
    expected_key = (settings.api_key or "").strip()

    if not provided_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key missing"
        )

    if not expected_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server API key not configured"
        )

    if provided_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key"
        )

    return True