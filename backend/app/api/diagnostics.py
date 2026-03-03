"""Mock diagnostics API endpoint for minimum end-to-end flow."""

# ruff: noqa: UP045

from datetime import datetime, timezone
from typing import Literal, Optional
from uuid import uuid4

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field

router = APIRouter(prefix="/api", tags=["diagnostics"])


class DiagnosticRequest(BaseModel):
    """Request payload for diagnostics endpoint."""

    model_config = ConfigDict(populate_by_name=True)

    image_url: Optional[str] = Field(default=None, alias="imageUrl")


class DiagnosticResult(BaseModel):
    """Minimal diagnostic result payload consumed by mobile app."""

    model_config = ConfigDict(populate_by_name=True)

    id: str
    image_url: str = Field(alias="imageUrl")
    diagnosis: Literal["cavity", "wisdom_tooth", "plaque", "gum_disease", "healthy"]
    severity: Literal["none", "mild", "moderate", "severe"]
    description: str
    recommendation: str
    created_at: str = Field(alias="createdAt")


@router.post("/diagnostics", response_model=DiagnosticResult)
async def create_mock_diagnostic(
    payload: Optional[DiagnosticRequest] = None,
) -> DiagnosticResult:
    """Return a deterministic mock diagnosis without image processing."""
    now = datetime.now(timezone.utc).isoformat()  # noqa: UP017
    image_url = payload.image_url if payload and payload.image_url else None
    return DiagnosticResult(
        id=str(uuid4()),
        imageUrl=image_url or "https://example.com/mock/dental-image.jpg",
        diagnosis="cavity",
        severity="mild",
        description="Potential early-stage cavity detected on molar surface.",
        recommendation="Schedule a dental checkup within 2-4 weeks.",
        createdAt=now,
    )
