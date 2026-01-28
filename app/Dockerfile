# syntax=docker/dockerfile:1

FROM python:3.12-slim

WORKDIR /app

# Python runtime sanity
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash appuser \
    && chown -R appuser:appuser /app
USER appuser

# Default config (overridable)
ENV PORT=8000 \
    SERVICE_NAME=python-service \
    APP_ENV=container

EXPOSE 8000

CMD ["python", "app.py"]
