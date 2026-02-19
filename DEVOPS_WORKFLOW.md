# 🚀 Flujo de Trabajo DevOps - EPAGAL Latacunga

## 📋 Estructura de Ramas

Este proyecto sigue una estrategia de **Git Flow** organizada con ramas por funcionalidad (feature branches):

### Ramas Principales

```
main (producción)
  ├── feature/sistema-incidencias
  ├── feature/generacion-rutas-optimizadas
  ├── feature/gestion-conductores
  ├── feature/tracking-tiempo-real
  ├── feature/dashboard-estadisticas
  ├── feature/frontend-react
  ├── feature/containerizacion-docker
  ├── feature/testing-bdd
  ├── feature/documentacion-tecnica
  └── feature/ci-cd-github-actions
```

---

## 🔀 Ramas de Funcionalidades

### 1. **feature/sistema-incidencias**
```
📦 Sistema de Gestión de Incidencias
├─ CRUD completo (crear, listar, actualizar, eliminar)
├─ Cálculo automático de zonas (oriental/occidental)
├─ Estados: pendiente → asignada → resuelta
├─ Validación de tipos y gravedad ajustada
└─ Geolocalización y subida de imágenes

Archivos principales:
  - backend/app/routers/incidencias.py
  - backend/app/models.py (Incidencia)
  - frontend/src/components/Incidencias/
```

### 2. **feature/generacion-rutas-optimizadas**
```
🗺️ Algoritmo de Rutas Optimizadas
├─ TSP (Traveling Salesman Problem) con OSRM
├─ Cálculo de camiones necesarios
├─ Ordenamiento por gravedad
├─ Waypoints y orden de visita optimizado
└─ Persistencia en rutas_generadas

Archivos principales:
  - backend/app/routers/rutas.py
  - backend/app/services/osrm_service.py
  - backend/app/models.py (RutaGenerada, RutaDetalle)
```

### 3. **feature/gestion-conductores**
```
👤 Gestión de Conductores
├─ CRUD de conductores
├─ Asignación a rutas
├─ Gestión de disponibilidad
├─ Validación de licencia tipo C
└─ Historial de rutas

Archivos principales:
  - backend/app/routers/conductores.py
  - backend/app/models.py (Conductor)
  - frontend/src/components/Conductores/
```

### 4. **feature/tracking-tiempo-real**
```
📍 Tracking en Tiempo Real
├─ WebSocket para comunicación bidireccional
├─ LiveTracking con actualización de posición
├─ Mapa interactivo con Leaflet
├─ Broadcast de eventos
└─ Historial de posiciones

Archivos principales:
  - backend/app/routers/tracking.py (WebSocket)
  - frontend/src/components/LiveTracking/
  - frontend/src/services/websocketService.ts
```

### 5. **feature/dashboard-estadisticas**
```
📊 Dashboard y Reportes
├─ KPIs principales del sistema
├─ Gráficos con Chart.js
├─ Estadísticas por zona y tipo
├─ Reportes en PDF
└─ Filtros por fecha y zona

Archivos principales:
  - backend/app/routers/reportes.py
  - frontend/src/pages/ReportesPage.tsx
  - frontend/src/components/Dashboard/
```

### 6. **feature/frontend-react**
```
⚛️ Aplicación SPA React
├─ React 18.3.1 + TypeScript 5.5
├─ React Router DOM v6
├─ React Leaflet para mapas
├─ Context API para estado global
└─ Componentes reutilizables

Archivos principales:
  - frontend/src/App.tsx
  - frontend/src/components/
  - frontend/src/services/
```

### 7. **feature/containerizacion-docker**
```
🐳 Containerización Docker
├─ Dockerfile multi-stage para backend
├─ Dockerfile para frontend con Nginx
├─ docker-compose.yml para orquestación
├─ Volúmenes persistentes
└─ Health checks

Archivos principales:
  - Dockerfile (backend)
  - frontend/Dockerfile
  - docker-compose.yml
  - nginx/nginx.conf
```

### 8. **feature/testing-bdd**
```
✅ Testing con BDD
├─ Tests BDD con Behave
├─ Scenarios en español (Gherkin)
├─ Tests de integración API
├─ Unit tests para servicios
└─ Cobertura > 80%

Archivos principales:
  - backend/features/*.feature
  - backend/features/steps/*.py
  - backend/test_*.py
```

### 9. **feature/documentacion-tecnica**
```
📖 Documentación Técnica
├─ Arquitectura C4
├─ Backend: API endpoints, modelos
├─ Frontend: componentes, flujos
├─ Implementación de features
└─ Stack tecnológico

Archivos principales:
  - ARQUITECTURA_SISTEMA.md
  - BACKEND_TECNICO.md
  - FRONTEND_TECNICO.md
  - IMPLEMENTACION_FEATURES.md
```

### 10. **feature/ci-cd-github-actions**
```
🔄 CI/CD Pipeline
├─ Workflow de build
├─ Workflow de deploy
├─ Tests automáticos
├─ Construcción de imágenes Docker
└─ Deploy a Render.com

Archivos principales:
  - .github/workflows/build.yml
  - .github/workflows/deploy.yml
```

---

## 🔄 Flujo de Trabajo Recomendado

### Para nuevas funcionalidades:

```bash
# 1. Crear nueva rama desde main
git checkout main
git pull origin main
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar la funcionalidad
# ... hacer cambios ...
git add .
git commit -m "feat(scope): descripción clara"

# 3. Subir la rama al repositorio
git push origin feature/nueva-funcionalidad

# 4. Crear Pull Request en GitHub
# - Revisar código
# - Pasar tests automáticos
# - Aprobar merge

# 5. Merge a main
git checkout main
git merge feature/nueva-funcionalidad
git push origin main
```

### Para correcciones (hotfix):

```bash
# 1. Crear rama hotfix desde main
git checkout main
git checkout -b hotfix/descripcion-corta

# 2. Aplicar el fix
git add .
git commit -m "fix(scope): descripción del fix"

# 3. Merge directo a main (después de tests)
git checkout main
git merge hotfix/descripcion-corta
git push origin main

# 4. Eliminar rama hotfix
git branch -d hotfix/descripcion-corta
```

---

## 📝 Convenciones de Commits

Seguimos el estándar **Conventional Commits**:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo, espacios (no afecta código)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### Ejemplos:
```bash
feat(incidencias): agregar validación de coordenadas GPS
fix(rutas): corregir cálculo de distancia en OSRM
docs(readme): actualizar guía de instalación
refactor(auth): simplificar lógica de JWT
test(conductores): agregar tests de asignación
```

---

## 🔍 Code Review Checklist

Antes de aprobar un Pull Request, verificar:

- [ ] ✅ Código sigue las convenciones del proyecto
- [ ] ✅ Tests pasan correctamente (locales y CI)
- [ ] ✅ No hay conflictos con main
- [ ] ✅ Documentación actualizada si es necesario
- [ ] ✅ No hay credenciales hardcodeadas
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Logs informativos agregados
- [ ] ✅ Manejo de errores implementado

---

## 🚦 CI/CD Pipeline

### Build Workflow (automático en cada push)
```yaml
Trigger: push, pull_request
Jobs:
  1. Lint y Type Check
  2. Run Tests (pytest, behave)
  3. Build Docker Images
  4. Security Scan
```

### Deploy Workflow (automático en merge a main)
```yaml
Trigger: push to main
Jobs:
  1. Build Production Images
  2. Deploy to Render.com
  3. Run Smoke Tests
  4. Notify Team
```

---

## 📊 Métricas DevOps

### Objetivos del Proyecto:
- **Deployment Frequency**: Diario (1+ deployments/día)
- **Lead Time for Changes**: < 1 día
- **Mean Time to Recovery (MTTR)**: < 1 hora
- **Change Failure Rate**: < 15%

### Monitoreo:
- GitHub Actions para CI/CD
- Render.com para logs de producción
- PostgreSQL para métricas de negocio

---

## 🛠️ Comandos Útiles

```bash
# Ver todas las ramas
git branch -a

# Sincronizar con remoto
git fetch --all

# Ver diferencias entre ramas
git diff feature/nombre main

# Listar commits de una rama
git log feature/nombre --oneline

# Eliminar rama local
git branch -d feature/nombre

# Eliminar rama remota
git push origin --delete feature/nombre

# Ver estado del repositorio
git status

# Ver historial gráfico
git log --oneline --graph --all
```

---

## 📚 Referencias

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Semantic Versioning](https://semver.org/)

---

## 👥 Equipo

- **Andrea**: Desarrollo Full Stack, Arquitectura
- **Copilot**: Asistencia en desarrollo y DevOps

---

## 📅 Última Actualización

**Fecha**: 12 de enero de 2026  
**Versión**: 1.0.0  
**Estado**: ✅ Producción
