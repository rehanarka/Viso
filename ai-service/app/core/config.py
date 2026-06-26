from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "VISO AI Service"
    api_prefix: str = "/api"
    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    face_similarity_threshold: float = 0.85
    insightface_model_name: str = "buffalo_l"
    insightface_providers: List[str] = Field(default_factory=lambda: ["CPUExecutionProvider"])

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
