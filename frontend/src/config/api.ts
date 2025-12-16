// Configuración de API - Microservicios en Go (latacunga_clean_app)
// Cada servicio está en su propio puerto
// Backend externo: https://github.com/Andres09xZ/latacunga_clean_app.git

// URLs de servicios (producción en Render/local)
const AUTH_SERVICE = 'https://epagal-backend-routing-latest.onrender.com'; // Puerto 8080 local
const FLEET_SERVICE = 'https://epagal-backend-routing-latest.onrender.com'; // Puerto 8081 local
const INCIDENT_SERVICE = 'https://epagal-backend-routing-latest.onrender.com'; // Puerto 8082 local
const OPERATIONS_SERVICE = 'https://epagal-backend-routing-latest.onrender.com'; // Puerto 8085 local

// NOTA: En Render, todos los servicios están detrás de un proxy/load balancer en la misma URL
// En desarrollo local, usar ports: 8080, 8081, 8082, 8083, 8085

const API_V1 = '/api/v1';

export const API_BASE_URL = 'https://epagal-backend-routing-latest.onrender.com/api/v1';

export const API_ENDPOINTS = {
  // ==================== AUTENTICACIÓN (Auth Service: 8080) ====================
  AUTH: {
    // Registro de Operadores (internos del sistema)
    REGISTER_OPERATOR: `${AUTH_SERVICE}${API_V1}/auth/operators`,
    // Registro de Ciudadanos (vía OTP)
    REGISTER_CITIZEN: `${AUTH_SERVICE}${API_V1}/auth/register`,
    // Login (email + password para operadores, OTP para ciudadanos)
    LOGIN: `${AUTH_SERVICE}${API_V1}/auth/login`,
    LOGOUT: `${AUTH_SERVICE}${API_V1}/auth/logout`,
    ME: `${AUTH_SERVICE}${API_V1}/auth/me`,
    VERIFY: `${AUTH_SERVICE}${API_V1}/auth/verify-token`,
  },

  // ==================== FLOTAS (Fleet Service: 8081) ====================
  CONDUCTORES: {
    // Camiones
    TRUCKS_LISTAR: `${FLEET_SERVICE}${API_V1}/trucks`,
    TRUCKS_CREAR: `${FLEET_SERVICE}${API_V1}/trucks`,
    TRUCKS_OBTENER: (id: string) => `${FLEET_SERVICE}${API_V1}/trucks/${id}`,
    TRUCKS_ACTUALIZAR: (id: string) => `${FLEET_SERVICE}${API_V1}/trucks/${id}`,
    TRUCKS_ELIMINAR: (id: string) => `${FLEET_SERVICE}${API_V1}/trucks/${id}`,

    // Conductores/Drivers
    LISTAR: `${FLEET_SERVICE}${API_V1}/drivers`,
    CREAR: `${FLEET_SERVICE}${API_V1}/drivers`,
    OBTENER: (id: string) => `${FLEET_SERVICE}${API_V1}/drivers/${id}`,
    ACTUALIZAR: (id: string) => `${FLEET_SERVICE}${API_V1}/drivers/${id}`,
    ELIMINAR: (id: string) => `${FLEET_SERVICE}${API_V1}/drivers/${id}`,

    // Turnos (Shifts)
    CLOCK_IN: `${FLEET_SERVICE}${API_V1}/shifts/clock-in`,
    CLOCK_OUT: `${FLEET_SERVICE}${API_V1}/shifts/clock-out`,
    ACTIVE_SHIFT: (driverId: string) => `${FLEET_SERVICE}${API_V1}/shifts/active/${driverId}`,

    // Rutas (Legacy - si están en Fleet Service)
    MIS_RUTAS_TODAS: `${FLEET_SERVICE}${API_V1}/drivers/routes/all`,
    MIS_RUTAS_ACTUAL: `${FLEET_SERVICE}${API_V1}/drivers/routes/current`,
    INICIAR_RUTA: `${FLEET_SERVICE}${API_V1}/drivers/routes/start`,
    FINALIZAR_RUTA: `${FLEET_SERVICE}${API_V1}/drivers/routes/end`,
  },

  // ==================== INCIDENTES (Incident Service: 8082) ====================
  INCIDENCIAS: {
    LISTAR: `${INCIDENT_SERVICE}${API_V1}/incidents`,
    CREAR: `${INCIDENT_SERVICE}${API_V1}/incidents`,
    OBTENER: (id: string) => `${INCIDENT_SERVICE}${API_V1}/incidents/${id}`,
    ACTUALIZAR: (id: string) => `${INCIDENT_SERVICE}${API_V1}/incidents/${id}`,
    ELIMINAR: (id: string) => `${INCIDENT_SERVICE}${API_V1}/incidents/${id}`,
    STATS: `${INCIDENT_SERVICE}${API_V1}/incidents/statistics`,
  },

  // Alias en inglés
  INCIDENTS: {
    LISTAR: `${INCIDENT_SERVICE}${API_V1}/incidents`,
    CREAR: `${INCIDENT_SERVICE}${API_V1}/incidents`,
    OBTENER: (id: string) => `${INCIDENT_SERVICE}${API_V1}/incidents/${id}`,
    ACTUALIZAR: (id: string) => `${INCIDENT_SERVICE}${API_V1}/incidents/${id}`,
    ELIMINAR: (id: string) => `${INCIDENT_SERVICE}${API_V1}/incidents/${id}`,
  },

  // ==================== OPERACIONES (Operations Service: 8085) ====================
  TASKS: {
    // Work Orders / Órdenes de Trabajo
    LISTAR: `${OPERATIONS_SERVICE}${API_V1}/driver/orders/active`,
    OBTENER: (id: string) => `${OPERATIONS_SERVICE}${API_V1}/driver/orders/${id}`,
    INICIAR: (id: string) => `${OPERATIONS_SERVICE}${API_V1}/driver/orders/${id}/start`,
    FINALIZAR: (id: string) => `${OPERATIONS_SERVICE}${API_V1}/driver/orders/${id}/finish`,
    
    // Paradas (Stops) dentro de Work Orders
    COMPLETAR_PARADA: (stopId: string) => `${OPERATIONS_SERVICE}${API_V1}/driver/stops/${stopId}/complete`,
  },

  // ==================== NOTIFICACIONES ====================
  NOTIFICATIONS: {
    LISTAR: `${AUTH_SERVICE}${API_V1}/notifications`,
    LEER: (id: string) => `${AUTH_SERVICE}${API_V1}/notifications/${id}/read`,
    LEER_TODAS: `${AUTH_SERVICE}${API_V1}/notifications/read-all`,
  },

  // ==================== REPORTES ====================
  REPORTS: {
    ESTADISTICAS: `${FLEET_SERVICE}${API_V1}/zones/statistics`,
    METRICAS_ZONA: (zoneId: number) => `${FLEET_SERVICE}${API_V1}/zones/${zoneId}/metrics`,
  },

  // ==================== SCHEDULER (Planning) ====================
  SCHEDULER: {
    METRICAS_ZONA: (zoneId: number) => `${FLEET_SERVICE}${API_V1}/zones/${zoneId}/metrics`,
  },
};

export default API_ENDPOINTS;
