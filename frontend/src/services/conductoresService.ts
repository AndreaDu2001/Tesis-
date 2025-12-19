import api from './apiService';
import { API_ENDPOINTS } from '../config/api';

// ==================== CONDUCTORES (CRUD placeholders - no endpoints en backend) ====================

export const listarConductores = async (params?: { skip?: number; limit?: number }) => {
  console.warn('Conductores CRUD: endpoint no disponible en backend actual.');
  return { data: [] };
};

export const obtenerConductor = async (driverId: string) => {
  console.warn('Conductores CRUD: obtenerConductor no disponible.');
  return null;
};

export const crearConductor = async (payload: any) => {
  console.warn('Conductores CRUD: crearConductor no disponible.');
  return null;
};

export const actualizarConductor = async (driverId: string, payload: any) => {
  console.warn('Conductores CRUD: actualizarConductor no disponible.');
  return null;
};

// ==================== TURNOS (Shifts - placeholders) ====================

export const iniciarTurno = async (driverId: string, truckPlate: string) => {
  console.warn('Turnos: iniciarTurno no disponible en backend actual.');
  return null;
};

export const finalizarTurno = async (shiftId: string) => {
  console.warn('Turnos: finalizarTurno no disponible en backend actual.');
  return null;
};

// ==================== CAMIONES (Trucks - placeholders) ====================

export const listarCamiones = async (params?: { status?: string; type?: string }) => {
  console.warn('Camiones: endpoint no disponible en backend actual.');
  return { data: [] };
};

export const crearCamion = async (payload: { plate: string; type: string; status?: string }) => {
  console.warn('Camiones: crearCamion no disponible.');
  return null;
};

export default {
  listarConductores,
  obtenerConductor,
  crearConductor,
  actualizarConductor,
  iniciarTurno,
  finalizarTurno,
  listarCamiones,
  crearCamion,
};

