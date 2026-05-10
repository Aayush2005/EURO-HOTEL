from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, field_validator

from app.users.service import UserRole


class AuthenticatedUser(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str | None = None
    phone: str | None = None
    role: UserRole
    is_active: bool
    created_at: datetime
    last_login_at: datetime | None = None


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    phone: str | None = None

    @field_validator("phone", mode="before")
    @classmethod
    def clean_phone(cls, v: object) -> str | None:
        if v is None or v == "":
            return None
        if not isinstance(v, str):
            raise ValueError("Phone must be a string")
        cleaned = v.strip()
        if len(cleaned) > 20:
            raise ValueError("Phone number too long")
        return cleaned
