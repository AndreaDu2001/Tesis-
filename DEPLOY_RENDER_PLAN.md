# Plan de Despliegue DevOps en Render

## 📋 Resumen Ejecutivo

Separación del proyecto en **3 servicios independientes** en Render (plan gratuito):
- **Backend (Django)**: Web Service
- **Frontend (React)**: Static Site
- **Base de datos**: PostgreSQL (nativo de Render)

---

## 🏗️ Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│                    RENDER PLATFORM                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐  │
│  │   Frontend       │  │   Backend        │  │  Database│  │
│  │ (Static Site)    │  │ (Web Service)    │  │(PostgreSQL)│ │
│  │ React Build      │  │ Django + DRF     │  │ PostGIS  │  │
│  │ Port: 3001       │  │ Port: 10000      │  │ Auto-backup│ │
│  │ Zero CPU idle    │  │ RAM: 512MB       │  │          │  │
│  │ Free Tier        │  │ Free Tier        │  │ Pro Plan │  │
│  └──────────────────┘  └──────────────────┘  └──────────┘  │
│         ↓                      ↑                              │
│         │──────API Calls──────→│                              │
│                                │                              │
│         CDN Cache             DB Connection                   │
│         (Cloudflare)          (SSL + Pool)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 Costo Estimado (Plan Gratuito + BD)

| Servicio | Tipo | Costo Mensual | Notas |
|----------|------|--------------|-------|
| Frontend | Static Site | **$0** | Gratuito, sin límite de tráfico |
| Backend | Web Service | **$0** | Gratuito, duerme después de 15min inactividad |
| Database | PostgreSQL | **$15-30** | Plan mínimo Pro recomendado (10GB) |
| **TOTAL** | | **~$15-30** | Muy asequible para MVP |

### Alternativa: Base de datos gratuita
- Usar **Supabase** (PostgreSQL gratuito con 500MB)
- Eliminar necesidad de PostgreSQL de Render
- **Costo total: $0** (solo plan gratuito)

---

## 📦 Servicios a Desplegar

### 1️⃣ **Backend (Django)** - Web Service

**Características:**
- Framework: Django 4.2 + DRF
- Base de datos: PostgreSQL + PostGIS
- Cache/Queue: Redis (externo o Upstash)
- Autenticación: JWT (django-rest-framework-simplejwt)

**Pasos:**
1. Crear `render.yaml` en raíz del backend
2. Configurar variables de entorno (SECRET_KEY, DB_URL, etc.)
3. Build command: `pip install -r requirements.txt && python manage.py migrate`
4. Start command: `gunicorn config.wsgi:application`

**Archivo: `backend/render.yaml`**
```yaml
services:
  - type: web
    name: residuos-backend
    runtime: python3.11
    plan: free
    healthCheckPath: /health/
    buildCommand: pip install -r requirements.txt && python manage.py migrate
    startCommand: gunicorn config.wsgi:application --bind 0.0.0.0:10000
    envVars:
      - key: DEBUG
        value: "False"
      - key: ALLOWED_HOSTS
        value: "residuos-backend.onrender.com,*.onrender.com"
      - key: STATIC_URL
        value: "/static/"
      - key: STATIC_ROOT
        value: "/var/data/static"
    disk:
      name: django_storage
      path: /var/data
      sizeGB: 1
```

---

### 2️⃣ **Frontend (React)** - Static Site

**Características:**
- Framework: React 18 + TypeScript
- Build tool: Create React App
- Sirving: Nginx / Render Static

**Pasos:**
1. Build optimizado: `npm run build`
2. Publicar carpeta `build/`
3. Configurar variables de entorno: API_BASE_URL

**Archivo: `frontend/render.yaml` (alternativo)**
```yaml
services:
  - type: static_site
    name: residuos-frontend
    buildCommand: npm run build
    staticPublishPath: ./build
    envVars:
      - key: REACT_APP_API_URL
        value: "https://residuos-backend.onrender.com/api"
      - key: REACT_APP_WEBSOCKET_URL
        value: "wss://residuos-backend.onrender.com/ws"
```

---

### 3️⃣ **Base de Datos** - PostgreSQL

**Opción A: Render PostgreSQL (Recomendado)**
- Plan: Starter ($15/mes) o Pro ($30+)
- Incluye: PostGIS, backups automáticos, SSL
- Conexión: `postgresql://user:pass@host:5432/db`

**Opción B: Supabase (Gratuito)**
- 500MB almacenamiento
- PostGIS incluido
- API GraphQL incluida
- URL: `postgresql://user:password@db.supabase.co:5432/postgres`

---

## 🚀 Proceso de Despliegue Paso a Paso

### **FASE 1: Preparación del Código**

#### 1. Actualizar requirements.txt (backend)
```bash
cd backend
pip install gunicorn python-dotenv
pip freeze > requirements.txt
```

#### 2. Crear .env para Render
```bash
# backend/.env.render
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=residuos-backend.onrender.com
DATABASE_URL=postgresql://user:pass@host:5432/residuos
REDIS_URL=redis://your-redis-url:6379
```

#### 3. Actualizar settings.py (Django)
```python
# backend/config/settings.py

# Usar variable de entorno para DB
import dj_database_url
DATABASES = {
    'default': dj_database_url.config(
        default='postgresql://localhost:5432/residuos_latacunga',
        conn_max_age=600,
    )
}

# ALLOWED_HOSTS
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')

# CORS
CORS_ALLOWED_ORIGINS = [
    'https://residuos-frontend.onrender.com',
    'http://localhost:3000',
]
```

#### 4. Frontend: build optimizado
```bash
cd frontend
npm run build
# Resultado: carpeta build/ lista para servir
```

---

### **FASE 2: Configuración en Render**

#### Opción A: UI de Render Dashboard

1. **Crear Web Service (Backend)**
   - Conectar repo GitHub
   - Build Command: `pip install -r requirements.txt && python manage.py migrate`
   - Start Command: `gunicorn config.wsgi:application --bind 0.0.0.0:10000`
   - Plan: Free
   - Agregar variables de entorno

2. **Crear Static Site (Frontend)**
   - Conectar repo GitHub
   - Build Command: `npm run build`
   - Publish Directory: `build`
   - Environment: `REACT_APP_API_URL=https://residuos-backend.onrender.com/api`

3. **Crear PostgreSQL**
   - Plan: Starter ($15/mes)
   - Database name: `residuos`
   - Copiar CONNECTION_STRING

#### Opción B: Infraestructura como Código (render.yaml)

En raíz del proyecto:
```yaml
services:
  - type: web
    name: residuos-backend
    runtime: python3.11
    plan: free
    healthCheckPath: /health/
    buildCommand: pip install -r requirements.txt && python manage.py migrate
    startCommand: gunicorn config.wsgi:application --bind 0.0.0.0:10000
    
  - type: static_site
    name: residuos-frontend
    staticPublishPath: ./build
    buildCommand: npm run build
    
  - type: pserv
    name: residuos-db
    plan: starter
    ipAllowList: [] # Permitir todas las IPs
```

---

### **FASE 3: Variables de Entorno**

#### Backend (Render Environment)
```
DEBUG=False
SECRET_KEY=django-insecure-xxxxxxxxxxxxx
ALLOWED_HOSTS=residuos-backend.onrender.com
DATABASE_URL=postgresql://user:pass@host:5432/residuos
REDIS_URL=redis://localhost:6379 (o externo)
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
```

#### Frontend (Render Environment)
```
REACT_APP_API_URL=https://residuos-backend.onrender.com/api
REACT_APP_WEBSOCKET_URL=wss://residuos-backend.onrender.com/ws
```

---

## ⚙️ Optimizaciones para Plan Gratuito

### 1. **Cold Start Mitigation**
```python
# backend/config/wsgi.py
# Agregar endpoint /health/ para mantener vivo
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'healthy'})
```

### 2. **Archivo .gitignore Actualizado**
```
.env
.env.render
__pycache__/
*.pyc
node_modules/
build/
media/
db.sqlite3
```

### 3. **Configuración de Static Files**
```bash
# backend/settings.py
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

# En production
if not DEBUG:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### 4. **Instalacion de WhiteNoise**
```bash
pip install whitenoise
```

```python
# backend/config/settings.py
MIDDLEWARE = [
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Agregar aquí
    'django.middleware.security.SecurityMiddleware',
    # ... resto de middlewares
]
```

---

## 📊 Monitoreo y CI/CD

### GitHub Actions para Auto-Deploy

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [ prototipo ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy Backend
        run: |
          curl -X POST "https://api.render.com/deploy/srv-xxxxx?key=${{ secrets.RENDER_DEPLOY_KEY }}"
      
      - name: Deploy Frontend
        run: |
          curl -X POST "https://api.render.com/deploy/srv-yyyyy?key=${{ secrets.RENDER_DEPLOY_KEY }}"
```

---

## 🔍 Checklist de Despliegue

### Antes de subir:
- [ ] `requirements.txt` actualizado
- [ ] `package.json` actualizado
- [ ] `settings.py` configurado para producción
- [ ] `.env.render` creado con variables correctas
- [ ] `manage.py migrate` probado localmente
- [ ] `npm run build` sin errores
- [ ] CORS configurado correctamente
- [ ] Base de datos creada en Render
- [ ] Variables de entorno agregadas en Render
- [ ] API_BASE_URL apunta a backend correcto

### Después de desplegar:
- [ ] Frontend carga sin errores (F12 → Console)
- [ ] API responde: `curl https://residuos-backend.onrender.com/api/health/`
- [ ] Login funciona
- [ ] Endpoints devuelven datos
- [ ] Base de datos conecta correctamente
- [ ] No hay CORS errors
- [ ] Archivos estáticos cargan (CSS, JS)

---

## 🛠️ Comandos Útiles

```bash
# Generar SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Crear usuario en BD remota
python manage.py shell
>>> from apps.authentication.models import User
>>> User.objects.create_superuser(email='admin@render.com', password='admin123')

# Ver logs en Render
# Dashboard → Backend → Logs

# SSH a web service
# (No disponible en plan gratuito)
```

---

## 📱 Diferencias: Plan Gratuito vs Pago

| Característica | Gratuito | Pago |
|---------------|----------|------|
| CPU | Compartido | Dedicado |
| RAM | 512MB | 1GB+ |
| Sleep | Sí (15min) | No |
| Disk | 1GB | 10GB+ |
| SSL | ✅ Automático | ✅ |
| Backups | No | ✅ Diario |
| SLA | No | 99.99% |
| Precio | $0 | $7+/mes |

---

## 🎯 Siguientes Pasos

1. **Preparar código** (settings.py, requirements.txt)
2. **Crear cuenta en Render.com**
3. **Conectar GitHub repo**
4. **Configurar PostgreSQL** (Render o Supabase)
5. **Desplegar Backend** (Web Service)
6. **Desplegar Frontend** (Static Site)
7. **Verificar conectividad**
8. **Configurar CI/CD** (GitHub Actions)

---

## ⚠️ Limitaciones Conocidas

- Backend se "duerme" después de 15 min sin solicitudes
- Plan gratuito no tiene garantía de uptime
- Máximo 1 web service gratuito por cuenta
- PostgreSQL plan mínimo es $15/mes (o usar Supabase gratis)
- Espacio limitado (1GB frontend, 1GB backend)

---

## 📞 Soporte

- Render Docs: https://render.com/docs
- PostgreSQL en Render: https://render.com/docs/databases
- Django + Gunicorn: https://docs.gunicorn.org/

