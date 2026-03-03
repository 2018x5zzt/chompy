"""Chompy API - Smart Dental Health Monitor Backend."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.diagnostics import router as diagnostics_router
from app.api.health import router as health_router
from app.api.images import router as images_router
from app.config import get_settings


def _parse_cors_origins(raw_origins: str) -> list[str]:
    """Parse CORS origins from a comma-separated string."""
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
    )
    uploads_dir = Path(__file__).resolve().parent / "data" / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    application.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    # CORS middleware
    origins = _parse_cors_origins(settings.cors_origins)
    # Browsers reject wildcard CORS with credentials enabled.
    allow_credentials = "*" not in origins
    application.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    application.include_router(health_router)
    application.include_router(diagnostics_router)
    application.include_router(images_router)

    return application


app = create_app()
