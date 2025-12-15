import api from './apiService';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

export const misRutasTodas = async (estado?: string) => {
  const url = API_ENDPOINTS.CONDUCTORES.MIS_RUTAS_TODAS + (estado ? `?estado=${estado}` : '');
  const { data } = await api.get(url);
  return data; // { total, asignado, iniciado, completado, rutas: [] }
};

export const miRutaActual = async () => {
  const { data } = await api.get(API_ENDPOINTS.CONDUCTORES.MIS_RUTAS_ACTUAL);
  return data; // { message, ruta_actual }
};

export const iniciarRuta = async (rutaId: number) => {
  const { data } = await api.post(API_ENDPOINTS.CONDUCTORES.INICIAR_RUTA, { ruta_id: rutaId });
  return data; // { message, asignacion_id, ruta_id, fecha_inicio, estado }
};

export const finalizarRuta = async (rutaId: number, notas?: string) => {
  const { data } = await api.post(API_ENDPOINTS.CONDUCTORES.FINALIZAR_RUTA, { ruta_id: rutaId, notas });
  return data; // { message, asignacion_id, ruta_id, fecha_finalizacion, estado }
};

export const asignacionesPorRuta = async (rutaId: number) => {
  const { data } = await api.get(API_ENDPOINTS.CONDUCTORES.ASIGNACIONES_RUTA(rutaId));
  return data; // Lista de asignaciones
};

// Endpoints de administración
export const listarConductores = async (params?: { estado?: string; zona?: string; skip?: number; limit?: number; }) => {
  const query = new URLSearchParams();
  if (params?.estado) query.append('estado', params.estado);
  if (params?.zona) query.append('zona', params.zona);
  if (params?.skip !== undefined) query.append('skip', String(params.skip));
  if (params?.limit !== undefined) query.append('limit', String(params.limit));
  const { data } = await api.get(`${API_BASE_URL}/conductores/?${query.toString()}`);
  return data;
};

export const conductoresDisponibles = async (zona?: string) => {
  const url = `${API_BASE_URL}/conductores/disponibles` + (zona ? `?zona=${zona}` : '');
  const { data } = await api.get(url);
  return data;
};

export const crearAsignacion = async (payload: { ruta_id: number; conductor_id: number; camion_tipo: string; camion_id: string; }) => {
  const { data } = await api.post(`${API_BASE_URL}/conductores/asignaciones/`, payload);
  return data;
};

export default {
  misRutasTodas,
  miRutaActual,
  iniciarRuta,
  finalizarRuta,
  asignacionesPorRuta,
  listarConductores,
  conductoresDisponibles,
  crearAsignacion,
};
