# Multi-stage build: Frontend + Backend
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./

RUN npm ci

COPY frontend ./

RUN npm run build

# Stage 2: Backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend ./backend
COPY database ./database

# Copy built frontend to backend static files
COPY --from=frontend-builder /app/frontend/build ./backend/staticfiles/

# Create necessary directories
RUN mkdir -p /app/backend/logs /app/backend/media

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=config.settings
ENV PORT=8000

EXPOSE 8000

# Run migrations and start server
CMD ["sh", "-c", "cd /app/backend && python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT} --workers 4 --timeout 60"]
