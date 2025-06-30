import axios from 'axios';

// Get API URL from environment or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance with default config
export const authApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
authApi.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('API Request:', config.method?.toUpperCase(), config.url);
      console.warn('Request config:', {
        withCredentials: config.withCredentials,
        headers: config.headers,
      });
    }
    // Ensure withCredentials is always true
    config.withCredentials = true;
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
authApi.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('API Response:', response.config.method?.toUpperCase(), response.config.url);
      console.warn('Response headers:', response.headers);
    }
    return response;
  },
  (error) => {
    // Only log meaningful errors, not empty objects
    if (error.response?.data && Object.keys(error.response.data).length > 0) {
      console.error('API Response Error:', error.response.data);
    } else if (error.message) {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  },
);

// Auth endpoints
export const authEndpoints = {
  register: (data: { email: string; password: string; name: string }) =>
    authApi.post('/auth/register', data),

  login: (data: { email: string; password: string }) => authApi.post('/auth/login', data),

  logout: () => authApi.post('/auth/logout'),

  getMe: () => authApi.get('/auth/me'),

  refreshToken: () => authApi.post('/auth/refresh'),

  completeOnboarding: () => authApi.post('/auth/complete-onboarding'),
};

export default authApi;
