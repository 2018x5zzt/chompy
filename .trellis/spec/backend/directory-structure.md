# Directory Structure

> How backend code is organized in the Chompy project.

---

## Overview

The backend follows a layered architecture with clear separation between HTTP handling, business logic, data models, and LLM workflows. All code lives under `backend/app/`.

---

## Directory Layout

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py             # FastAPI app factory + middleware registration
│   ├── config.py           # Pydantic Settings (env-driven configuration)
│   ├── api/                # HTTP layer — routers only
│   │   ├── __init__.py
│   │   └── health.py       # GET /api/health
│   ├── services/           # Business logic (no HTTP awareness)
│   │   └── __init__.py
│   ├── models/             # SQLAlchemy ORM models
│   │   └── __init__.py
│   └── workflows/          # LLM processing pipelines
│       └── __init__.py
├── tests/
│   └── __init__.py
├── Dockerfile              # Multi-stage build (python:3.11-slim)
├── pyproject.toml          # Dependencies + ruff/mypy/pytest config
├── .env.example            # Environment variable template
└── README.md
```

---

## Module Responsibilities

### `app/main.py` — Application Factory

Creates and configures the FastAPI instance. Registers CORS middleware and includes all API routers. **No business logic here** — only app wiring.

```python
def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(title=settings.app_name, version=settings.app_version)
    application.add_middleware(CORSMiddleware, allow_origins=origins, ...)
    application.include_router(health_router)
    return application

app = create_app()
```

### `app/config.py` — Configuration

Single `Settings` class using `pydantic-settings`. All config loaded from environment variables or `.env` file. **Never hardcode secrets.**

### `app/api/` — HTTP Layer

- One file per resource domain (e.g., `health.py`, `images.py`, `diagnostics.py`).
- Each file exports an `APIRouter`.
- Routers handle request/response only — delegate to `services/`.
- All routes prefixed with `/api/`.

### `app/services/` — Business Logic

- Pure Python classes/functions with no HTTP awareness.
- Receives typed inputs, returns typed outputs.
- Injected via FastAPI `Depends()`.

### `app/models/` — Database Models

- SQLAlchemy ORM models. One file per domain entity.
- Migrations managed separately (Alembic).

### `app/workflows/` — LLM Pipelines

- Dental image analysis workflows. Modular design for swapping LLM providers.
- Each workflow is a standalone async callable.

---

## Module Organization

New features follow this pattern:

1. Add model in `models/{feature}.py`.
2. Add service in `services/{feature}.py`.
3. Add router in `api/{feature}.py`.
4. Register router in `main.py`.

---

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files | `snake_case.py` | `diagnostic_result.py` |
| Classes | `PascalCase` | `DiagnosticService` |
| Functions | `snake_case` | `analyze_image()` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_IMAGE_SIZE_MB` |
| Router files | Resource name | `images.py`, `diagnostics.py` |

---

## Rules

1. **No circular imports** — `api` → `services` → `models`. Never reverse.
2. **One router per file** — keep API files focused.
3. **Config via DI** — use `Depends(get_settings)`, never import settings directly in services.
4. **File limit**: 300 lines max. Split by responsibility when exceeded.
