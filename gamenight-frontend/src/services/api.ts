import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// No request interceptor needed - backend reads httpOnly cookies
// Response interceptor for auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('[API] Token expired, attempting refresh...');

      try {
        // Call refresh endpoint - backend will set new access cookie from refresh cookie
        await api.post('/auth/refresh');
        console.log('[API] Token refreshed successfully');
        
        // Retry original request with new cookie
        return api(originalRequest);
      } catch (refreshError) {
        console.error('[API] Refresh failed:', refreshError);
        
        // Clear auth state and redirect to login
        const event = new CustomEvent('auth:logout');
        window.dispatchEvent(event);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
