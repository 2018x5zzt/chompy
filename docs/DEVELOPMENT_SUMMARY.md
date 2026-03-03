# Chompy Development Summary

Last updated: 2026-03-03 (CST)
Audience: product owner, hardware/firmware engineers, mobile/backend developers, deployment operators.

## 1. Project Capability Progress (Product View)

Current stage: software chain is runnable, hardware chain is not fully integrated yet.

Implemented now:
1. Mobile app scaffold and navigation (`Home`, `History`) are running under Expo.
2. Backend scaffold is running under FastAPI + Docker with health/upload/diagnostics APIs.
3. Mobile upload contract is unified to JSON (`imageBase64 + contentType`) and old multipart upload path is removed.
4. API base URL is environment-driven (`app.config.js` + Expo `extra`), so mobile is no longer hardcoded to localhost.
5. Client-side 400/413 error branching is implemented for upload failures.
6. A development-ready BLE entry flow exists (scan/connect/disconnect UI + service abstraction), currently backed by a mock adapter.

Not implemented yet:
1. Real BLE stack integration (`react-native-ble-plx` adapter + platform permissions).
2. Hardware-captured image transfer and reassembly pipeline.
3. History data lifecycle (real source, persistence, sync policy).
4. Real LLM vision diagnostic workflow (diagnostics endpoint is still deterministic mock behavior).

## 2. Runtime Architecture

```text
Hardware (planned BLE image source)
  -> Mobile App (Expo/React Native)
  -> Backend API (FastAPI)
  -> Diagnostics output (mock now, LLM later)
```

## 3. Key Contracts and Environment

Contract single source:
- `docs/API_CONTRACT.md`

Hardware integration and BLE guidance:
- `docs/HARDWARE_INTEGRATION_AND_SELECTION.md`

Server migration checklist:
- `docs/SERVER_MIGRATION_RUNBOOK.md`

Feature-level status matrix:
- `docs/FEATURE_STATUS_MATRIX.md`

## 4. Code-Level Status Notes

### 4.1 Mobile

- `mobile/src/screens/HomeScreen.tsx`
  - Contains BLE controls (scan/connect/disconnect) and upload+diagnose flow.
  - Upload call uses JSON contract only.
  - Error messages branch explicitly for 400 and 413.
- `mobile/src/services/ble.ts`
  - Provides stable BLE service interface and default mock adapter.
  - Prepared for swapping in a real BLE adapter with unchanged app-facing API.
- `mobile/src/constants/index.ts` + `mobile/app.config.js`
  - Resolve environment-specific API base URLs from Expo config.

### 4.2 Backend

- `backend/app/api/images.py`
  - Accepts JSON payload and validates content type, structure, and size limit.
- `backend/app/api/diagnostics.py`
  - Returns typed diagnostic payload (mock behavior currently).
- `backend/app/main.py`
  - Mounts static uploads and exposes API routers.

## 5. Verification Evidence (This Iteration)

Validated on 2026-03-03 (CST):
1. `cd mobile && npx tsc --noEmit` -> pass.
2. `cd backend && pytest -q tests/test_app.py` -> `14 passed`.
3. `cd backend && ruff check app tests` -> pass.
4. `cd backend && mypy app` -> pass.

## 6. Delivery Readiness Gates

Minimum gate for initial hardware-coupled demo:
1. Replace mock BLE adapter with real BLE adapter and pass iOS/Android scan/connect/disconnect tests.
2. Achieve one full real-device image capture -> upload -> diagnostics flow.
3. Collect real runtime evidence for at least one upload 400 case and one 413 case.
4. Run one server migration rehearsal using `docs/SERVER_MIGRATION_RUNBOOK.md` and capture rollback evidence.

## 7. Scope of This Document

This file is a summary and index. Detailed normative guidance is split into dedicated docs:
- API semantics and evolution: `docs/API_CONTRACT.md`
- Hardware choices and integration protocol direction: `docs/HARDWARE_INTEGRATION_AND_SELECTION.md`
- Server migration SOP: `docs/SERVER_MIGRATION_RUNBOOK.md`
- Product capability progress: `docs/FEATURE_STATUS_MATRIX.md`
