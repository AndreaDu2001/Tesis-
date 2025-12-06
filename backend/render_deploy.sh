#!/bin/bash
set -e

echo "🚀 Starting Render deployment for residuos-backend..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${YELLOW}🔧 Running migrations...${NC}"
python manage.py migrate --noinput

echo -e "${YELLOW}📁 Collecting static files...${NC}"
python manage.py collectstatic --noinput --clear

echo -e "${YELLOW}✅ Creating default users...${NC}"
python manage.py shell < /dev/null << EOF
import os
import sys
from django.contrib.auth import get_user_model

User = get_user_model()

# Crear admin de prueba
admin_email = 'admin@latacunga.gob.ec'
if not User.objects.filter(email=admin_email).exists():
    admin = User.objects.create_superuser(
        email=admin_email,
        password='admin123',
        first_name='Administrador',
        last_name='Render'
    )
    admin.is_staff = True
    admin.is_active = True
    admin.save()
    print(f"✅ Admin user created: {admin_email}")
else:
    print(f"⚠️  Admin user already exists: {admin_email}")

EOF

echo -e "${GREEN}✨ Render deployment setup complete!${NC}"
echo -e "${GREEN}🎉 Backend is ready to start with: gunicorn config.wsgi:application${NC}"
