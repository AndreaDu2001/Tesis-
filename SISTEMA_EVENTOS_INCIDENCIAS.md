# 🚀 Sistema de Incidencias con Eventos RabbitMQ

Sistema completo de gestión de incidencias compatible con el **incident-service** de Go del repositorio `latacunga_clean_app`. Implementa arquitectura event-driven con RabbitMQ para comunicación entre app móvil y dashboard de administración.

## 📋 Características

✅ **Event-Driven Architecture** - Comunicación asíncrona mediante eventos RabbitMQ  
✅ **Offline-First** - Soporte de `idempotency_key` para sincronización sin duplicados  
✅ **PostGIS** - Geolocalización de incidentes con puntos geográficos  
✅ **Dashboard en Tiempo Real** - Los admins ven incidencias instantáneamente  
✅ **Sistema de Validación** - Admins pueden validar/rechazar incidencias  
✅ **Historial Completo** - Auditoría de todos los eventos y cambios  
✅ **Compatible con Go Service** - Usa el mismo formato de eventos

## 🏗️ Arquitectura

```
┌──────────────┐                  ┌──────────────┐                  ┌──────────────┐
│  App Móvil   │                  │   RabbitMQ   │                  │   Dashboard  │
│  (Flutter)   │─────Publish─────>│   Exchange   │─────Consume─────>│    Admin     │
│              │  incidents.       │    topic     │  incidents.     │   (React)    │
│              │  submitted.v1     │              │  submitted.v1   │              │
└──────────────┘                  └──────────────┘                  └──────────────┘
       │                                  ^                                │
       │                                  │                                │
       │                            Publish Event                          │
       │                          (validated/rejected)                     │
       │                                  │                                │
       └──────────────────────────────────┴────────────────────────────────┘
                              Django Backend (Python)
```

## 🔄 Flujo de Eventos

### 1. Usuario reporta incidente desde app móvil

```
POST /api/v1/incidents/
{
  "type": "animal_muerto",
  "title": "Perro atropellado",
  "description": "En Av. Principal",
  "latitude": -0.9367,
  "longitude": -78.6185,
  "idempotency_key": "mobile-123-uuid"  // Opcional para offline-first
}
```

**📤 Evento publicado:**
```json
{
  "incident_id": "uuid",
  "type": "animal_muerto",
  "status": "incidente_pendiente",
  "location": {
    "latitude": -0.9367,
    "longitude": -78.6185
  },
  "event_type": "incidente_pendiente",
  "event_timestamp": "2025-01-15T10:30:00Z"
}
```

**Routing Key:** `incidents.submitted.v1`

### 2. Dashboard Admin recibe evento en tiempo real

El **consumer** de Django escucha el exchange y procesa el evento:

```python
# backend/apps/incidents/incident_consumer.py
def handle_incident_submitted(event_data):
    # Crea el incidente en la base de datos
    # Actualiza dashboard en tiempo real (WebSocket/SSE)
    # Envía notificación push a administradores
```

### 3. Administrador valida/rechaza incidente

```
POST /api/v1/incidents/{id}/validate/
{
  "action": "validate",  // o "reject"
  "notes": "Incidente verificado correctamente"
}
```

**📤 Evento publicado:**
```json
{
  "incident_id": "uuid",
  "status": "incidente_valido",
  "validator_id": "admin-uuid",
  "validated_at": "2025-01-15T11:00:00Z",
  "notes": "...",
  "event_type": "incidente_validado"
}
```

**Routing Key:** `incidents.validated.v1`

## 📡 Endpoints de la API

### Crear Incidente (App Móvil)

```http
POST /api/v1/incidents/
Content-Type: application/json
Authorization: Bearer {token}

{
  "type": "punto_acopio|zona_critica|animal_muerto|zona_reciclaje",
  "title": "Título del incidente",
  "description": "Descripción detallada",
  "latitude": -0.9367,
  "longitude": -78.6185,
  "address": "Dirección aproximada",
  "idempotency_key": "mobile-device-12345",
  "photo_url": "https://storage.com/photo.jpg"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "type": "animal_muerto",
  "title": "...",
  "status": "incidente_pendiente",
  "lat": -0.9367,
  "lon": -78.6185,
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Listar Incidentes

```http
GET /api/v1/incidents/?status=incidente_pendiente&type=animal_muerto
```

**Query Parameters:**
- `status`: Filtrar por estado
- `type`: Filtrar por tipo
- `search`: Buscar en título/descripción
- `ordering`: Ordenar por campo

### Validar/Rechazar Incidente (Admin)

```http
POST /api/v1/incidents/{id}/validate/
Authorization: Bearer {admin-token}

{
  "action": "validate",
  "notes": "Verificado in-situ"
}
```

### Agregar Foto/Evidencia

```http
POST /api/v1/incidents/{id}/attachments/

{
  "file_url": "https://storage.com/evidence.jpg",
  "mime_type": "image/jpeg",
  "size_bytes": 123456
}
```

### Obtener Estadísticas (Dashboard)

```http
GET /api/v1/incidents/stats/
```

**Response:**
```json
{
  "total": 150,
  "by_status": {
    "incidente_pendiente": 25,
    "incidente_valido": 80,
    "incidente_rechazado": 10
  },
  "by_type": {
    "animal_muerto": 50,
    "punto_acopio": 30
  },
  "pending_validation": 25
}
```

### Listar Pendientes de Validación (Admin)

```http
GET /api/v1/incidents/pending/
Authorization: Bearer {admin-token}
```

## 🐰 Configuración de RabbitMQ

### Exchange
- **Nombre:** `city.cleaning.incidents`
- **Tipo:** `topic`
- **Durable:** `true`

### Routing Keys

| Routing Key | Descripción | Publicado por |
|-------------|-------------|---------------|
| `incidents.submitted.v1` | Nuevo incidente desde app móvil | Django API |
| `incidents.validated.v1` | Incidente validado por admin | Django API |
| `incidents.rejected.v1` | Incidente rechazado | Django API |
| `incidents.status_updated.v1` | Cambio de estado | Django API |
| `incidents.attachment_added.v1` | Nueva evidencia agregada | Django API |

### Queues

#### Dashboard Queue
- **Nombre:** `dashboard.incidents.queue`
- **Bindings:** Todos los routing keys `incidents.*`
- **Consumer:** `python manage.py consume_incident_events`

## 🚀 Instalación y Ejecución

### 1. Instalar Dependencias

```bash
cd backend
pip install -r requirements.txt
```

### 2. Aplicar Migraciones

```bash
python manage.py migrate incidents
```

### 3. Iniciar el Consumer (Dashboard)

```bash
python manage.py consume_incident_events
```

Este proceso debe ejecutarse en paralelo con el servidor Django:

```bash
# Terminal 1: Django server
python manage.py runserver

# Terminal 2: Consumer de eventos
python manage.py consume_incident_events
```

### Con Docker Compose

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs del consumer
docker-compose logs -f backend

# Ejecutar consumer en contenedor separado
docker-compose exec backend python manage.py consume_incident_events
```

## 🔧 Configuración

### Variables de Entorno

```env
# Backend (Django)
RABBITMQ_URL=amqp://tesis:tesis@rabbitmq:5672/
DATABASE_URL=postgis://user:pass@db:5432/residuos_db

# RabbitMQ
RABBITMQ_DEFAULT_USER=tesis
RABBITMQ_DEFAULT_PASS=tesis
```

### settings.py

```python
# apps/incidents habilitado
INSTALLED_APPS = [
    ...
    'apps.incidents',
    ...
]

# URL de RabbitMQ
RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://tesis:tesis@rabbitmq:5672/')
```

## 📊 Modelos de Datos

### Incident
```python
{
    'id': UUID,
    'reporter_kind': 'ciudadano|operador|sistema',
    'reporter_id': UUID,
    'type': 'punto_acopio|zona_critica|animal_muerto|zona_reciclaje',
    'title': str,
    'description': str,
    'location': Point (PostGIS),
    'address': str,
    'status': 'incidente_no_validado|incidente_pendiente|incidente_valido|...',
    'incident_day': date,
    'photos_count': int,
    'idempotency_key': str,  # Para offline-first
    'created_at': datetime,
    'updated_at': datetime
}
```

### Estados del Flujo
```
incidente_no_validado
    ↓
incidente_pendiente
    ↓
incidente_valido / incidente_rechazado
    ↓
convertido_en_tarea
    ↓
cerrado
```

## 🧪 Testing

### Test Manual con curl

```bash
# Crear incidente
curl -X POST http://localhost:8000/api/v1/incidents/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "type": "animal_muerto",
    "title": "Perro atropellado",
    "latitude": -0.9367,
    "longitude": -78.6185
  }'

# Validar incidente (como admin)
curl -X POST http://localhost:8000/api/v1/incidents/{id}/validate/ \
  -H "Authorization: Bearer {admin-token}" \
  -d '{
    "action": "validate",
    "notes": "Verificado"
  }'
```

### Verificar Eventos en RabbitMQ

```bash
# Ver mensajes en la cola
docker-compose exec rabbitmq rabbitmqctl list_queues

# Management UI
open http://localhost:15672
# Usuario: tesis / Contraseña: tesis
```

## 🔍 Monitoreo y Logs

### Ver Logs del Consumer

```bash
docker-compose logs -f backend | grep "incidents"
```

### Logs de RabbitMQ

```bash
docker-compose logs -f rabbitmq
```

### Django Admin

- URL: `http://localhost:8000/admin/`
- Modelos disponibles:
  - **Incident**: Ver y gestionar incidencias
  - **IncidentEvent**: Historial de eventos
  - **IncidentAttachment**: Evidencias/fotos
  - **OutboxEvent**: Eventos pendientes de publicación

## 🔗 Integración con Sistema Go

Este sistema es **100% compatible** con el `incident-service` de Go del repositorio `latacunga_clean_app`. Ambos pueden coexistir y compartir el mismo exchange de RabbitMQ.

**Ventajas:**
- ✅ Mismo formato de eventos
- ✅ Mismo exchange y routing keys
- ✅ Pueden consumirse mutuamente los eventos
- ✅ Escalabilidad horizontal

## 📚 Referencias

- [RabbitMQ Topic Exchange](https://www.rabbitmq.com/tutorials/amqp-concepts.html#topic-exchange)
- [Django GIS](https://docs.djangoproject.com/en/4.2/ref/contrib/gis/)
- [Pika Library](https://pika.readthedocs.io/)
- [latacunga_clean_app](https://github.com/Andres09xZ/latacunga_clean_app)

## 🎯 Próximos Pasos

1. **WebSocket Integration**: Notificaciones en tiempo real al dashboard
2. **Push Notifications**: Alertas a administradores cuando llegan nuevos incidentes
3. **Validation Service**: Servicio independiente para validación automática
4. **Task Conversion**: Convertir incidentes validados en tareas para operadores
5. **Analytics Dashboard**: Métricas y reportes de incidencias

---

**¿Listo para usar el sistema?**

```bash
# Levantar servicios
docker-compose up -d

# Iniciar consumer
docker-compose exec backend python manage.py consume_incident_events

# Acceder al dashboard
open http://localhost:3001
```

🎉 **¡El sistema de eventos está listo y funcionando!**
