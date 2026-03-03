# Error Handling

> Exception handling conventions for the Chompy FastAPI backend.

---

## Overview

1. Define custom exception classes for each error domain.
2. Register global exception handlers in `main.py`.
3. API routes raise exceptions — handlers convert to HTTP responses.
4. Services raise domain exceptions — never return HTTP status codes.

---

## Error Types

```python
# app/exceptions.py

class ChompyError(Exception):
    """Base exception for all Chompy errors."""
    def __init__(self, message: str, detail: str | None = None):
        self.message = message
        self.detail = detail
        super().__init__(message)

class NotFoundError(ChompyError):
    """Resource not found."""

class ValidationError(ChompyError):
    """Input validation failed."""

class StorageError(ChompyError):
    """S3/MinIO storage operation failed."""

class LLMError(ChompyError):
    """LLM API call failed."""

class BleProtocolError(ChompyError):
    """BLE data protocol error."""
```

---

## Error Handling Patterns

### Global Exception Handlers (in `main.py`)

```python
@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": exc.message})

@app.exception_handler(StorageError)
async def storage_handler(request: Request, exc: StorageError) -> JSONResponse:
    logger.error(f"Storage error: {exc.message}", exc_info=True)
    return JSONResponse(status_code=502, content={"detail": "Storage service error"})

@app.exception_handler(LLMError)
async def llm_handler(request: Request, exc: LLMError) -> JSONResponse:
    logger.error(f"LLM error: {exc.message}", exc_info=True)
    return JSONResponse(status_code=502, content={"detail": "AI service temporarily unavailable"})
```

### Service Layer Pattern

```python
# GOOD — service raises domain exception
async def get_scan(scan_id: uuid.UUID) -> Scan:
    scan = await repo.find(scan_id)
    if scan is None:
        raise NotFoundError(f"Scan {scan_id} not found")
    return scan
```

---

## API Error Responses

| Exception | HTTP Status | When |
|-----------|------------|------|
| `NotFoundError` | 404 | Resource doesn't exist |
| `ValidationError` | 422 | Invalid input data |
| `StorageError` | 502 | S3/MinIO failure |
| `LLMError` | 502 | LLM provider failure |
| `PermissionError` | 403 | Unauthorized action |
| Unhandled `Exception` | 500 | Unexpected server error |

Standard response format:

```json
{"detail": "Human-readable error message"}
```

---

## Common Mistakes

- Bare `except:` or `except Exception: pass` — swallowing errors.
- Returning error info in 200 responses.
- Raising `HTTPException` in service layer code.
- Exposing database error messages to clients.
- Silently ignoring errors (must log and re-raise or handle explicitly).
- Logging without `exc_info=True` for exceptions.
