// Configuración de la API (FastAPI externo de Andrea)
// Variable de entorno REACT_APP_API_URL debe contener la URL base (sin /api)
// Ejemplo: https://epagal-backend-routing-latest.onrender.com
const baseURL = 'https://epagal-backend-routing-latest.onrender.com';
export const API_BASE_URL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;

export const API_ENDPOINTS = {
  // Autenticación (JWT)
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
    VERIFY: `${API_BASE_URL}/auth/verify-token`,
  },
  // Conductores
  CONDUCTORES: {
    LISTAR: `${API_BASE_URL}/conductores/`,
    CREAR: `${API_BASE_URL}/conductores/`,
    OBTENER: (id: number) => `${API_BASE_URL}/conductores/${id}`,
    ACTUALIZAR: (id: number) => `${API_BASE_URL}/conductores/${id}`,
    ELIMINAR: (id: number) => `${API_BASE_URL}/conductores/${id}`,
    MIS_RUTAS_TODAS: `${API_BASE_URL}/conductores/mis-rutas/todas`,
    MIS_RUTAS_ACTUAL: `${API_BASE_URL}/conductores/mis-rutas/actual`,
    INICIAR_RUTA: `${API_BASE_URL}/conductores/iniciar-ruta`,
    FINALIZAR_RUTA: `${API_BASE_URL}/conductores/finalizar-ruta`,
    ASIGNACIONES_RUTA: (rutaId: number) => `${API_BASE_URL}/conductores/asignaciones/ruta/${rutaId}`,
  },
  // Rutas
  RUTAS: {
    LISTAR: `${API_BASE_URL}/rutas/`,
    CREAR: `${API_BASE_URL}/rutas/`,
    OBTENER: (rutaId: number) => `${API_BASE_URL}/rutas/${rutaId}`,
    ACTUALIZAR: (rutaId: number) => `${API_BASE_URL}/rutas/${rutaId}`,
    ELIMINAR: (rutaId: number) => `${API_BASE_URL}/rutas/${rutaId}`,
    GENERAR: (zona: string) => `${API_BASE_URL}/rutas/generar/${zona}`,
    DETALLES: (rutaId: number) => `${API_BASE_URL}/rutas/${rutaId}/detalles`,
    POR_ZONA: (zona: string) => `${API_BASE_URL}/rutas/zona/${zona}`,
  },
  // Incidencias
  INCIDENCIAS: {
    LISTAR: `${API_BASE_URL}/incidencias/`,
    CREAR: `${API_BASE_URL}/incidencias/`,
    STATS: `${API_BASE_URL}/incidencias/stats`,
    OBTENER: (id: number) => `${API_BASE_URL}/incidencias/${id}`,
    ACTUALIZAR: (id: number) => `${API_BASE_URL}/incidencias/${id}`,
    ELIMINAR: (id: number) => `${API_BASE_URL}/incidencias/${id}`,
  },
  // Incidents (alias en inglés)
  INCIDENTS: {
    LISTAR: `${API_BASE_URL}/incidents/`,
    CREAR: `${API_BASE_URL}/incidents/`,
    OBTENER: (id: number) => `${API_BASE_URL}/incidents/${id}`,
    ACTUALIZAR: (id: number) => `${API_BASE_URL}/incidents/${id}`,
    ELIMINAR: (id: number) => `${API_BASE_URL}/incidents/${id}`,
  },
  // Tareas
  TASKS: {
    LISTAR: `${API_BASE_URL}/tasks/`,
    CREAR: `${API_BASE_URL}/tasks/`,
    OBTENER: (id: number) => `${API_BASE_URL}/tasks/${id}`,
    ACTUALIZAR: (id: number) => `${API_BASE_URL}/tasks/${id}`,
    ELIMINAR: (id: number) => `${API_BASE_URL}/tasks/${id}`,
    COMPLETAR: (id: number) => `${API_BASE_URL}/tasks/${id}/complete`,
  },
  // Notificaciones
  NOTIFICATIONS: {
    LISTAR: `${API_BASE_URL}/notifications/`,
    LEER: (id: number) => `${API_BASE_URL}/notifications/${id}/read`,
    LEER_TODAS: `${API_BASE_URL}/notifications/read-all`,
  },
  // Reportes
  REPORTS: {
    ESTADISTICAS: `${API_BASE_URL}/reports/statistics/`,
    EXPORTAR: `${API_BASE_URL}/reports/export/`,
  },
};

export default API_ENDPOINTS;
