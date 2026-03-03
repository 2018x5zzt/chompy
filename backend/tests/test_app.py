"""Application behavior tests."""

import base64

from fastapi.testclient import TestClient

from app.api import images as images_api
from app.main import create_app

VALID_PNG_BASE64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC"
)


def _preflight(client: TestClient, origin: str):
    return client.options(
        "/api/health",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
        },
    )


def test_health_check() -> None:
    """Health endpoint returns expected payload."""
    client = TestClient(create_app())

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "chompy-api"}


def test_create_mock_diagnostic() -> None:
    """Diagnostics endpoint returns payload expected by mobile client."""
    client = TestClient(create_app())

    response = client.post("/api/diagnostics")

    assert response.status_code == 200
    data = response.json()
    assert data["diagnosis"] == "cavity"
    assert data["severity"] == "mild"
    assert data["recommendation"] == "Schedule a dental checkup within 2-4 weeks."
    assert isinstance(data["id"], str) and data["id"]
    assert isinstance(data["createdAt"], str) and data["createdAt"]


def test_create_mock_diagnostic_with_uploaded_image_url() -> None:
    """Diagnostics should keep uploaded image URL when provided by mobile."""
    client = TestClient(create_app())
    image_url = "/uploads/test-upload.jpg"

    response = client.post("/api/diagnostics", json={"imageUrl": image_url})

    assert response.status_code == 200
    assert response.json()["imageUrl"] == image_url


def test_upload_image_saves_file_and_returns_metadata(tmp_path, monkeypatch) -> None:
    """Upload endpoint stores image bytes and returns image metadata."""
    monkeypatch.setattr(images_api, "UPLOAD_DIR", tmp_path)
    client = TestClient(create_app())
    image_bytes = base64.b64decode(VALID_PNG_BASE64)

    response = client.post(
        "/api/images/upload",
        json={
            "imageBase64": VALID_PNG_BASE64,
            "filename": "scan.png",
            "contentType": "image/png",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["imageUrl"].startswith("/uploads/")
    assert data["contentType"] == "image/png"
    assert data["sizeBytes"] == len(image_bytes)
    assert data["filename"].endswith(".png")

    stored_path = tmp_path / data["filename"]
    assert stored_path.exists()
    assert stored_path.read_bytes() == image_bytes


def test_upload_image_requires_payload(monkeypatch, tmp_path) -> None:
    """Upload endpoint should reject requests with no image payload."""
    monkeypatch.setattr(images_api, "UPLOAD_DIR", tmp_path)
    client = TestClient(create_app())

    response = client.post("/api/images/upload", json={})

    assert response.status_code == 400
    assert response.json()["detail"] == "imageBase64 is required"


def test_upload_image_rejects_content_type_mismatch(monkeypatch, tmp_path) -> None:
    """Upload endpoint should reject mismatched declared content type."""
    monkeypatch.setattr(images_api, "UPLOAD_DIR", tmp_path)
    client = TestClient(create_app())

    response = client.post(
        "/api/images/upload",
        json={
            "imageBase64": VALID_PNG_BASE64,
            "contentType": "image/jpeg",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "contentType does not match image payload"


def test_upload_image_accepts_case_insensitive_content_type(
    monkeypatch,
    tmp_path,
) -> None:
    """Upload endpoint should treat declared MIME type as case-insensitive."""
    monkeypatch.setattr(images_api, "UPLOAD_DIR", tmp_path)
    client = TestClient(create_app())

    response = client.post(
        "/api/images/upload",
        json={
            "imageBase64": VALID_PNG_BASE64,
            "contentType": "Image/PNG",
        },
    )

    assert response.status_code == 200
    assert response.json()["contentType"] == "image/png"


def test_upload_image_rejects_forged_png_signature(monkeypatch, tmp_path) -> None:
    """Upload endpoint rejects payloads with forged image signatures."""
    monkeypatch.setattr(images_api, "UPLOAD_DIR", tmp_path)
    client = TestClient(create_app())
    forged_payload = base64.b64encode(
        b"\x89PNG\r\n\x1a\nnot-a-real-image",
    ).decode("ascii")

    response = client.post(
        "/api/images/upload",
        json={"imageBase64": forged_payload, "contentType": "image/png"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid image payload"


def test_upload_image_rejects_forged_jpeg_signature(monkeypatch, tmp_path) -> None:
    """Upload endpoint rejects minimal forged JPEG payload."""
    monkeypatch.setattr(images_api, "UPLOAD_DIR", tmp_path)
    client = TestClient(create_app())
    forged_jpeg = base64.b64encode(b"\xFF\xD8\xFF\xD9").decode("ascii")

    response = client.post(
        "/api/images/upload",
        json={"imageBase64": forged_jpeg, "contentType": "image/jpeg"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid image payload"


def test_upload_image_rejects_forged_webp_signature(monkeypatch, tmp_path) -> None:
    """Upload endpoint rejects minimal forged WEBP payload."""
    monkeypatch.setattr(images_api, "UPLOAD_DIR", tmp_path)
    client = TestClient(create_app())
    forged_webp = b"RIFF" + (8).to_bytes(4, "little") + b"WEBP" + b"VP8 "

    response = client.post(
        "/api/images/upload",
        json={
            "imageBase64": base64.b64encode(forged_webp).decode("ascii"),
            "contentType": "image/webp",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid image payload"


def test_upload_image_rejects_oversized_base64_payload(monkeypatch, tmp_path) -> None:
    """Upload endpoint rejects oversized base64 payloads before decode."""
    monkeypatch.setattr(images_api, "UPLOAD_DIR", tmp_path)
    client = TestClient(create_app())
    oversized_base64 = "A" * (images_api.MAX_BASE64_CHARS + 4)

    response = client.post(
        "/api/images/upload",
        json={"imageBase64": oversized_base64},
    )

    assert response.status_code == 413
    assert response.json()["detail"] == "Image payload is too large"


def test_upload_image_rejects_invalid_base64(monkeypatch, tmp_path) -> None:
    """Upload endpoint rejects invalid base64 payloads."""
    monkeypatch.setattr(images_api, "UPLOAD_DIR", tmp_path)
    client = TestClient(create_app())

    response = client.post(
        "/api/images/upload",
        json={"imageBase64": "!!!not-base64!!!"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid base64 image payload"


def test_cors_wildcard_disables_credentials(monkeypatch) -> None:
    """Wildcard CORS should not advertise credential support."""
    monkeypatch.setenv("CORS_ORIGINS", "*")
    client = TestClient(create_app())

    response = _preflight(client, "https://mobile.example.com")

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "*"
    assert "access-control-allow-credentials" not in response.headers


def test_cors_specific_origin_enables_credentials(monkeypatch) -> None:
    """Specific origins can safely enable credentials."""
    origin = "https://mobile.example.com"
    monkeypatch.setenv("CORS_ORIGINS", origin)
    client = TestClient(create_app())

    response = _preflight(client, origin)

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin
    assert response.headers["access-control-allow-credentials"] == "true"
