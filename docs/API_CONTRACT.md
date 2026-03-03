# Chompy API Contract (Current Single Source)

Last updated: 2026-03-03 (CST)

This document defines currently active contracts used by mobile and backend.

## Base URL Resolution (Mobile)

Mobile reads Expo `extra` values from `app.config.js`.

Priority:
1. `CHOMPY_APP_ENV` -> `development | staging | production`
2. Environment-specific URL from:
   - `CHOMPY_API_BASE_URL_DEV`
   - `CHOMPY_API_BASE_URL_STAGING`
   - `CHOMPY_API_BASE_URL_PROD`
3. Development fallback: infer Expo host (`http://<expo-host>:8000`) when available.
4. Final fallback: `http://127.0.0.1:8000`.

## Endpoints

### `GET /api/health`

Response:

```json
{
  "status": "ok",
  "service": "chompy-api"
}
```

### `POST /api/images/upload`

Request (`application/json`):

```json
{
  "imageBase64": "...",
  "contentType": "image/jpeg | image/png | image/webp"
}
```

Notes:
- Legacy multipart upload path is removed from mobile client.
- `contentType` must match payload bytes.
- Decoded payload size limit is 5 MiB.

Success response shape:

```json
{
  "id": "<uuid>",
  "imageUrl": "/uploads/<file>",
  "filename": "<name>",
  "contentType": "image/png",
  "sizeBytes": 12345,
  "createdAt": "<iso8601>"
}
```

### `POST /api/diagnostics`

Request (`application/json`):

```json
{
  "imageUrl": "/uploads/<file>"
}
```

Response shape:

```json
{
  "id": "<uuid>",
  "imageUrl": "/uploads/<file>",
  "diagnosis": "cavity | wisdom_tooth | plaque | gum_disease | healthy",
  "severity": "none | mild | moderate | severe",
  "description": "...",
  "recommendation": "...",
  "createdAt": "<iso8601>"
}
```

## Error Semantics

| Endpoint | Status | Meaning | Client action |
|---|---|---|---|
| `/api/images/upload` | 400 | Invalid payload / format mismatch / unsupported type | Ask user to retake and re-upload |
| `/api/images/upload` | 413 | Decoded image exceeds 5 MiB | Ask user to compress or retake |
| `/api/images/upload` | 5xx | Server failure | Retry later, show generic error |
| `/api/diagnostics` | 4xx/5xx | Request invalid or server failure | Retry with diagnostics request context |

## Versioning Policy (Current)

Current contract versioning is implicit and repo-based.

Temporary rule until formal API versioning is introduced:
1. Additive fields are allowed when mobile can ignore unknown keys.
2. Removing/renaming existing fields requires coordinated mobile/backend release.
3. Contract changes must update this document in the same PR.
