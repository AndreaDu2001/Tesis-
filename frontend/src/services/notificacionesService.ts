import api from './apiService';
import { API_BASE_URL } from '../config/api';

export interface Notificacion {
  id: number;
  tipo: 'info' | 'warning' | 'error' | 'success';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
  usuario_id: number;
  datos_extra?: any;
}

// Funciones simuladas hasta que existan en el backend
export const listarNotificaciones = async (params?: { leida?: boolean; limit?: number; }) => {
  // TODO: Implementar GET /api/notificaciones/
  return {
    total: 0,
    no_leidas: 0,
    notificaciones: [] as Notificacion[],
  };
};

export const marcarComoLeida = async (id: number) => {
  // TODO: Implementar PATCH /api/notificaciones/{id}/leer
  return { id, leida: true };
};

export const marcarTodasLeidas = async () => {
  // TODO: Implementar POST /api/notificaciones/leer-todas
  return { mensaje: 'Todas las notificaciones marcadas como leídas' };
};

export default {
  listarNotificaciones,
  marcarComoLeida,
  marcarTodasLeidas,
};
