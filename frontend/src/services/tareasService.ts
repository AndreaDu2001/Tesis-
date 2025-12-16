import api from './apiService';
import { API_BASE_URL } from '../config/api';

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  conductor_id?: number;
  ruta_id?: number;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fecha_creacion: string;
  fecha_vencimiento?: string;
  fecha_completada?: string;
}

// Funciones simuladas hasta que existan en el backend
export const listarTareas = async (params?: { estado?: string; conductor_id?: number; }) => {
  // TODO: Implementar cuando el backend tenga endpoint /api/tareas/
  return {
    total: 0,
    tareas: [] as Tarea[],
  };
};

export const crearTarea = async (payload: Partial<Tarea>) => {
  // TODO: Implementar POST /api/tareas/
  return payload;
};

export const actualizarTarea = async (id: number, payload: Partial<Tarea>) => {
  // TODO: Implementar PATCH /api/tareas/{id}
  return payload;
};

export const completarTarea = async (id: number, notas?: string) => {
  // TODO: Implementar POST /api/tareas/{id}/completar
  return { id, notas };
};

export default {
  listarTareas,
  crearTarea,
  actualizarTarea,
  completarTarea,
};
