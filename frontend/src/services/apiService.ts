import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar el token a todas las solicitudes
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores de respuesta
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Token expirado o no autenticado, intentar refrescar
          try {
            const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                refresh: refreshToken,
              });
              localStorage.setItem('access_token', response.data.access);
              // Reintentar la solicitud original
              error.config.headers.Authorization = `Bearer ${response.data.access}`;
              return axios.request(error.config);
            } else {
              // No hay refresh token, ir a login
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }
          } catch (refreshError) {
            // Refresh falló, cerrar sesión
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  get(url: string, config?: AxiosRequestConfig) {
    return this.api.get(url, config);
  }

  post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.post(url, data, config);
  }

  put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.put(url, data, config);
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.patch(url, data, config);
  }

  delete(url: string, config?: AxiosRequestConfig) {
    return this.api.delete(url, config);
  }
}

export default new ApiService();
