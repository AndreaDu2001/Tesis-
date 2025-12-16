#!/bin/bash
set -euo pipefail

# Entrypoint para FastAPI
cd /app

echo "Iniciando entrypoint FastAPI..."

PORT=${PORT:-8000}
WORKERS=${WORKERS:-4}

echo "Iniciando servidor FastAPI en el puerto ${PORT} con ${WORKERS} workers..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers ${WORKERS} --loop uvloop