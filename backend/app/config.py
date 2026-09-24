from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


ENV_FILE = Path(__file__).resolve().parents[1] / ".env"


class Settings(BaseSettings):
    database_url: str = Field(..., alias="DATABASE_URL")
    supabase_url: AnyHttpUrl = Field(..., alias="SUPABASE_URL")
    supabase_jwt_secret: str = Field(default="", alias="SUPABASE_JWT_SECRET")

    hdfc_api_key: str = Field(default="", alias="HDFC_API_KEY")
    hdfc_merchant_id: str = Field(default="", alias="HDFC_MERCHANT_ID")
    hdfc_base_url: str = Field(default="", alias="HDFC_BASE_URL")
    hdfc_payment_page_client_id: str = Field(default="hdfcmaster", alias="HDFC_PAYMENT_PAGE_CLIENT_ID")
    hdfc_response_key: str = Field(alias="HDFC_RESPONSE_KEY")
    hdfc_reseller_id: str = Field(default="hdfc_reseller", alias="HDFC_RESELLER_ID")
    hdfc_enable_logging: bool = Field(default=False, alias="HDFC_ENABLE_LOGGING")

    smtp_host: str = Field(default="", alias="SMTP_HOST")
    smtp_port: int = Field(default=587, alias="SMTP_PORT")
    smtp_username: str = Field(default="", alias="SMTP_USERNAME")
    smtp_password: str = Field(default="", alias="SMTP_PASSWORD")
    otp_expire_minutes: int = Field(default=10, alias="OTP_EXPIRE_MINUTES")

    # WhatsApp Cloud API. Empty values make every send a logged no-op, so the
    # app is safe to deploy before the templates are approved.
    whatsapp_token: str = Field(default="", alias="META_API_KEY")
    whatsapp_phone_number_id: str = Field(default="", alias="WHATSAPP_PHONE_NUMBER_ID")
    whatsapp_internal_number: str = Field(default="", alias="WHATSAPP_INTERNAL_NUMBER")
    whatsapp_api_version: str = Field(default="v23.0", alias="WHATSAPP_API_VERSION")
    whatsapp_template_lang: str = Field(default="en", alias="WHATSAPP_TEMPLATE_LANG")
    wa_tpl_room_guest: str = Field(default="", alias="WA_TPL_ROOM_GUEST")
    wa_tpl_room_staff: str = Field(default="", alias="WA_TPL_ROOM_STAFF")
    wa_tpl_table_guest: str = Field(default="", alias="WA_TPL_TABLE_GUEST")
    wa_tpl_table_staff: str = Field(default="", alias="WA_TPL_TABLE_STAFF")
    wa_tpl_contact_staff: str = Field(default="", alias="WA_TPL_CONTACT_STAFF")

    environment: str = Field(default="development", alias="ENVIRONMENT")
    debug: bool = Field(default=False, alias="DEBUG")
    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")
    backend_url: str = Field(default="http://localhost:8000", alias="BACKEND_URL")

    db_pool_min_size: int = Field(default=1, alias="DB_POOL_MIN_SIZE")
    db_pool_max_size: int = Field(default=10, alias="DB_POOL_MAX_SIZE")

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @property
    def supabase_auth_issuer(self) -> str:
        return f"{str(self.supabase_url).rstrip('/')}/auth/v1"

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, value: object) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.strip().lower() in {"1", "true", "yes", "on", "debug", "development"}
        return False

    @property
    def allowed_origins(self) -> List[str]:
        base = self.frontend_url.rstrip("/")
        origins = [base]

        # Also allow the www <-> apex counterpart so both variants work
        from urllib.parse import urlparse
        parsed = urlparse(base)
        host = parsed.hostname or ""
        if host.startswith("www."):
            apex = f"{parsed.scheme}://{host[4:]}"
            origins.append(apex)
        elif host and not host.startswith("www."):
            www = f"{parsed.scheme}://www.{host}"
            origins.append(www)

        # Allow localhost variants during development
        if self.environment != "production":
            origins += ["http://localhost:3000", "http://127.0.0.1:3000"]

        return origins


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
