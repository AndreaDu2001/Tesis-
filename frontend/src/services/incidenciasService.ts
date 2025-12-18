import api from './apiService';
import { API_ENDPOINTS } from '../config/api';

// Fallback inteligente entre "/incidencias" (FastAPI) y "/incidents" (alias/otros)
let incidentsBase: 'incidencias' | 'incidents' | null = null;

async function resolveIncidentsBase(): Promise<'incidencias' | 'incidents'> {
  if (incidentsBase) return incidentsBase;
  try {
    await api.get('incidencias/?limit=1');
    incidentsBase = 'incidencias';
  } catch (_) {
    incidentsBase = 'incidents';
  }
  return incidentsBase;
}

export const listarIncidencias = async (params?: { estado?: string; zona?: string; tipo?: string; skip?: number; limit?: number; }) => {
  const query = new URLSearchParams();
  if (params?.estado) query.append('estado', params.estado);
  if (params?.zona) query.append('zona', params.zona);
  if (params?.tipo) query.append('tipo', params.tipo);
  if (params?.skip !== undefined) query.append('skip', String(params.skip));
  if (params?.limit !== undefined) query.append('limit', String(params.limit));
  const base = await resolveIncidentsBase();
  try {
    const { data } = await api.get(`${base}/?${query.toString()}`);
    return data;
  } catch (err) {
    // último intento cruzado
    const alt = base === 'incidencias' ? 'incidents' : 'incidencias';
    const { data } = await api.get(`${alt}/?${query.toString()}`);
    return data;
  }
};

export const crearIncidencia = async (payload: any, autoGenerarRuta = false) => {
  const base = await resolveIncidentsBase();
  const { data } = await api.post(`${base}/?auto_generar_ruta=${autoGenerarRuta}`, payload);
  return data;
};

export const obtenerIncidencia = async (id: string | number) => {
  const base = await resolveIncidentsBase();
  const { data } = await api.get(`${base}/${String(id)}`);
  return data;
};

export const actualizarIncidencia = async (id: string | number, payload: any) => {
  const base = await resolveIncidentsBase();
  const { data } = await api.patch(`${base}/${String(id)}`, payload);
  return data;
};

export const eliminarIncidencia = async (id: string | number) => {
  const base = await resolveIncidentsBase();
  await api.delete(`${base}/${String(id)}`);
};

export const estadisticasIncidencias = async () => {
  try {
    const { data } = await api.get('incidencias/stats');
    return data;
  } catch (_) {
    try {
      const { data } = await api.get('reports/statistics/');
      return data;
    } catch (__) {
      const { data } = await api.get('incidents/statistics');
      return data;
    }
  }
};

export const verificarUmbralZona = async (zona: string) => {
  // Backend actual no expone umbrales; devolver placeholder para evitar 404
  console.warn('Umbral no disponible en backend actual, devolviendo placeholder.');
  return {
    zona,
    suma_gravedad: 0,
    umbral_configurado: 999,
    incidencias_pendientes: 0,
    debe_generar_ruta: false,
  };
};

const IncidenciasService = {
  listarIncidencias,
  crearIncidencia,
  obtenerIncidencia,
  actualizarIncidencia,
  eliminarIncidencia,
  estadisticasIncidencias,
  verificarUmbralZona,
};

export default IncidenciasService;
