import api from './apiService';
import { API_ENDPOINTS } from '../config/api';

// Rutas - Este servicio es para futuras extensiones
// En el backend Go actual, las rutas se generan automáticamente

export const listarRutas = async (params?: { skip?: number; limit?: number }) => {
  console.warn('listarRutas: Endpoint no disponible en backend actual');
  return { routes: [] };
};

export const obtenerRuta = async (routeId: string) => {
  console.warn('obtenerRuta: Endpoint no disponible en backend actual');
  return null;
};

export default {
  listarRutas,
  obtenerRuta,
};
