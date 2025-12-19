// Configuración de API - Backend FastAPI en Render
// Backend: https://epagal-backend-routing-latest.onrender.com
// Documentación: https://epagal-backend-routing-latest.onrender.com/docs

// Normaliza la base para evitar errores si la env incluye /api o /api/v1
const normalizeBase = (raw?: string) => {
  const fallback = 'https://epagal-backend-routing-latest.onrender.com';
  if (!raw) return fallback;
  let base = raw.trim();
  base = base.replace(/\/api(?:\/v1)?$/i, '');
  base = base.replace(/\/+$/g, '');
  return base || fallback;
};

// URLs de servicios (FastAPI en Render). Permite override via entorno.
const API_BASE = normalizeBase(process.env.REACT_APP_API_BASE);
const API_PREFIX = '/api';

// NOTA: En Render, todos los servicios están en la misma URL con prefijo /api
// En desarrollo local, usa REACT_APP_API_BASE=http://localhost:8000

const AUTH_SERVICE = API_BASE;
const API_V1 = API_PREFIX;

export const API_BASE_URL = `${API_BASE}${API_PREFIX}`;

export const API_ENDPOINTS = {
  // ==================== AUTENTICACIÓN ====================
  AUTH: {
    LOGIN: `${AUTH_SERVICE}${API_V1}/auth/login`,
    LOGOUT: `${AUTH_SERVICE}${API_V1}/auth/logout`,
    ME: `${AUTH_SERVICE}${API_V1}/auth/me`,
  },

  // ==================== CONDUCTORES ====================
  CONDUCTORES: {
    LISTAR: `${AUTH_SERVICE}${API_V1}/conductores/`,
    CREAR: `${AUTH_SERVICE}${API_V1}/conductores/`,
    OBTENER: (id: string | number) => `${AUTH_SERVICE}${API_V1}/conductores/${id}`,
    ACTUALIZAR: (id: string | number) => `${AUTH_SERVICE}${API_V1}/conductores/${id}`,
    ELIMINAR: (id: string | number) => `${AUTH_SERVICE}${API_V1}/conductores/${id}`,
    MIS_RUTAS_TODAS: `${AUTH_SERVICE}${API_V1}/conductores/mis-rutas/todas`,
    MIS_RUTAS_ACTUAL: `${AUTH_SERVICE}${API_V1}/conductores/mis-rutas/actual`,
  },

  // ==================== INCIDENTES ====================
  INCIDENCIAS: {
    LISTAR: `${AUTH_SERVICE}${API_V1}/incidencias/`,
    CREAR: `${AUTH_SERVICE}${API_V1}/incidencias/`,
    OBTENER: (id: string | number) => `${AUTH_SERVICE}${API_V1}/incidencias/${id}`,
    ACTUALIZAR: (id: string | number) => `${AUTH_SERVICE}${API_V1}/incidencias/${id}`,
    ELIMINAR: (id: string | number) => `${AUTH_SERVICE}${API_V1}/incidencias/${id}`,
    STATS: `${AUTH_SERVICE}${API_V1}/incidencias/stats`,
  },

  // ==================== RUTAS ====================
  RUTAS: {
    LISTAR: `${AUTH_SERVICE}${API_V1}/rutas/`,
    CREAR: `${AUTH_SERVICE}${API_V1}/rutas/`,
    OBTENER: (id: string | number) => `${AUTH_SERVICE}${API_V1}/rutas/${id}`,
    ACTUALIZAR: (id: string | number) => `${AUTH_SERVICE}${API_V1}/rutas/${id}`,
    ELIMINAR: (id: string | number) => `${AUTH_SERVICE}${API_V1}/rutas/${id}`,
    POR_ZONA: (zona: string) => `${AUTH_SERVICE}${API_V1}/rutas/zona/${zona}`,
  },

  // ==================== TAREAS ====================
  TASKS: {
    LISTAR: `${AUTH_SERVICE}${API_V1}/tasks/`,
    CREAR: `${AUTH_SERVICE}${API_V1}/tasks/`,
    ACTUALIZAR: (id: string | number) => `${AUTH_SERVICE}${API_V1}/tasks/${id}`,
    COMPLETAR: (id: string | number) => `${AUTH_SERVICE}${API_V1}/tasks/${id}/complete`,
  },

  // ==================== NOTIFICACIONES ====================
  NOTIFICATIONS: {
    LISTAR: `${AUTH_SERVICE}${API_V1}/notifications/`,
    LEER: (id: string | number) => `${AUTH_SERVICE}${API_V1}/notifications/${id}/read`,
    LEER_TODAS: `${AUTH_SERVICE}${API_V1}/notifications/read-all`,
  },

  // ==================== REPORTES ====================
  REPORTS: {
    ESTADISTICAS: `${AUTH_SERVICE}${API_V1}/reports/statistics/`,
    EXPORTAR: `${AUTH_SERVICE}${API_V1}/reports/export/`,
  },
};

export default API_ENDPOINTS;
