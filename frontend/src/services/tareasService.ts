import api from './apiService';
import { API_ENDPOINTS } from '../config/api';

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  conductor_id?: number;
  ruta_id?: number;
  estado: 'pending' | 'en_progreso' | 'completed' | 'cancelada';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fecha_creacion: string;
  fecha_vencimiento?: string;
  fecha_completada?: string;
}

export const listarTareas = async (params?: { estado?: string; conductor_id?: number; }) => {
  try {
    const { data } = await api.get(API_ENDPOINTS.TASKS.LISTAR);
    return {
      total: data.length || 0,
      tareas: data || [],
    };
  } catch (error) {
    console.error('Error listando tareas:', error);
    return {
      total: 0,
      tareas: [] as Tarea[],
    };
  }
};

export const obtenerTarea = async (id: string | number) => {
  const { data } = await api.get(API_ENDPOINTS.TASKS.OBTENER(String(id)));
  return data;
};

export const iniciarTarea = async (id: string | number) => {
  const { data } = await api.post(API_ENDPOINTS.TASKS.INICIAR(String(id)));
  return data;
};

export const finalizarTarea = async (id: string | number, notas?: string) => {
  const { data } = await api.post(API_ENDPOINTS.TASKS.FINALIZAR(String(id)), { notas });
  return data;
};

export const completarParada = async (stopId: string | number) => {
  const { data } = await api.post(API_ENDPOINTS.TASKS.COMPLETAR_PARADA(String(stopId)));
  return data;
};

export default {
  listarTareas,
  obtenerTarea,
  iniciarTarea,
  finalizarTarea,
  completarParada,
};
