# Logging Guidelines

> Structured logging conventions for the Chompy backend.

---

## Overview

Use Python's built-in `logging` module. One logger per module, structured JSON format in production.

---

## Setup

```python
import logging

logger = logging.getLogger(__name__)
```

---

## Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| `DEBUG` | Detailed diagnostics (request payloads, config values) | `logger.debug(f"Processing image: {image_id}")` |
| `INFO` | Key milestones, successful operations | `logger.info(f"Scan {scan_id} completed in {duration}ms")` |
| `WARNING` | Recoverable issues, deprecation | `logger.warning(f"LLM retry {attempt}/3")` |
| `ERROR` | Failures needing attention | `logger.error(f"S3 upload failed: {err}", exc_info=True)` |
| `CRITICAL` | System-level unrecoverable failures | `logger.critical("Database connection pool exhausted")` |

---

## Structured Logging

JSON format for production:

```python
import json
from datetime import datetime, timezone

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_data)
```

---

## What to Log

- API request start/end with duration.
- LLM API calls (model, latency, token count — never the API key).
- Database query failures.
- S3 upload/download operations.
- Authentication events.
- Error recovery actions.

Always include contextual identifiers:

```python
# GOOD — includes context
logger.info(f"Diagnostic complete: scan_id={scan_id} diagnosis={result.diagnosis}")

# BAD — no context
logger.info("Diagnostic complete")
```

---

## What NOT to Log

- API keys, tokens, passwords, or secrets.
- Full image binary data.
- Personal health information (PHI) in plain text.
- Sensitive user data.

---

## Error Logging

Always include `exc_info=True` for exceptions:

```python
try:
    result = await llm_client.analyze(image_url)
except Exception as e:
    logger.error(f"LLM analysis failed for scan {scan_id}: {e}", exc_info=True)
    raise LLMError(f"Analysis failed: {e}") from e
```

---

## Common Mistakes

- Using `print()` instead of `logger.*()`.
- Missing `exc_info=True` on error logs.
- Logging secrets or sensitive data.
- No contextual identifiers in log messages.
- Using root logger instead of `logging.getLogger(__name__)`.
