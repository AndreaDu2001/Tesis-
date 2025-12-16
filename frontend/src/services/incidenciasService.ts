import api from './apiService';
import { API_ENDPOINTS } from '../config/api';

export const listarIncidencias = async (params?: { estado?: string; zona?: string; tipo?: string; skip?: number; limit?: number; }) => {
  const query = new URLSearchParams();
  if (params?.estado) query.append('estado', params.estado);
  if (params?.zona) query.append('zona', params.zona);
  if (params?.tipo) query.append('tipo', params.tipo);
  if (params?.skip !== undefined) query.append('skip', String(params.skip));
  if (params?.limit !== undefined) query.append('limit', String(params.limit));
  const { data } = await api.get(`${API_ENDPOINTS.INCIDENCIAS.LISTAR}?${query.toString()}`);
  return data;
};

export const crearIncidencia = async (payload: any, autoGenerarRuta = false) => {
  const { data } = await api.post(`${API_ENDPOINTS.INCIDENCIAS.CREAR}?auto_generar_ruta=${autoGenerarRuta}`, payload);
  return data;
};

export const obtenerIncidencia = async (id: string | number) => {
  const { data } = await api.get(API_ENDPOINTS.INCIDENCIAS.OBTENER(String(id)));
  return data;
};

export const actualizarIncidencia = async (id: string | number, payload: any) => {
  const { data } = await api.patch(API_ENDPOINTS.INCIDENCIAS.ACTUALIZAR(String(id)), payload);
  return data;
};

export const eliminarIncidencia = async (id: string | number) => {
  await api.delete(API_ENDPOINTS.INCIDENCIAS.ELIMINAR(String(id)));
};

export const estadisticasIncidencias = async () => {
  const { data } = await api.get(API_ENDPOINTS.INCIDENCIAS.STATS);
  return data;
};

export const verificarUmbralZona = async (zona: string) => {
  const { data } = await api.get(`${API_ENDPOINTS.INCIDENCIAS.LISTAR.replace('/incidencias/', `/incidencias/zona/${zona}/umbral`)}`);
  return data; // { zona, suma_gravedad, umbral_configurado, debe_generar_ruta, incidencias_pendientes }
};

export default {
  listarIncidencias,
  crearIncidencia,
  obtenerIncidencia,
  actualizarIncidencia,
  eliminarIncidencia,
  estadisticasIncidencias,
  verificarUmbralZona,
};
