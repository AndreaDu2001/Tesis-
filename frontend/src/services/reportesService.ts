import api from './apiService';
import { API_ENDPOINTS } from '../config/api';

export interface ReporteEstadisticas {
  period: string;
  total_incidencias: number;
  total_rutas_generadas: number;
  total_rutas_completadas: number;
  suma_gravedad_total: number;
  incidencias_por_tipo: Record<string, number>;
  incidencias_por_zona: Record<string, number>;
  eficiencia_conductores: any[];
}

export const reporteEstadisticas = async (params?: { fecha_inicio?: string; fecha_fin?: string; }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.fecha_inicio) queryParams.append('start_date', params.fecha_inicio);
    if (params?.fecha_fin) queryParams.append('end_date', params.fecha_fin);
    const url = `${API_ENDPOINTS.REPORTS.ESTADISTICAS}?${queryParams.toString()}`;
    const { data } = await api.get(url);
    return data as ReporteEstadisticas;
  } catch (err) {
    // Backend actual no expone estadísticas; devolver placeholder
    return {
      period: `${params?.fecha_inicio || 'N/A'} - ${params?.fecha_fin || 'N/A'}`,
      total_incidencias: 0,
      total_rutas_generadas: 0,
      total_rutas_completadas: 0,
      suma_gravedad_total: 0,
      incidencias_por_tipo: {},
      incidencias_por_zona: {},
      eficiencia_conductores: [],
    } as ReporteEstadisticas;
  }
};

export const exportarReporte = async (formato: 'pdf' | 'excel') => {
  const { data } = await api.post(API_ENDPOINTS.REPORTS.EXPORTAR, { format: formato });
  return data;
};

export default {
  reporteEstadisticas,
  exportarReporte,
};
