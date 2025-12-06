# 🚀 GUÍA RÁPIDA: DESPLEGAR EN RENDER

**Tu proyecto ya está en:** https://github.com/Ricardo16365Travez/latacunga_limpia  
**Rama:** `prototipo`

---

## ✅ Estructura Confirmada

```
latacunga_limpia/
├── backend/              ← Django Backend
│   ├── requirements.txt  ✅ Con gunicorn y whitenoise
│   ├── manage.py
│   └── config/
├── frontend/             ← React Frontend
│   ├── package.json
│   ├── src/
│   └── public/
├── render.yaml           ✅ Configuración lista
├── .env.render.example   ✅ Variables de entorno modelo
├── DEPLOY_RENDER_PLAN.md    ✅ Plan completo
└── DEPLOY_RENDER_STEPS.md   ✅ Pasos detallados (leer esto!)
```

---

## 🎯 AHORA QUÉ HACER EN RENDER

### PASO 1: Registrarse en Render
1. Ir a https://dashboard.render.com
2. Click **Sign Up with GitHub**
3. Autorizar acceso

---

### PASO 2: Crear Base de Datos (Supabase - Gratuito)

**En https://supabase.com/dashboard:**

1. **New Project**
   - Name: `residuos-latacunga`
   - Database Password: `GeneraContraseña123!`
   - Region: **São Paulo** (Sudamérica)
   - Pricing: **Free**

2. **Obtener CONNECTION STRING:**
   - Settings → Database → Connection Pooling
   - Copy: `postgresql://postgres.xxxxx:pass@db.supabase.co:5432/postgres`
   - **Guardar en lugar seguro** ⚠️

---

### PASO 3: Crear Backend en Render

**En https://dashboard.render.com:**

1. **New** → **Web Service**

2. **Conectar repo:**
   - Repository: `Ricardo16365Travez/latacunga_limpia`
   - Branch: `prototipo`

3. **Configuración:**
   - Name: `residuos-backend`
   - Runtime: `Python 3.11`
   - Root Directory: `backend`
   - Plan: **FREE**

4. **Build Command:**
   ```
   pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
   ```

5. **Start Command:**
   ```
   gunicorn config.wsgi:application --bind 0.0.0.0:10000
   ```

6. **Click Create Web Service** → Esperar 5-10 minutos

---

### PASO 4: Agregar Variables de Entorno (Backend)

**En Render → residuos-backend → Settings → Environment:**

Copiar y pegar cada una exactamente:

```
DEBUG
False

SECRET_KEY
django-insecure-uw2^6@0zp26-kfghaksjdhf1234567890abcdef

ALLOWED_HOSTS
residuos-backend.onrender.com,localhost,127.0.0.1

DATABASE_URL
postgresql://postgres.xxxxxxxxxxxxx:your_password@db.supabase.co:5432/postgres

REDIS_URL
redis://localhost:6379

RABBITMQ_URL
amqp://guest:guest@localhost:5672/

SUPABASE_URL
https://xxxxxxxxxxxxx.supabase.co

SUPABASE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

✅ Guardar variables

---

### PASO 5: Verificar que Backend está Online

**En Render → residuos-backend → Logs:**

Esperar a ver:
```
Listening on 0.0.0.0:10000
```

**Luego probar en navegador:**
```
https://residuos-backend.onrender.com/api/incidents/
```

✅ Si ves JSON (no error) → **BACKEND OK**

---

### PASO 6: Crear Frontend en Render

**En https://dashboard.render.com:**

1. **New** → **Static Site**

2. **Conectar repo:**
   - Repository: `Ricardo16365Travez/latacunga_limpia`
   - Branch: `prototipo`

3. **Configuración:**
   - Name: `residuos-frontend`
   - Root Directory: `frontend`
   - Plan: **FREE**

4. **Build Command:**
   ```
   npm install && npm run build
   ```

5. **Publish Directory:** `build`

6. **Click Create Static Site** → Esperar 5-10 minutos

---

### PASO 7: Agregar Variables de Entorno (Frontend)

**En Render → residuos-frontend → Environment:**

```
REACT_APP_API_URL
https://residuos-backend.onrender.com/api

REACT_APP_WEBSOCKET_URL
wss://residuos-backend.onrender.com/ws
```

✅ Guardar variables

---

### PASO 8: Configurar Rutas (Importante!)

**En Render → residuos-frontend → Settings → Routes:**

1. **Add Route**
   - Path: `*`
   - Destination: `/index.html`
   - Action: **Rewrite**

✅ Guardar

---

### PASO 9: Verificar que Frontend está Online

**En Render → residuos-frontend → Logs:**

Esperar a ver:
```
Build successful
Deployment live
```

**Luego ir a:**
```
https://residuos-frontend.onrender.com
```

✅ Si ves la página de login → **FRONTEND OK**

---

## ✅ TEST FINAL

### Test 1: ¿Frontend carga?
- Abrir: https://residuos-frontend.onrender.com
- Debería ver: **Página de login**
- ✅ Si ves login → PASÓ

### Test 2: ¿Backend responde?
- Abrir: https://residuos-backend.onrender.com/api/incidents/
- Debería ver: **JSON con incidencias**
- ✅ Si ves JSON → PASÓ

### Test 3: ¿Login funciona?
- Frontend → "Iniciar Sesión"
- Usuario: `admin@latacunga.gob.ec`
- Contraseña: `admin123`
- ✅ Si entra → PASÓ

---

## 🎉 ¡LISTO!

Si pasaron todos los tests:

**Frontend:** https://residuos-frontend.onrender.com  
**API:** https://residuos-backend.onrender.com/api  
**Admin:** https://residuos-backend.onrender.com/admin

---

## 🆘 Si algo falla

1. **Backend no inicia:**
   - Ir a Logs
   - Copiar el error completo
   - Avísame

2. **Frontend muestra error:**
   - Abrir F12 (DevTools)
   - Copiar errores de Console
   - Avísame

3. **Login no funciona:**
   - Significa que BD no conectó
   - Verificar DATABASE_URL en Backend settings
   - Avísame

---

## 📚 Documentación Completa

Lee estos archivos si necesitas más detalles:

- `DEPLOY_RENDER_PLAN.md` - Arquitectura completa
- `DEPLOY_RENDER_STEPS.md` - Pasos detallados paso a paso
- `render.yaml` - Configuración técnica

---

**¿Necesitas ayuda? Avísame en qué paso estás y te guío.**
