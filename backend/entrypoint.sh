#!/bin/bash
set -euo pipefail

# Entrypoint simplificado: usa DATABASE_URL configurado por el entorno
cd /app/backend

echo "Iniciando entrypoint..."

echo "Aplicando migraciones..."
python manage.py migrate --noinput

echo "Omitiendo creación automática de superusuario en entrypoint"

echo "Colectando archivos estáticos..."
python manage.py collectstatic --noinput

PORT=${PORT:-8000}
WORKERS=${WORKERS:-3}
TIMEOUT=${TIMEOUT:-120}

echo "Iniciando servidor Django sobre el puerto ${PORT} con ${WORKERS} workers (timeout ${TIMEOUT}s)..."
gunicorn config.wsgi:application --bind 0.0.0.0:${PORT} --workers ${WORKERS} --timeout ${TIMEOUT}