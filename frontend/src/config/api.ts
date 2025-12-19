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

// URLs de servicios: soporte para 2 backends (primario y secundario)
// Primario: backend de incidencias y servicios conocidos (consumo)
// Secundario: backend de routing/servicios faltantes (por ej. epagal-backend-routing-latest)
const PRIMARY_BASE = normalizeBase(
  process.env.REACT_APP_API_BASE_PRIMARY || process.env.REACT_APP_API_BASE
);
const SECONDARY_BASE = normalizeBase(
  process.env.REACT_APP_API_BASE_SECONDARY || 'https://epagal-backend-routing-latest.onrender.com'
);
const API_PREFIX = '/api';

// Flags por grupo para dirigir llamadas al backend secundario si el primario no lo tiene
const useSecondary = {
  CONDUCTORES: String(process.env.REACT_APP_USE_SECONDARY_CONDUCTORES || '').toLowerCase() === 'true',
  INCIDENCIAS: String(process.env.REACT_APP_USE_SECONDARY_INCIDENCIAS || '').toLowerCase() === 'true',
  RUTAS: String(process.env.REACT_APP_USE_SECONDARY_RUTAS || '').toLowerCase() === 'true',
  TASKS: String(process.env.REACT_APP_USE_SECONDARY_TASKS || '').toLowerCase() === 'true',
  NOTIFICATIONS: String(process.env.REACT_APP_USE_SECONDARY_NOTIFICATIONS || '').toLowerCase() === 'true',
  REPORTS: String(process.env.REACT_APP_USE_SECONDARY_REPORTS || '').toLowerCase() === 'true',
} as const;

const baseFor = (group: keyof typeof useSecondary) => (useSecondary[group] ? SECONDARY_BASE : PRIMARY_BASE);

// NOTA: En Render, todos los servicios están en la misma URL con prefijo /api
// En desarrollo local, usa REACT_APP_API_BASE_PRIMARY=http://localhost:8000

const API_V1 = API_PREFIX;

export const API_BASE_URL = `${PRIMARY_BASE}${API_PREFIX}`;

export const API_ENDPOINTS = {
  // ==================== AUTENTICACIÓN ====================
  AUTH: {
    LOGIN: `${baseFor('INCIDENCIAS')}${API_V1}/auth/login`,
    LOGOUT: `${baseFor('INCIDENCIAS')}${API_V1}/auth/logout`,
    ME: `${baseFor('INCIDENCIAS')}${API_V1}/auth/me`,
  },

  // ==================== CONDUCTORES ====================
  CONDUCTORES: {
    LISTAR: `${baseFor('CONDUCTORES')}${API_V1}/conductores/`,
    CREAR: `${baseFor('CONDUCTORES')}${API_V1}/conductores/`,
    OBTENER: (id: string | number) => `${baseFor('CONDUCTORES')}${API_V1}/conductores/${id}`,
    ACTUALIZAR: (id: string | number) => `${baseFor('CONDUCTORES')}${API_V1}/conductores/${id}`,
    ELIMINAR: (id: string | number) => `${baseFor('CONDUCTORES')}${API_V1}/conductores/${id}`,
    MIS_RUTAS_TODAS: `${baseFor('CONDUCTORES')}${API_V1}/conductores/mis-rutas/todas`,
    MIS_RUTAS_ACTUAL: `${baseFor('CONDUCTORES')}${API_V1}/conductores/mis-rutas/actual`,
  },

  // ==================== INCIDENTES ====================
  INCIDENCIAS: {
    LISTAR: `${baseFor('INCIDENCIAS')}${API_V1}/incidencias/`,
    CREAR: `${baseFor('INCIDENCIAS')}${API_V1}/incidencias/`,
    OBTENER: (id: string | number) => `${baseFor('INCIDENCIAS')}${API_V1}/incidencias/${id}`,
    ACTUALIZAR: (id: string | number) => `${baseFor('INCIDENCIAS')}${API_V1}/incidencias/${id}`,
    ELIMINAR: (id: string | number) => `${baseFor('INCIDENCIAS')}${API_V1}/incidencias/${id}`,
    STATS: `${baseFor('INCIDENCIAS')}${API_V1}/incidencias/stats`,
  },

  // ==================== RUTAS ====================
  RUTAS: {
    LISTAR: `${baseFor('RUTAS')}${API_V1}/rutas/`,
    CREAR: `${baseFor('RUTAS')}${API_V1}/rutas/`,
    OBTENER: (id: string | number) => `${baseFor('RUTAS')}${API_V1}/rutas/${id}`,
    ACTUALIZAR: (id: string | number) => `${baseFor('RUTAS')}${API_V1}/rutas/${id}`,
    ELIMINAR: (id: string | number) => `${baseFor('RUTAS')}${API_V1}/rutas/${id}`,
    POR_ZONA: (zona: string) => `${baseFor('RUTAS')}${API_V1}/rutas/zona/${zona}`,
  },

  // ==================== TAREAS ====================
  TASKS: {
    LISTAR: `${baseFor('TASKS')}${API_V1}/tasks/`,
    CREAR: `${baseFor('TASKS')}${API_V1}/tasks/`,
    ACTUALIZAR: (id: string | number) => `${baseFor('TASKS')}${API_V1}/tasks/${id}`,
    COMPLETAR: (id: string | number) => `${baseFor('TASKS')}${API_V1}/tasks/${id}/complete`,
  },

  // ==================== NOTIFICACIONES ====================
  NOTIFICATIONS: {
    LISTAR: `${baseFor('NOTIFICATIONS')}${API_V1}/notifications/`,
    LEER: (id: string | number) => `${baseFor('NOTIFICATIONS')}${API_V1}/notifications/${id}/read`,
    LEER_TODAS: `${baseFor('NOTIFICATIONS')}${API_V1}/notifications/read-all`,
  },

  // ==================== REPORTES ====================
  REPORTS: {
    ESTADISTICAS: `${baseFor('REPORTS')}${API_V1}/reports/statistics/`,
    EXPORTAR: `${baseFor('REPORTS')}${API_V1}/reports/export/`,
  },
};

export default API_ENDPOINTS;
