import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from './api';

interface User {
  id: string;
  email: string;
  full_name: string;
  subscription_tier: string;
  preferences: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.login({ email, password });
          if (response.data) {
            const { access_token } = response.data;
            apiClient.setToken(access_token);
            
            // Get user profile
            const userResponse = await apiClient.getCurrentUser();
            if (userResponse.data) {
              set({
                token: access_token,
                user: userResponse.data,
                isAuthenticated: true,
                isLoading: false,
              });
              return true;
            }
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Login failed:', error);
          set({ isLoading: false });
          return false;
        }
      },

      register: async (email: string, password: string, fullName: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.register({
            email,
            password,
            full_name: fullName,
          });
          if (response.data) {
            const { access_token } = response.data;
            apiClient.setToken(access_token);
            
            // Get user profile
            const userResponse = await apiClient.getCurrentUser();
            if (userResponse.data) {
              set({
                token: access_token,
                user: userResponse.data,
                isAuthenticated: true,
                isLoading: false,
              });
              return true;
            }
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Registration failed:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        apiClient.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        try {
          apiClient.setToken(token);
          const response = await apiClient.getCurrentUser();
          if (response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token is invalid
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);