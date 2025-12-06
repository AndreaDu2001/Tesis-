# 🚀 Guía Paso a Paso: Desplegar en Render

## ✅ Checklist Pre-Despliegue

### Backend
- [ ] `requirements.txt` actualizado con gunicorn y whitenoise
- [ ] `settings.py` configurado para production (DEBUG=False)
- [ ] CORS actualizado con URL de frontend
- [ ] ALLOWED_HOSTS configurado dinámicamente
- [ ] Base de datos remota lista (Supabase o Render)
- [ ] `render.yaml` creado en raíz

### Frontend
- [ ] `package.json` tiene script `build`
- [ ] Variables de entorno en `.env` o `.env.render`
- [ ] `REACT_APP_API_URL` apunta a backend correcto
- [ ] `npm run build` funciona sin errores

---

## 🎯 PASO 1: Preparar el Código

### 1.1 Backend - Verificar requirements.txt
```bash
cd backend
pip freeze > requirements.txt  # Actualizar dependencias
grep -E "gunicorn|whitenoise|dj-database" requirements.txt
```

✅ Debería haber:
- `gunicorn==21.2.0`
- `whitenoise==6.5.0`
- `dj-database-url==2.1.0`

### 1.2 Backend - Actualizar settings.py

Asegúrate que `config/settings.py` tenga:

```python
import dj_database_url
import os
from pathlib import Path

DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')

# Database con soporte para DATABASE_URL (Render)
if os.getenv('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=os.getenv('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
    DATABASES['default']['ENGINE'] = 'django.contrib.gis.db.backends.postgis'
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'NAME': os.getenv('DB_NAME', 'residuos_latacunga'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'postgres123'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# WhiteNoise para production
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # ← Agregar aquí
    'django.contrib.sessions.middleware.SessionMiddleware',
    # ... resto de middlewares
]

if not DEBUG:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### 1.3 Frontend - Verificar build

```bash
cd frontend
npm run build
# Debería crear la carpeta 'build/' sin errores
ls -la build/  # Verificar que existe
```

---

## 🌐 PASO 2: Configurar Base de Datos

### Opción A: Supabase (Recomendado - Gratuito)

1. Ir a https://supabase.com/dashboard
2. Crear nuevo proyecto
3. Seleccionar región (Sudamérica - São Paulo)
4. Copiar CONNECTION STRING desde `Project Settings → Database → Connection String → URI`

**Ejemplo:**
```
postgresql://postgres.xxxxxxxxxxxxx:your_password@db.supabase.co:5432/postgres
```

**Habilitar PostGIS en Supabase:**
- Dashboard → SQL Editor
- Crear query nueva
- Ejecutar: `CREATE EXTENSION IF NOT EXISTS postgis;`

### Opción B: PostgreSQL en Render (Plan Pago - $15/mes)

1. En Render.com: Dashboard → New → PostgreSQL
2. Nombre: `residuos-db`
3. PostgreSQL Version: 15
4. Plan: Starter ($15/mes)
5. Copiar CONNECTION STRING

---

## 🔑 PASO 3: Crear Cuenta en Render

1. **Registrarse:**
   - https://dashboard.render.com
   - Usar GitHub para login (recomendado)

2. **Conectar repositorio:**
   - Dashboard → GitHub → Seleccionar repositorio `Tesis-`
   - Autorizar acceso

3. **Crear SECRET_KEY:**
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```
   Copiar el resultado (ejemplo: `django-insecure-xxxxxxxxxxxxxxxxxxxxx`)

---

## 🚀 PASO 4: Desplegar Backend

### 4.1 Crear Web Service (Backend)

1. **Dashboard → New → Web Service**
2. **Conectar repo:**
   - Seleccionar: `Tesis- (prototipo)`
   - Branch: `prototipo`
   - Root directory: `backend` (importante!)

3. **Configuración:**
   - Name: `residuos-backend`
   - Runtime: `Python 3.11`
   - Build Command:
     ```
     pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
     ```
   - Start Command:
     ```
     gunicorn config.wsgi:application --bind 0.0.0.0:10000
     ```
   - Plan: **Free**

4. **Variables de Entorno:**
   Ir a: `Settings → Environment Variables`
   Agregar:
   ```
   DEBUG=False
   SECRET_KEY=django-insecure-xxxxxxxxxxxxx
   ALLOWED_HOSTS=residuos-backend.onrender.com,localhost,127.0.0.1
   DATABASE_URL=postgresql://postgres.xxxxx:password@db.supabase.co:5432/postgres
   REDIS_URL=redis://default:xxxxx@xxxxx.upstash.io:xxxxx
   RABBITMQ_URL=amqp://user:pass@host:5672/
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

5. **Health Check:**
   - Settings → Health Check Path: `/health/`

6. **Crear Web Service**
   - Render comenzará el build automáticamente
   - Tomar nota de la URL: `https://residuos-backend.onrender.com`

### 4.2 Monitorear Deploy Backend

```
Dashboard → residuos-backend → Logs
```

✅ Esperar a ver:
```
INFO: Uvicorn running on 0.0.0.0:10000
```

---

## 🎨 PASO 5: Desplegar Frontend

### 5.1 Crear Static Site (Frontend)

1. **Dashboard → New → Static Site**
2. **Conectar repo:**
   - Seleccionar: `Tesis- (prototipo)`
   - Branch: `prototipo`
   - Root directory: `frontend` (importante!)

3. **Configuración:**
   - Name: `residuos-frontend`
   - Build Command:
     ```
     npm install && npm run build
     ```
   - Publish Directory: `build`

4. **Variables de Entorno:**
   ```
   REACT_APP_API_URL=https://residuos-backend.onrender.com/api
   REACT_APP_WEBSOCKET_URL=wss://residuos-backend.onrender.com/ws
   ```

5. **Routes (importante para SPA):**
   - Settings → Add Route
   - Path: `*`
   - Destination: `/index.html`
   - Action: `Rewrite`

6. **Crear Static Site**
   - Render comenzará el build
   - Tomar nota de la URL: `https://residuos-frontend.onrender.com`

### 5.2 Monitorear Deploy Frontend

```
Dashboard → residuos-frontend → Logs
```

---

## ✅ PASO 6: Verificación Post-Despliegue

### 6.1 Verificar Backend

```bash
# Opción 1: Terminal
curl https://residuos-backend.onrender.com/api/incidents/

# Opción 2: Browser
https://residuos-backend.onrender.com/api/incidents/
```

Debería retornar:
```json
{
  "count": 16,
  "next": null,
  "previous": null,
  "results": [...]
}
```

### 6.2 Verificar Frontend

1. Abrir https://residuos-frontend.onrender.com
2. Presionar F12 (DevTools)
3. Ir a la pestaña **Network**
4. Recargar página (F5)
5. Verificar:
   - ✅ No hay errores rojos 404
   - ✅ Archivo `build/index.html` carga (200)
   - ✅ CSS y JS cargan (200)
   - ✅ No hay CORS errors en Console

### 6.3 Verificar Login

1. Frontend → Click "Iniciar Sesión"
2. Usuario: `admin@latacunga.gob.ec`
3. Contraseña: `admin123`
4. Debería mostrar dashboard

### 6.4 Verificar Endpoints

Abrir DevTools (F12) → Console y ejecutar:

```javascript
// Verificar que API responde
fetch('https://residuos-backend.onrender.com/api/incidents/')
  .then(r => r.json())
  .then(d => console.log('✅ Incidents:', d.count))
  .catch(e => console.error('❌ Error:', e))
```

---

## 🔧 PASO 7: Configurar CI/CD (Opcional)

### Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [prototipo]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy Backend
        run: |
          curl -X POST \
            "https://api.render.com/deploy/srv-xxxxxxxxxxxxx?key=${{ secrets.RENDER_DEPLOY_KEY }}" \
            -H "accept: application/json"
            
      - name: Deploy Frontend
        run: |
          curl -X POST \
            "https://api.render.com/deploy/srv-yyyyyyyyyyyyy?key=${{ secrets.RENDER_DEPLOY_KEY }}" \
            -H "accept: application/json"
```

Configurar en GitHub:
1. Settings → Secrets → New repository secret
2. Name: `RENDER_DEPLOY_KEY`
3. Value: Tu API key de Render (Dashboard → Settings → API Keys)

---

## 🆘 Troubleshooting

### Backend no inicia
```
Error: Module not found
→ Ejecutar: pip install -r requirements.txt en local
→ Verificar que gunicorn está en requirements.txt
```

### CORS errors
```
Access to XMLHttpRequest blocked by CORS policy
→ Actualizar CORS_ALLOWED_ORIGINS en settings.py
→ Agregar URL de frontend a ALLOWED_ORIGINS
```

### Frontend dice "Cannot GET /"
```
→ Verificar: Root directory es 'frontend'
→ Verificar: Publish directory es 'build'
→ Verificar: Routes tiene * → /index.html
```

### Database connection refused
```
→ Verificar DATABASE_URL es correcto
→ Verificar que BD está activa en Supabase/Render
→ Ejecutar: python manage.py migrate --noinput localmente primero
```

### API returns 401 "Las credenciales..."
```
→ Crear usuario admin:
   python manage.py shell
   from apps.authentication.models import User
   User.objects.create_superuser(email='admin@render.com', password='admin123')
→ O loguear primero en frontend
```

---

## 📊 Monitoreo Continuo

### Verificar status:
- Backend: https://residuos-backend.onrender.com/api/health/
- Frontend: https://residuos-frontend.onrender.com

### Logs en tiempo real:
```
Render Dashboard → [Servicio] → Logs
```

### Alertas (Configurar en Settings):
- Email al cambiar estado
- SMS en caso de crash

---

## 💾 Backup de BD (Importante!)

Si usas Supabase:
1. Dashboard → Backups
2. Configurar backup automático
3. Descargar backup manual: Export → PostgreSQL

Si usas Render PostgreSQL:
1. Settings → Backups
2. Automático incluido en plan pago

---

## 🎉 ¡Felicidades!

Tu sistema está en producción. 

**URLs Importantes:**
- 🌐 Frontend: https://residuos-frontend.onrender.com
- 🔌 API Backend: https://residuos-backend.onrender.com/api
- 📊 Admin Django: https://residuos-backend.onrender.com/admin

**Próximos pasos:**
- [ ] Configurar dominio personalizado
- [ ] Activar SSL/TLS (automático en Render)
- [ ] Configurar email para notificaciones
- [ ] Implementar CI/CD
- [ ] Monitorear logs y errores

