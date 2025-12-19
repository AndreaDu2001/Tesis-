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
  console.warn('Notificaciones: endpoint no disponible en backend actual, devolviendo placeholder.');
  return {
    total: 0,
    no_leidas: 0,
    notificaciones: [] as Notificacion[],
  };
};

export const marcarComoLeida = async (id: string | number) => {
  console.warn('Notificaciones: marcarComoLeida no disponible en backend actual.');
  return null;
};

export const marcarTodasLeidas = async () => {
  console.warn('Notificaciones: marcarTodasLeidas no disponible en backend actual.');
  return null;
};

export default {
  listarNotificaciones,
  marcarComoLeida,
  marcarTodasLeidas,
};
