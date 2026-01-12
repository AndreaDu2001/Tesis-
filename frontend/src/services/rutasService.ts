import api from './apiService';
import { API_ENDPOINTS } from '../config/api';

export const listarRutas = async (params?: { zona?: string; estado?: string; skip?: number; limit?: number; }) => {
  const query = new URLSearchParams();
  if (params?.zona) query.append('zona', params.zona);
  if (params?.estado) query.append('estado', params.estado);
  const skip = params?.skip ?? 0;
  const limit = params?.limit ?? 100;
  query.append('skip', String(skip));
  query.append('limit', String(limit));
  const url = `${API_ENDPOINTS.RUTAS.LISTAR}?${query.toString()}`;
  const { data } = await api.get(url);
  return data;
};

export const crearRuta = async (payload: any) => {
  const { data } = await api.post(API_ENDPOINTS.RUTAS.CREAR, payload);
  return data;
};

export const obtenerRuta = async (id: string | number) => {
  const { data } = await api.get(API_ENDPOINTS.RUTAS.OBTENER(id));
  return data;
};

export const actualizarRuta = async (id: string | number, payload: any) => {
  const { data } = await api.patch(API_ENDPOINTS.RUTAS.ACTUALIZAR(id), payload);
  return data;
};

export const eliminarRuta = async (id: string | number) => {
  await api.delete(API_ENDPOINTS.RUTAS.ELIMINAR(id));
};

export const obtenerRutasPorZona = async (zona: string) => {
  const { data } = await api.get(API_ENDPOINTS.RUTAS.POR_ZONA(zona));
  return data;
};

const RutasService = {
  listarRutas,
  crearRuta,
  obtenerRuta,
  actualizarRuta,
  eliminarRuta,
  obtenerRutasPorZona,
};

export default RutasService;
