import { create } from 'zustand';
import api from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
}

// On normalise le payload pour toujours exposer `name`.
const normalizeUser = (payload: any): User | null => {
  if (!payload) return null;
  const name = payload.name ?? payload.username ?? payload.email ?? 'Player';
  return {
    id: payload.id,
    email: payload.email,
    name,
  };
};

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean; // CRUCIAL pour éviter l'écran bleu au démarrage
  error: string | null;
  isAuthenticated: boolean;
  
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false, // L'application commence non-initialisée
  error: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data.data?.user || response.data.user;
      const normalizedUser = normalizeUser(userData);
      
      set({ 
        user: normalizedUser, 
        isAuthenticated: !!normalizedUser, 
        isLoading: false,
        isInitialized: true 
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (email: string, name: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { email, name, password });
      const userData = response.data.data?.user || response.data.user;
      const normalizedUser = normalizeUser(userData);

      set({ 
        user: normalizedUser, 
        isAuthenticated: !!normalizedUser,
        isLoading: false,
        isInitialized: true 
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // On reset tout sauf isInitialized (l'app reste prête)
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  fetchCurrentUser: async () => {
    console.log('[Auth] Fetching current user...');
    set({ isLoading: true });
    try {
      // 5s timeout to prevent infinite loading
      const response = await Promise.race([
        api.get('/auth/me'),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Auth check timeout')), 5000)
        )
      ]);
      console.log('[Auth] Current user response:', response.data);
      const userData = response.data.data || response.data;
      const normalizedUser = normalizeUser(userData);
      
      set({ 
        user: normalizedUser, 
        isAuthenticated: !!normalizedUser, 
        isLoading: false, 
        isInitialized: true,
        error: null 
      });
    } catch (error: any) {
      console.error('[Auth] fetchCurrentUser error:', error.message || error.response?.status, error.response?.data);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        isInitialized: true,
        error: error.message === 'Auth check timeout' ? 'Backend unavailable - please check server' : (error.response?.data?.message || 'Auth check failed')
      });
    }
  },

  refreshToken: async () => {
    const self = get();
    console.log('[Auth] Refreshing token...');
    set({ isLoading: true, error: null });
    try {
      // Refresh sets new access cookie
      await api.post('/auth/refresh');
      // Re-fetch user to update state
      await self.fetchCurrentUser();
    } catch (error: any) {
      console.error('[Auth] Refresh failed:', error);
      await self.logout(); // Fallback: full logout
    }
  },

})); 
