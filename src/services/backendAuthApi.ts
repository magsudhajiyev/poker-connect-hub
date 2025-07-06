import axios from 'axios';

// Create axios instance for backend auth
export const backendAuthApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor
backendAuthApi.interceptors.request.use(
  (config) => {
    // Ensure withCredentials is always true for cookie-based auth
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
backendAuthApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response && error.code === 'ERR_NETWORK') {
      console.error('Backend network error:', error.message);
      return Promise.reject(error);
    }

    // Don't log 401 errors as they're expected during logout
    if (error.response?.status === 401) {
      // Silently handle unauthorized errors
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

// Backend auth endpoints
export const backendAuthEndpoints = {
  register: (data: { email: string; password: string; name: string }) =>
    backendAuthApi.post('/auth/register', data),

  login: (data: { email: string; password: string }) => backendAuthApi.post('/auth/login', data),

  logout: () => backendAuthApi.post('/auth/logout'),

  getMe: () => backendAuthApi.get('/auth/me'),

  refreshToken: () => backendAuthApi.post('/auth/refresh'),

  googleSync: (data: { email: string; name: string; googleId: string; picture?: string }) =>
    backendAuthApi.post('/auth/google/sync', data),

  completeOnboarding: () => backendAuthApi.post('/auth/complete-onboarding'),
};

export default backendAuthApi;
