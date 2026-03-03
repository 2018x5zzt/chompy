# Chompy

Smart Dental Health Monitor (hardware + mobile app + backend) for dental image capture and diagnosis workflow.

Last updated: 2026-03-03 (CST)

## 1. Project Overview

Chompy is designed as a three-layer system:
1. Hardware device: intraoral imaging device (BLE transfer).
2. Mobile app: scan/connect device, receive image payload, upload image, show diagnosis result.
3. Backend service: validate image payload, store upload, return diagnostic result (current path is mock diagnostics output).

Current architecture:

```text
Hardware (BLE)
  -> Mobile App (Expo / React Native)
  -> Backend API (FastAPI)
  -> Diagnostics Result
```

## 2. Current Execution Status (Project Reality)

As of now:
1. Root branch `main` is initialized and pushed to GitHub.
2. Software path is runnable: upload + diagnostics API chain is available.
3. Hardware path is partially ready: BLE app entry is implemented with mock adapter; real BLE stack integration is pending.
4. Migration runbook and hardware integration guidance are published.

Latest verified commit examples:
- `574bb2c`: initial project bootstrap + docs + API/contract alignment.
- `5961325`: documentation update with execution snapshot and validation records.

## 3. What Is Implemented vs Not Implemented

Implemented:
1. Mobile scaffold (`Home` / `History`) with TypeScript strict checks.
2. Backend scaffold (`/api/health`, `/api/images/upload`, `/api/diagnostics`) with Docker support.
3. Upload contract unified to JSON `{ imageBase64, contentType }`.
4. API base URL environmentization (`app.config.js` + Expo `extra`).
5. Client-side 400/413 branching for upload failures.
6. Development-ready BLE service abstraction (scan/connect/disconnect UI + mock adapter).

Not implemented yet:
1. Real BLE adapter (`react-native-ble-plx`) and platform permission flow.
2. Real hardware frame capture + BLE transfer + reassembly runtime evidence.
3. History data lifecycle (real persistence/sync path).
4. Real LLM vision diagnostic workflow (current diagnostics endpoint is deterministic/mock-style output).

## 4. Repository Structure

```text
chompy/
├── mobile/                    # Expo React Native app
├── backend/                   # FastAPI backend
├── docs/                      # Project docs (contracts/runbooks/status)
├── .trellis/                  # Trellis workflow/spec context
├── docker-compose.yml         # Local stack (backend + postgres + minio)
├── PROJECT.md                 # Product and architecture intent
├── AGENTS.md                  # Agent instructions
└── README.md                  # This file
```

## 5. Documentation Index

Core docs:
1. `docs/DEVELOPMENT_SUMMARY.md` - Execution snapshot + validation record + delivery gates.
2. `docs/FEATURE_STATUS_MATRIX.md` - Product capability status matrix.
3. `docs/API_CONTRACT.md` - Current single source of API contract.
4. `docs/HARDWARE_INTEGRATION_AND_SELECTION.md` - Hardware selection + BLE integration guidance.
5. `docs/SERVER_MIGRATION_RUNBOOK.md` - Server migration and rollback SOP.
6. `docs/DOCUMENTATION_COVERAGE_MATRIX.md` - Documentation coverage matrix.

## 6. Quick Start

### 6.1 Prerequisites

1. Python 3.11+
2. Node.js + npm
3. Docker Engine + Docker Compose plugin

### 6.2 Option A: Run Full Stack with Docker

```bash
cp backend/.env.example backend/.env
docker compose up -d --build
```

Endpoints:
- Backend API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`
- MinIO API/Console: `localhost:9000` / `localhost:9001`

### 6.3 Option B: Backend Local + Mobile Local

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --reload
```

Mobile:

```bash
cd mobile
npm install
npx expo start
```

## 7. Mobile Environment Configuration

Mobile reads `app.config.js` and Expo `extra` values.

Supported env vars:
1. `CHOMPY_APP_ENV` = `development | staging | production`
2. `CHOMPY_API_BASE_URL_DEV`
3. `CHOMPY_API_BASE_URL_STAGING`
4. `CHOMPY_API_BASE_URL_PROD`

Example (dev with LAN IP):

```bash
cd mobile
CHOMPY_APP_ENV=development \
CHOMPY_API_BASE_URL_DEV=http://192.168.31.20:8000 \
npx expo start
```

## 8. API Contract (Current Active)

### 8.1 Health

- `GET /api/health` -> service liveness.

### 8.2 Upload

- `POST /api/images/upload`
- Content-Type: `application/json`
- Request body:

```json
{
  "imageBase64": "...",
  "contentType": "image/jpeg"
}
```

Rules:
1. Only `image/jpeg | image/png | image/webp` are accepted.
2. `contentType` must match real bytes.
3. Decoded image size limit is 5 MiB.
4. Legacy multipart upload path is removed from mobile client.

### 8.3 Diagnostics

- `POST /api/diagnostics`
- Request:

```json
{
  "imageUrl": "/uploads/<file>"
}
```

## 9. Error Semantics (Upload Path)

1. `400`: invalid payload / unsupported or mismatched format -> retake and re-upload.
2. `413`: decoded payload too large (>5 MiB) -> compress/retake before retry.
3. `5xx`: server-side failure -> retry later and inspect backend logs.

## 10. Validation and Quality Commands

Run in current workspace:

```bash
# mobile type check
cd mobile && npx tsc --noEmit

# backend test/lint/type
cd backend && pytest -q tests/test_app.py
cd backend && ruff check app tests
cd backend && mypy app

# Trellis context validation
./.trellis/scripts/task.sh validate .trellis/tasks/03-03-mobile-api-reachability-contract
```

Latest recorded results (2026-03-03):
1. `tsc` pass
2. `pytest` 14 passed
3. `ruff` pass
4. `mypy` pass
5. Trellis validate pass (`implement/check/debug` all green)

## 11. Hardware Integration Entry

If you are starting hardware now, follow this order:
1. Read `docs/HARDWARE_INTEGRATION_AND_SELECTION.md`.
2. Lock BLE GATT and packet schema (`frame_id/chunk_index/total_chunks/crc`).
3. Ensure output is valid JPEG/PNG/WEBP and frame size stays under 5 MiB decoded.
4. Execute real-device evidence plan (`T008`) for BLE + E2E + 400/413 runtime proofs.

## 12. Server Migration Guidance

Current recommendation:
1. You can start migration rehearsal now.
2. Do not do production cutover before rehearsal + rollback + monitoring checks are evidenced.

Required reference:
- `docs/SERVER_MIGRATION_RUNBOOK.md`

Minimum rehearsal bundle:
1. Health and contract smoke (`/api/health`, upload, diagnostics).
2. Negative-path smoke (`400`, `413`).
3. One rollback drill with timestamped logs and results.

## 13. Delivery Gate for Initial Hardware-Coupled Demo (P0)

P0 is considered ready when all are true:
1. Real BLE scan/connect/disconnect works on iOS and Android test devices.
2. Real hardware-captured image completes upload + diagnostics end-to-end.
3. At least one real 400 case and one real 413 case are captured with evidence.
4. One server migration rehearsal passes with rollback test evidence.

## 14. Collaboration and Workflow

- Multi-agent collaboration is managed via CCCC (visible coordination through MCP messages).
- Trellis is used for task context and execution state alignment.
- Key project intent and constraints are tracked in `PROJECT.md`.

## 15. Notes

1. This README is the entry document.
2. Contract-level details should be treated as authoritative in `docs/API_CONTRACT.md`.
3. Migration operations should always follow `docs/SERVER_MIGRATION_RUNBOOK.md`.
