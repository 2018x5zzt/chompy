"""Image upload API endpoints."""

# ruff: noqa: UP045

import base64
import binascii
import zlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from uuid import uuid4

import anyio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field

router = APIRouter(prefix="/api", tags=["images"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "data" / "uploads"
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
MAX_BASE64_CHARS = ((MAX_UPLOAD_BYTES + 2) // 3) * 4
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
JPEG_SOF_MARKERS = {
    0xC0,
    0xC1,
    0xC2,
    0xC3,
    0xC5,
    0xC6,
    0xC7,
    0xC9,
    0xCA,
    0xCB,
    0xCD,
    0xCE,
    0xCF,
}


class UploadImageRequest(BaseModel):
    """Request payload for image upload endpoint."""

    model_config = ConfigDict(populate_by_name=True)

    image_base64: Optional[str] = Field(default=None, alias="imageBase64")
    filename: Optional[str] = None
    content_type: Optional[str] = Field(default=None, alias="contentType")


class UploadedImage(BaseModel):
    """Image upload metadata returned to mobile."""

    model_config = ConfigDict(populate_by_name=True)

    id: str
    image_url: str = Field(alias="imageUrl")
    filename: str
    content_type: str = Field(alias="contentType")
    size_bytes: int = Field(alias="sizeBytes")
    created_at: str = Field(alias="createdAt")


def _decode_image(image_base64: str) -> bytes:
    normalized = image_base64
    if "base64," in normalized:
        normalized = normalized.split("base64,", maxsplit=1)[1]
    normalized = "".join(normalized.split())
    if len(normalized) > MAX_BASE64_CHARS:
        raise HTTPException(status_code=413, detail="Image payload is too large")
    try:
        return base64.b64decode(normalized, validate=True)
    except binascii.Error as exc:
        raise HTTPException(
            status_code=400,
            detail="Invalid base64 image payload",
        ) from exc


def _detect_image_content_type(image_bytes: bytes) -> str:
    if image_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        if _is_valid_png(image_bytes):
            return "image/png"
        raise HTTPException(status_code=400, detail="Invalid image payload")
    if image_bytes.startswith(b"\xFF\xD8\xFF"):
        if _is_valid_jpeg(image_bytes):
            return "image/jpeg"
        raise HTTPException(status_code=400, detail="Invalid image payload")
    if image_bytes.startswith(b"RIFF") and image_bytes[8:12] == b"WEBP":
        if _is_valid_webp(image_bytes):
            return "image/webp"
        raise HTTPException(status_code=400, detail="Invalid image payload")
    raise HTTPException(status_code=400, detail="Unsupported image format")


def _extension_for_content_type(content_type: str) -> str:
    return ALLOWED_IMAGE_TYPES[content_type]


def _is_valid_png(image_bytes: bytes) -> bool:
    if len(image_bytes) < 33:
        return False
    offset = 8
    saw_ihdr = False
    while offset + 12 <= len(image_bytes):
        chunk_length = int.from_bytes(image_bytes[offset : offset + 4], "big")
        chunk_type = image_bytes[offset + 4 : offset + 8]
        chunk_data_start = offset + 8
        chunk_data_end = chunk_data_start + chunk_length
        chunk_crc_end = chunk_data_end + 4
        if chunk_crc_end > len(image_bytes):
            return False

        chunk_data = image_bytes[chunk_data_start:chunk_data_end]
        actual_crc = int.from_bytes(image_bytes[chunk_data_end:chunk_crc_end], "big")
        computed_crc = zlib.crc32(chunk_type)
        computed_crc = zlib.crc32(chunk_data, computed_crc) & 0xFFFFFFFF
        if computed_crc != actual_crc:
            return False

        if chunk_type == b"IHDR":
            if saw_ihdr or chunk_length != 13:
                return False
            saw_ihdr = True
        if chunk_type == b"IEND":
            return saw_ihdr and chunk_length == 0 and chunk_crc_end == len(image_bytes)
        offset = chunk_crc_end
    return False


def _is_valid_jpeg(image_bytes: bytes) -> bool:
    if len(image_bytes) < 32:
        return False
    if not image_bytes.startswith(b"\xFF\xD8") or not image_bytes.endswith(b"\xFF\xD9"):
        return False

    offset = 2
    end = len(image_bytes)
    saw_sof = False
    saw_sos = False
    while offset < end:
        if image_bytes[offset] != 0xFF:
            return False
        while offset < end and image_bytes[offset] == 0xFF:
            offset += 1
        if offset >= end:
            return False
        marker = image_bytes[offset]
        offset += 1

        if marker == 0xD9:
            return saw_sof and saw_sos and offset == end
        if marker == 0xDA:
            saw_sos = True
            if offset + 2 > end:
                return False
            segment_length = int.from_bytes(image_bytes[offset : offset + 2], "big")
            if segment_length < 2 or offset + segment_length > end:
                return False
            offset += segment_length
            scan_data_start = offset
            while offset + 1 < end:
                if image_bytes[offset] == 0xFF:
                    next_byte = image_bytes[offset + 1]
                    if next_byte == 0x00:
                        offset += 2
                        continue
                    if 0xD0 <= next_byte <= 0xD7:
                        offset += 2
                        continue
                    if next_byte == 0xD9:
                        return (
                            saw_sof
                            and offset > scan_data_start
                            and offset + 2 == end
                        )
                offset += 1
            return False
        if 0xD0 <= marker <= 0xD7 or marker == 0x01:
            return False

        if offset + 2 > end:
            return False
        segment_length = int.from_bytes(image_bytes[offset : offset + 2], "big")
        if segment_length < 2 or offset + segment_length > end:
            return False
        if marker in JPEG_SOF_MARKERS:
            saw_sof = True
        offset += segment_length
    return False


def _is_valid_webp(image_bytes: bytes) -> bool:
    if len(image_bytes) < 20:
        return False
    if not image_bytes.startswith(b"RIFF") or image_bytes[8:12] != b"WEBP":
        return False
    riff_size = int.from_bytes(image_bytes[4:8], "little")
    if riff_size + 8 != len(image_bytes):
        return False

    offset = 12
    saw_image_chunk = False
    while offset + 8 <= len(image_bytes):
        chunk_tag = image_bytes[offset : offset + 4]
        chunk_size = int.from_bytes(image_bytes[offset + 4 : offset + 8], "little")
        chunk_data_start = offset + 8
        chunk_data_end = chunk_data_start + chunk_size
        padded_chunk_end = chunk_data_end + (chunk_size % 2)
        if padded_chunk_end > len(image_bytes):
            return False

        chunk_data = image_bytes[chunk_data_start:chunk_data_end]
        if chunk_tag == b"VP8 ":
            if not _is_valid_vp8_chunk(chunk_data):
                return False
            saw_image_chunk = True
        elif chunk_tag == b"VP8L":
            if not _is_valid_vp8l_chunk(chunk_data):
                return False
            saw_image_chunk = True
        elif chunk_tag == b"VP8X":
            if not _is_valid_vp8x_chunk(chunk_data):
                return False
        offset = padded_chunk_end

    return saw_image_chunk and offset == len(image_bytes)


def _is_valid_vp8_chunk(chunk_data: bytes) -> bool:
    if len(chunk_data) < 10:
        return False
    if chunk_data[3:6] != b"\x9d\x01\x2a":
        return False
    if chunk_data[0] & 0x01 != 0:
        return False
    width = int.from_bytes(chunk_data[6:8], "little") & 0x3FFF
    height = int.from_bytes(chunk_data[8:10], "little") & 0x3FFF
    return width > 0 and height > 0


def _is_valid_vp8l_chunk(chunk_data: bytes) -> bool:
    if len(chunk_data) < 5:
        return False
    if chunk_data[0] != 0x2F:
        return False
    bits = int.from_bytes(chunk_data[1:5], "little")
    width = (bits & 0x3FFF) + 1
    height = ((bits >> 14) & 0x3FFF) + 1
    return width > 0 and height > 0


def _is_valid_vp8x_chunk(chunk_data: bytes) -> bool:
    if len(chunk_data) != 10:
        return False
    canvas_width = int.from_bytes(chunk_data[4:7], "little") + 1
    canvas_height = int.from_bytes(chunk_data[7:10], "little") + 1
    return canvas_width > 0 and canvas_height > 0


@router.post("/images/upload", response_model=UploadedImage)
async def upload_image(payload: Optional[UploadImageRequest] = None) -> UploadedImage:
    """Upload a base64 image payload and return metadata for diagnostics flow."""
    request = payload or UploadImageRequest()
    if not request.image_base64:
        raise HTTPException(status_code=400, detail="imageBase64 is required")

    image_bytes = _decode_image(request.image_base64)
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Image payload is empty")
    if len(image_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image payload is too large")

    detected_content_type = _detect_image_content_type(image_bytes)
    declared_content_type = (
        request.content_type.lower() if request.content_type else None
    )
    if declared_content_type and declared_content_type != detected_content_type:
        raise HTTPException(
            status_code=400,
            detail="contentType does not match image payload",
        )

    upload_id = str(uuid4())
    extension = _extension_for_content_type(detected_content_type)
    filename = f"{upload_id}{extension}"

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    file_path = UPLOAD_DIR / filename
    await anyio.to_thread.run_sync(file_path.write_bytes, image_bytes)

    now = datetime.now(timezone.utc).isoformat()  # noqa: UP017
    return UploadedImage(
        id=upload_id,
        imageUrl=f"/uploads/{filename}",
        filename=filename,
        contentType=detected_content_type,
        sizeBytes=len(image_bytes),
        createdAt=now,
    )
