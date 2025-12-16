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

export const crearTarea = async (payload: Partial<Tarea>) => {
  try {
    const { data } = await api.post(API_ENDPOINTS.TASKS.CREAR, payload);
    return data;
  } catch (error) {
    console.error('Error creando tarea:', error);
    throw error;
  }
};

export const actualizarTarea = async (id: number, payload: Partial<Tarea>) => {
  try {
    const { data } = await api.patch(API_ENDPOINTS.TASKS.ACTUALIZAR(id), payload);
    return data;
  } catch (error) {
    console.error('Error actualizando tarea:', error);
    throw error;
  }
};

export const completarTarea = async (id: number, notas?: string) => {
  try {
    const { data } = await api.post(API_ENDPOINTS.TASKS.COMPLETAR(id), { notas });
    return data;
  } catch (error) {
    console.error('Error completando tarea:', error);
    throw error;
  }
};

export default {
  listarTareas,
  crearTarea,
  actualizarTarea,
  completarTarea,
};
