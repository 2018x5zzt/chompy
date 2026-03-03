# --- Builder stage ---
FROM python:3.11-slim AS builder

WORKDIR /build

COPY pyproject.toml .

# Extract and install only dependencies (not the project itself)
RUN pip install --no-cache-dir --prefix=/install \
    "fastapi>=0.115.0" \
    "uvicorn[standard]>=0.34.0" \
    "pydantic>=2.10.0" \
    "pydantic-settings>=2.7.0" \
    "python-dotenv>=1.0.0"

# --- Runtime stage ---
FROM python:3.11-slim AS runtime

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY app/ ./app/

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
