import api from './apiService';
import { API_ENDPOINTS } from '../config/api';

export interface Notificacion {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const listarNotificaciones = async () => {
  const { data } = await api.get(API_ENDPOINTS.NOTIFICATIONS.LISTAR);
  return data;
};

export const marcarComoLeida = async (id: string | number) => {
  const { data } = await api.patch(API_ENDPOINTS.NOTIFICATIONS.LEER(id), {});
  return data;
};

export const marcarTodasLeidas = async () => {
  const { data } = await api.post(API_ENDPOINTS.NOTIFICATIONS.LEER_TODAS, {});
  return data;
};

export default {
  listarNotificaciones,
  marcarComoLeida,
  marcarTodasLeidas,
};
