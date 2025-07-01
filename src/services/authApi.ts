import axios from 'axios';

// Create axios instance with default config
// Using Next.js API routes directly
export const authApi = axios.create({
  baseURL: '/api',
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
    // Don't log 401 errors as they're expected during logout
    if (error.response?.status === 401) {
      // Silently handle unauthorized errors
      return Promise.reject(error);
    }

    // Only log meaningful errors, not empty objects
    if (error.response?.data && Object.keys(error.response.data).length > 0) {
      console.error('API Response Error:', error.response.data);
    } else if (error.message && error.response?.status !== 401) {
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

  logout: () => {
    // Clear any client-side auth state before making the request
    return authApi.post('/auth/logout').then((response) => {
      // After successful logout, ensure we're not caching any auth state
      if (typeof window !== 'undefined') {
        // Force clear any potential cached credentials
        document.cookie.split(';').forEach(function (c) {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });
      }
      return response;
    });
  },

  getMe: () => authApi.get('/auth/me'),

  refreshToken: () => authApi.post('/auth/refresh'),

  completeOnboarding: () => authApi.post('/auth/complete-onboarding'),
};

// Onboarding endpoints
export const onboardingEndpoints = {
  submitAnswers: (data: {
    playFrequency: string;
    experienceLevel: string;
    preferredFormat: string;
    favoriteVariant: string;
    learningGoals: string;
    interestedFeatures: string[];
    otherInfo?: string;
  }) => authApi.post('/onboarding/submit', data),

  getAnswers: () => authApi.get('/onboarding/answers'),

  getStatus: () => authApi.get('/onboarding/status'),
};

export default authApi;
