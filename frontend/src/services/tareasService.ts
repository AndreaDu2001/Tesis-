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
  console.warn('Tareas: endpoint no disponible en backend actual, devolviendo placeholder.');
  return {
    total: 0,
    tareas: [] as Tarea[],
  };
};

export const obtenerTarea = async (id: string | number) => {
  console.warn('Tareas: obtenerTarea no disponible en backend actual.');
  return null;
};

export const iniciarTarea = async (id: string | number) => {
  console.warn('Tareas: iniciarTarea no disponible en backend actual.');
  return null;
};

export const finalizarTarea = async (id: string | number, notas?: string) => {
  console.warn('Tareas: finalizarTarea no disponible en backend actual.');
  return null;
};

export const completarParada = async (stopId: string | number) => {
  console.warn('Tareas: completarParada no disponible en backend actual.');
  return null;
};

export default {
  listarTareas,
  obtenerTarea,
  iniciarTarea,
  finalizarTarea,
  completarParada,
};
