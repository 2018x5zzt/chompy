# Quality Guidelines

> Code quality standards for the Chompy Python backend.

---

## Overview

Quality is enforced through automated tooling and code metrics. All checks must pass before code is merged.

---

## Tooling

| Tool | Purpose | Config |
|------|---------|--------|
| ruff | Linting + formatting | `pyproject.toml` |
| mypy | Static type checking | `pyproject.toml` |
| pytest | Testing | `pyproject.toml` |

### Current Configuration

```toml
[tool.ruff]
target-version = "py311"
line-length = 88

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP"]

[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_configs = true

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
```

### Pre-Commit Commands

```bash
cd backend
ruff check .          # Lint
ruff format --check . # Format check
mypy app/             # Type check
pytest                # Tests (60s hard timeout)
```

All four must pass. No exceptions.

---

## Required Patterns

- **Full type annotations** on every function (parameters + return type).
- Use `X | None` over `Optional[X]` (Python 3.11+).
- **Module-level logger**: `logger = logging.getLogger(__name__)`.
- **Import order**: stdlib → third-party → local (enforced by ruff `I`).
- **Docstrings** on all public functions and classes.

```python
# GOOD
async def analyze_image(image_url: str, model: str = "gpt-4o") -> DiagnosticResult:
    """Analyze a dental image and return diagnostic result."""
    ...

# FORBIDDEN — missing types
async def analyze_image(image_url, model="gpt-4o"):
    ...
```

---

## Forbidden Patterns

- `print()` statements — use `logging` module.
- `# type: ignore` without explanation comment.
- Mutable default arguments: `def foo(items=[])`.
- Global mutable state.
- Unused imports.
- Magic numbers — extract to named constants.
- `Any` type without justification.
- Bare `except:` clauses.

---

## Code Metrics (Hard Limits)

| Metric | Limit |
|--------|-------|
| Function length | 50 lines (excluding blanks) |
| File size | 300 lines |
| Nesting depth | 3 levels (use early returns) |
| Parameters | 3 positional (more → config object) |
| Cyclomatic complexity | 10 per function |

---

## Testing Requirements

### Structure

```
tests/
├── __init__.py
├── conftest.py          # Shared fixtures
├── test_health.py       # API endpoint tests
├── test_services/       # Service layer tests
└── test_workflows/      # LLM workflow tests
```

### Conventions

- Test files: `test_{module}.py`.
- Test functions: `test_{behavior}_when_{condition}`.
- Use `httpx.AsyncClient` for API tests.
- Hard timeout: 60 seconds per test.

```python
async def test_health_returns_ok():
    async with httpx.AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
```

---

## Code Review Checklist

- [ ] Type annotations complete
- [ ] No forbidden patterns
- [ ] File/function size within limits
- [ ] Tests cover happy path + error cases
- [ ] Secrets not hardcoded
- [ ] Logging at appropriate levels
- [ ] Error handling follows project conventions
