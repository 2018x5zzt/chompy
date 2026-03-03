# Chompy Backend

Smart Dental Health Monitor - Backend API powered by FastAPI.

## Quick Start

### Prerequisites

- Python 3.11+
- Docker & Docker Compose

### Local Development (Docker)

```bash
# From project root
cp backend/.env.example backend/.env
docker compose up --build
```

Services:
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432
- **MinIO Console**: http://localhost:9001

### Local Development (without Docker)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --reload
```

### Health Check

```bash
curl http://localhost:8000/api/health
# {"status": "ok", "service": "chompy-api"}
```

## Development

```bash
# Lint
ruff check .

# Type check
mypy app/

# Tests
pytest
```
