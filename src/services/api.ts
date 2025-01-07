import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { LoginCredentials, AuthResponse } from '../types/auth';
import { store } from '../store/store';
import { setUser, logOut } from '../store/slices/authSlice';

const api = axios.create(API_CONFIG);

// Session timeout handling
let sessionTimeoutId: number;
let verificationIntervalId: number;

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours session duration
const VERIFICATION_INTERVAL = 30 * 60 * 1000; // Verify every 30 minutes

// Add auth headers to all requests
api.interceptors.request.use(config => {
  const state = store.getState();
  const user = state.auth.user;

  if (user) {
    config.headers['x-company-id'] = user.companyID.toString();
    config.headers['x-company-name'] = user.companyName;
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      try {
        const response = await authApi.verifyAccess();
        if (response.message === 'Valid Session' && response.data) {
          startSessionTimeout();
          store.dispatch(setUser({
            companyID: response.data.companyID,
            companyName: response.data.companyName,
            roles: ['user']
          }));
          // Retry the original request
          return api(error.config);
        }
      } catch (verifyError) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }

    if (error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('auth:forbidden'));
    }

    return Promise.reject(error);
  }
);

export const startSessionTimeout = () => {
  clearSessionTimeout();

  // Set session timeout
  sessionTimeoutId = window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent('auth:timeout'));
  }, SESSION_DURATION);

  // Set up periodic verification
  verificationIntervalId = window.setInterval(async () => {
    try {
      await authApi.verifyAccess();
    } catch (error) {
      console.error('Session verification failed:', error);
      window.dispatchEvent(new CustomEvent('auth:timeout'));
    }
  }, VERIFICATION_INTERVAL);
};

export const clearSessionTimeout = () => {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
  }
  if (verificationIntervalId) {
    clearInterval(verificationIntervalId);
  }
};

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      startSessionTimeout();
      return response.data;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      clearSessionTimeout();
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout Error:', error);
      throw error;
    }
  },
  
  verifyAccess: async () => {
    try {
      const response = await api.get('/auth/verifyAccess');
      startSessionTimeout();
      if (import.meta.env.DEV) {
        console.log('Verify Access Response:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Verify Access Error:', error);
      throw error;
    }
  },
  
  registerBiometrics: async (userId: number) => {
    try {
      const response = await api.post('/auth/biometrics/register', { userId });
      return response.data;
    } catch (error) {
      console.error('Biometrics Registration Error:', error);
      throw error;
    }
  },
  
  completeBiometricsRegistration: async (userId: number, credential: any) => {
    try {
      const response = await api.post('/auth/biometrics/complete', {
        userId,
        credential
      });
      return response.data;
    } catch (error) {
      console.error('Biometrics Completion Error:', error);
      throw error;
    }
  }
};
