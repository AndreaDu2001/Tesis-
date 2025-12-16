// Configuración de API - Microservicios en Go (latacunga_clean_app)
// Cada servicio está en su propio puerto
// Backend externo: https://github.com/Andres09xZ/latacunga_clean_app.git

// URLs de servicios (FastAPI en Render). Permite override via entorno.
const API_BASE = process.env.REACT_APP_API_BASE || 'https://tesis-c5yj.onrender.com';
const API_PREFIX = process.env.REACT_APP_API_PREFIX || '/api';

// NOTA: En Render, todos los servicios están detrás de un proxy/load balancer en la misma URL
// En desarrollo local, puedes usar REACT_APP_API_BASE=http://localhost:8000 y REACT_APP_API_PREFIX=/api

const AUTH_SERVICE = API_BASE;
const FLEET_SERVICE = API_BASE;
const INCIDENT_SERVICE = API_BASE;
const OPERATIONS_SERVICE = API_BASE;

const API_V1 = API_PREFIX;

export const API_BASE_URL = `${API_BASE}${API_PREFIX}`;

export const API_ENDPOINTS = {
  // ==================== AUTENTICACIÓN (Auth Service: 8080) ====================
  AUTH: {
    LOGIN: `${AUTH_SERVICE}${API_V1}/auth/login`,
    LOGOUT: `${AUTH_SERVICE}${API_V1}/auth/logout`,
    ME: `${AUTH_SERVICE}${API_V1}/auth/me`,
  },

  // ==================== FLOTAS (Fleet Service: 8081) ====================
  CONDUCTORES: {
    // Rutas asociadas a conductores
    MIS_RUTAS_TODAS: `${FLEET_SERVICE}${API_V1}/conductores/mis-rutas/todas`,
    MIS_RUTAS_ACTUAL: `${FLEET_SERVICE}${API_V1}/conductores/mis-rutas/actual`,
    INICIAR_RUTA: `${FLEET_SERVICE}${API_V1}/conductores/iniciar-ruta`,
    FINALIZAR_RUTA: `${FLEET_SERVICE}${API_V1}/conductores/finalizar-ruta`,
    DISPONIBLES: `${FLEET_SERVICE}${API_V1}/conductores/disponibles`,
    ASIGNACIONES: `${FLEET_SERVICE}${API_V1}/conductores/asignaciones/`,
    ASIGNACIONES_POR_RUTA: (id: string) => `${FLEET_SERVICE}${API_V1}/conductores/asignaciones/ruta/${id}`,
  },

  // ==================== INCIDENTES (Incident Service: 8082) ====================
  INCIDENCIAS: {
    LISTAR: `${INCIDENT_SERVICE}${API_V1}/incidencias/`,
    CREAR: `${INCIDENT_SERVICE}${API_V1}/incidencias/`,
    OBTENER: (id: string) => `${INCIDENT_SERVICE}${API_V1}/incidencias/${id}`,
    ACTUALIZAR: (id: string) => `${INCIDENT_SERVICE}${API_V1}/incidencias/${id}`,
    ELIMINAR: (id: string) => `${INCIDENT_SERVICE}${API_V1}/incidencias/${id}`,
    STATS: `${INCIDENT_SERVICE}${API_V1}/incidencias/stats`,
    UMBRAL: (zona: string) => `${INCIDENT_SERVICE}${API_V1}/incidencias/zona/${zona}/umbral`,
  },

  // ==================== OPERACIONES (Operations Service: 8085) ====================
  TASKS: {
    // Placeholder sin backend
    LISTAR: '#',
    OBTENER: (_id: string) => '#',
    INICIAR: (_id: string) => '#',
    FINALIZAR: (_id: string) => '#',
    COMPLETAR_PARADA: (_stopId: string) => '#',
  },

  // ==================== NOTIFICACIONES ====================
  NOTIFICATIONS: {
    // Placeholder sin backend
    LISTAR: '#',
    LEER: (_id: string) => '#',
    LEER_TODAS: '#',
  },

  // ==================== REPORTES ====================
  REPORTS: {
    ESTADISTICAS: `${INCIDENT_SERVICE}${API_V1}/incidencias/stats`,
    METRICAS_ZONA: (zoneId: number) => `${INCIDENT_SERVICE}${API_V1}/incidencias/zona/${zoneId}/umbral`,
  },

  // ==================== SCHEDULER (Planning) ====================
  SCHEDULER: {
    METRICAS_ZONA: (zoneId: number) => `${FLEET_SERVICE}${API_V1}/zones/${zoneId}/metrics`,
  },
};

export default API_ENDPOINTS;
