import api from './apiService';
import { API_ENDPOINTS } from '../config/api';

export interface ReporteEstadisticas {
  periodo: string;
  total_incidencias: number;
  total_rutas_generadas: number;
  total_rutas_completadas: number;
  suma_gravedad_total: number;
  incidencias_por_tipo: Record<string, number>;
  incidencias_por_zona: Record<string, number>;
  eficiencia_conductores: any[];
}

export const reporteEstadisticas = async (params?: { fecha_inicio?: string; fecha_fin?: string; zona?: string; }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.fecha_inicio) queryParams.append('start_date', params.fecha_inicio);
    if (params?.fecha_fin) queryParams.append('end_date', params.fecha_fin);
    
    const { data } = await api.get(`${API_ENDPOINTS.REPORTS.ESTADISTICAS}?${queryParams.toString()}`);
    
    return {
      periodo: params?.fecha_inicio ? `${params.fecha_inicio} - ${params.fecha_fin}` : 'Histórico',
      ...data,
    } as ReporteEstadisticas;
  } catch (error) {
    console.error('Error generando reporte:', error);
    return {
      periodo: 'Sin datos',
      total_incidencias: 0,
      total_rutas_generadas: 0,
      total_rutas_completadas: 0,
      suma_gravedad_total: 0,
      incidencias_por_tipo: {},
      incidencias_por_zona: {},
      eficiencia_conductores: [],
    };
  }
};

export const exportarReporte = async (formato: 'pdf' | 'excel', params?: any) => {
  console.warn('Exportar reporte no está soportado en el backend Go actual.');
  return { url: '#', mensaje: 'Exportación no soportada por el backend' };
};

export default {
  reporteEstadisticas,
  exportarReporte,
};
