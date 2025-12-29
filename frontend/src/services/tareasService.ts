import api from './apiService';
import { API_ENDPOINTS } from '../config/api';

export interface Tarea {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  created_at?: string;
}

export const listarTareas = async () => {
  const { data } = await api.get(API_ENDPOINTS.TASKS.LISTAR);
  return data;
};

export const obtenerTarea = async (id: string | number) => {
  // Backend no expone GET /tasks/{id}; se filtra desde el listado
  const list = await listarTareas();
  return list.tasks?.find((t: Tarea) => String(t.id) === String(id)) || null;
};

export const crearTarea = async (payload: Partial<Tarea>) => {
  const { data } = await api.post(API_ENDPOINTS.TASKS.CREAR, payload);
  return data;
};

export const actualizarTarea = async (id: string | number, payload: Partial<Tarea>) => {
  const { data } = await api.patch(API_ENDPOINTS.TASKS.ACTUALIZAR(id), payload);
  return data;
};

export const completarTarea = async (id: string | number) => {
  const { data } = await api.post(API_ENDPOINTS.TASKS.COMPLETAR(id));
  return data;
};

export default {
  listarTareas,
  obtenerTarea,
  crearTarea,
  actualizarTarea,
  completarTarea,
};
