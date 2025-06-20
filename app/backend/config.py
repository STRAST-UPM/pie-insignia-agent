"""
Configuration management for the ISST AI Tutor application.
Centralizes all configuration values and environment variables.
"""

from typing import Optional, List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with validation."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False
    )
    
    # OpenAI Configuration
    openai_api_key: str
    vector_store_id: str
      # Supabase Configuration
    supabase_url: str
    supabase_service_role_key: str
      # Application Configuration
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    debug: bool = False
    cors_origins: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    
    @field_validator('openai_api_key')
    @classmethod
    def validate_openai_key(cls, v: str) -> str:
        if not v or not v.startswith('sk-'):
            raise ValueError('Invalid OpenAI API key format')
        return v
    
    @field_validator('vector_store_id')
    @classmethod
    def validate_vector_store_id(cls, v: str) -> str:
        if not v or not v.startswith('vs_'):
            raise ValueError('Invalid vector store ID format')
        return v
    
    @field_validator('supabase_url')
    @classmethod
    def validate_supabase_url(cls, v: str) -> str:
        if not v or not v.startswith('https://'):
            raise ValueError('Invalid Supabase URL format')
        return v


def get_settings() -> Settings:
    """Get application settings."""
    return Settings()
