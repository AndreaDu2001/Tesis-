# 🐳 GUÍA DE DESPLIEGUE DOCKER CORREGIDA PARA RENDER

## ✅ Qué se solucionó

El error original fue:
```
error: failed to read dockerfile: open Dockerfile: no such file or directory
```

### Soluciones implementadas:

1. ✅ **Creado `Dockerfile` en raíz** - Render lo detecta automáticamente
2. ✅ **Configurado `render.yaml`** - Ahora especifica `dockerfile: Dockerfile`
3. ✅ **Creado `.dockerignore`** - Optimiza el tamaño del build
4. ✅ **Script `render-build.sh`** - Automatiza setup, migrations, datos

---

## 🚀 PASOS PARA REINTENTAR EN RENDER

### Opción A: Despliegue Automático (Recomendado)

1. **Ve a Render Dashboard** → https://dashboard.render.com

2. **Crea nuevo Web Service:**
   - Click "Create +" → "Web Service"
   - Repositorio: `Ricardo16365Travez/latacunga_limpia`
   - Rama: `prototipo`
   - **IMPORTANTE:** Marcar "Use Dockerfile" (debe estar preseleccionado automáticamente)
   - Build Command: (dejar vacío - usa Dockerfile)
   - Start Command: (dejar vacío - usa Dockerfile)

3. **Configurar Variables de Entorno** (en Render dashboard):
   ```
   DEBUG = False
   ENVIRONMENT = production
   SECRET_KEY = django-insecure-<generar-valor-seguro>
   ALLOWED_HOSTS = residuos-backend.onrender.com
   DATABASE_URL = postgresql://user:pass@host/db
   ```

4. **Deploy:** Click "Create Web Service"
   - Render detecta `render.yaml`
   - Lee `Dockerfile` del repo
   - Build comienza automáticamente

### Opción B: Despliegue Completo con BD + Redis (avanzado)

1. Render ahora debería leer automáticamente `render-complete.yaml`
2. Incluye:
   - Backend Web Service
   - Frontend Static Site
   - PostgreSQL (plan Starter)
   - Redis (plan Free)

---

## ✅ VERIFICAR DEPLOY

**Una vez hecho el deploy:**

```bash
# Test 1: Verificar que backend está activo
curl https://residuos-backend.onrender.com/health/

# Test 2: Verificar que frontend está activo
curl https://residuos-frontend.onrender.com/

# Test 3: Verificar API
curl https://residuos-backend.onrender.com/api/incidents/
```

**Esperado:** No errores de "Dockerfile not found"

---

## 📋 Estructura del Dockerfile

```dockerfile
FROM python:3.11-slim as base
  ↓
RUN apt-get install [gdal, postgis, postgresql-client]
  ↓
COPY backend/requirements.txt
RUN pip install -r requirements.txt
  ↓
COPY . .
  ↓
WORKDIR /app/backend
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:10000"]
```

**Esto asegura que:**
- ✅ Las dependencias GeoDjango/PostGIS se instalen
- ✅ Puerto correcto (10000 - el que usa Render)
- ✅ Gunicorn inicia en directorio correcto

---

## 🔧 TROUBLESHOOTING

### Si aún falla el build:

1. **Verificar que Dockerfile existe:**
   ```bash
   git ls-files | grep Dockerfile
   ```
   Debe mostrar: `Dockerfile`

2. **Verificar estructura:**
   ```bash
   head -5 Dockerfile
   ```
   Debe mostrar: `FROM python:3.11-slim`

3. **En Render Dashboard:**
   - Click derecha en servicio → "View Logs"
   - Ver exactamente dónde falla
   - Copiar error completo

4. **Contactar soporte Render:**
   - Copiar logs completos
   - Mencionar: "Monorepo con Dockerfile en raíz"

---

## 📌 ARCHIVOS CLAVE ACTUALIZADOS

- ✅ `Dockerfile` - Build correcto con multi-stage
- ✅ `render.yaml` - Especifica dockerfile y context
- ✅ `.dockerignore` - Optimiza tamaño
- ✅ `render-build.sh` - Script de setup (opcional)
- ✅ `render-complete.yaml` - Config completa con BD+Redis

---

## ⏱️ TIEMPO ESTIMADO

| Paso | Tiempo |
|------|--------|
| Build Docker | 3-5 min |
| Migrations | 30-60 seg |
| Startup | 30-60 seg |
| **Total** | **5-7 min** |

---

**Ahora haz push de los cambios a Render (ya está hecho) y reinicia el deploy. ¡Debe funcionar! 🎉**
