"""Application settings loaded from environment variables."""

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ — parent of app/
BACKEND_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PIPELINE_PATH = BACKEND_ROOT / "pipeline" / "serverpulse.pipe"


class Settings(BaseSettings):
    """Runtime configuration for the FastAPI service."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    rocketride_uri: str = Field(alias="ROCKETRIDE_URI")
    rocketride_apikey: str = Field(alias="ROCKETRIDE_APIKEY")
    cors_origins: str = Field(
        default="http://localhost:5173",
        alias="CORS_ORIGINS",
    )
    pipeline_path: Path = Field(default=DEFAULT_PIPELINE_PATH)
    max_upload_bytes: int = Field(default=26_214_400, alias="MAX_UPLOAD_BYTES")
    max_files: int = Field(default=20, alias="MAX_FILES")
    analysis_timeout_seconds: int = Field(
        default=120,
        alias="ANALYSIS_TIMEOUT_SECONDS",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
