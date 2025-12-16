import api from './apiService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://epagal-backend-routing-latest.onrender.com';

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

// Funciones de reportes (basadas en datos existentes)
export const reporteEstadisticas = async (params?: { fecha_inicio?: string; fecha_fin?: string; zona?: string; }) => {
  // Combinar datos de incidencias y rutas para generar reporte
  // TODO: Cuando backend implemente endpoint específico, usar /api/reportes/estadisticas
  
  try {
    const incidenciasRes = await api.get(`${API_BASE_URL}/api/incidencias/stats`);
    
    return {
      periodo: params?.fecha_inicio ? `${params.fecha_inicio} - ${params.fecha_fin}` : 'Histórico',
      ...incidenciasRes.data,
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
  // TODO: Implementar POST /api/reportes/exportar
  console.log(`Exportar reporte en formato ${formato}`, params);
  return { url: '#', mensaje: 'Función no implementada aún' };
};

export default {
  reporteEstadisticas,
  exportarReporte,
};
