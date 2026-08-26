# Use an official lightweight Python image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_SYSTEM_PYTHON=1

# Install system dependencies (for PostgreSQL support and networking healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    netcat-traditional \
    curl \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install uv binary from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Copy dependency definition files first for optimal layer caching
COPY pyproject.toml uv.lock ./

# Install Python dependencies into the system environment
RUN uv sync --frozen --no-dev

# Copy application source code
COPY . .

# Expose Django port
EXPOSE 8000

# Default entrypoint to wait for database, run migrations, and start server
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
