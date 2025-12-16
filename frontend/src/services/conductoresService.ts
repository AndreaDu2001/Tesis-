import api from './apiService';
import { API_ENDPOINTS } from '../config/api';

// ==================== CONDUCTORES ====================

export const listarConductores = async (params?: { skip?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.append('skip', String(params.skip));
  if (params?.limit !== undefined) query.append('limit', String(params.limit));
  const url = query.toString() ? `${API_ENDPOINTS.CONDUCTORES.LISTAR}?${query.toString()}` : API_ENDPOINTS.CONDUCTORES.LISTAR;
  const { data } = await api.get(url);
  return data;
};

export const obtenerConductor = async (driverId: string) => {
  const { data } = await api.get(API_ENDPOINTS.CONDUCTORES.OBTENER(driverId));
  return data;
};

export const crearConductor = async (payload: any) => {
  const { data } = await api.post(API_ENDPOINTS.CONDUCTORES.CREAR, payload);
  return data;
};

export const actualizarConductor = async (driverId: string, payload: any) => {
  const { data } = await api.patch(API_ENDPOINTS.CONDUCTORES.ACTUALIZAR(driverId), payload);
  return data;
};

// ==================== TURNOS ====================

export const iniciarTurno = async (driverId: string, truckPlate: string) => {
  const { data } = await api.post(API_ENDPOINTS.CONDUCTORES.CLOCK_IN, {
    driver_id: driverId,
    truck_plate: truckPlate,
  });
  return data;
};

export const finalizarTurno = async (shiftId: string) => {
  const { data } = await api.post(API_ENDPOINTS.CONDUCTORES.CLOCK_OUT, {
    shift_id: shiftId,
  });
  return data;
};

// ==================== CAMIONES ====================

export const listarCamiones = async (params?: { status?: string; type?: string }) => {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.type) query.append('type', params.type);
  const url = query.toString() ? `${API_ENDPOINTS.CONDUCTORES.TRUCKS_LISTAR}?${query.toString()}` : API_ENDPOINTS.CONDUCTORES.TRUCKS_LISTAR;
  const { data } = await api.get(url);
  return data;
};

export const crearCamion = async (payload: { plate: string; type: string; status?: string }) => {
  const { data } = await api.post(API_ENDPOINTS.CONDUCTORES.TRUCKS_CREAR, payload);
  return data;
};

export default {
  listarConductores,
  obtenerConductor,
  crearConductor,
  actualizarConductor,
  iniciarTurno,
  finalizarTurno,
  listarCamiones,
  crearCamion,
};
