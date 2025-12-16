import api from './apiService';
import { API_ENDPOINTS } from '../config/api';

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

export const listarNotificaciones = async (params?: { leida?: boolean; limit?: number; }) => {
  try {
    const { data } = await api.get(API_ENDPOINTS.NOTIFICATIONS.LISTAR);
    return {
      total: data.total || 0,
      no_leidas: data.unread || 0,
      notificaciones: data.notifications || [],
    };
  } catch (error) {
    console.error('Error listando notificaciones:', error);
    return {
      total: 0,
      no_leidas: 0,
      notificaciones: [] as Notificacion[],
    };
  }
};

export const marcarComoLeida = async (id: string | number) => {
  try {
    const { data } = await api.patch(API_ENDPOINTS.NOTIFICATIONS.LEER(String(id)));
    return data;
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    throw error;
  }
};

export const marcarTodasLeidas = async () => {
  try {
    const { data } = await api.post(API_ENDPOINTS.NOTIFICATIONS.LEER_TODAS);
    return data;
  } catch (error) {
    console.error('Error marcando todas las notificaciones como leídas:', error);
    throw error;
  }
};

export default {
  listarNotificaciones,
  marcarComoLeida,
  marcarTodasLeidas,
};
