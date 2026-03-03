# Database Guidelines

> PostgreSQL conventions for the Chompy backend.

---

## Overview

| Component | Technology | Version |
|-----------|-----------|---------|
| Database | PostgreSQL | 16 (Alpine) |
| ORM | SQLAlchemy (async) | 2.x |
| Migrations | Alembic | Latest |
| Driver | asyncpg | Latest |
| Connection | docker-compose service | `postgres:5432` |

Database URL is configured via environment variable in `app/config.py`:

```python
class Settings(BaseSettings):
    database_url: str = "postgresql://chompy:chompy@localhost:5432/chompy"
```

For async usage, replace `postgresql://` with `postgresql+asyncpg://` at the engine level.

---

## Model Conventions

### Base Model

All models inherit from a shared declarative base with common columns:

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from datetime import datetime
import uuid

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow
    )

class BaseModel(TimestampMixin, Base):
    __abstract__ = True
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
```

### Example Model

```python
class Scan(BaseModel):
    __tablename__ = "scans"
    image_url: Mapped[str]
    diagnosis_type: Mapped[str | None]
    severity: Mapped[str | None]
    description: Mapped[str | None]
    recommendation: Mapped[str | None]
```

---

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Table names | `snake_case`, plural | `diagnostic_results` |
| Column names | `snake_case` | `image_url`, `created_at` |
| Foreign keys | `{table_singular}_id` | `user_id`, `scan_id` |
| Indexes | `ix_{table}_{column}` | `ix_scans_created_at` |
| Constraints | `ck_{table}_{description}` | `ck_results_severity_valid` |

---

## Query Patterns

### Use async sessions

```python
from sqlalchemy.ext.asyncio import AsyncSession

async def get_scan(session: AsyncSession, scan_id: uuid.UUID) -> Scan | None:
    return await session.get(Scan, scan_id)
```

### Parameterized queries only

```python
# GOOD
stmt = select(Scan).where(Scan.id == scan_id)

# FORBIDDEN — SQL injection risk
stmt = text(f"SELECT * FROM scans WHERE id = '{scan_id}'")
```

---

## Migrations

- **Tool**: Alembic with async support.
- **Auto-generate**: `alembic revision --autogenerate -m "description"`.
- **Naming**: Descriptive messages: `"add scans table"`, `"add severity column"`.
- **Review**: Always review auto-generated migrations before applying.
- **Never**: Edit a migration already applied to shared environments.

---

## Common Mistakes

- Raw SQL string concatenation with user input.
- Synchronous database calls in async endpoints.
- Models without `created_at` / `updated_at`.
- Tables without a primary key.
- Bare `session.commit()` outside of a managed transaction context.
