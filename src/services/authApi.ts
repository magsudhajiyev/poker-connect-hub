import axios from 'axios';

// Create axios instance with default config
// Using Next.js API routes directly
export const authApi = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for debugging
authApi.interceptors.request.use(
  (config) => {
    // Ensure withCredentials is always true
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
authApi.interceptors.response.use(
  (response) => {
    // Ensure we return the full response for auth endpoints
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response && error.code === 'ERR_NETWORK') {
      console.error('Network error:', error.message);
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

  signout: () => authApi.post('/auth/signout'),

  getMe: () => authApi.get('/auth/me'),

  refreshToken: () => authApi.post('/auth/refresh'),

  completeOnboarding: () => authApi.post('/auth/complete-onboarding'),
};

// Onboarding endpoints
export const onboardingEndpoints = {
  submitAnswers: (data: {
    username: string;
    playFrequency: string;
    experienceLevel: string;
    preferredFormat: string;
    favoriteVariant: string;
    learningGoals: string;
    interestedFeatures: string[];
    location?: string;
    preferredStakes?: string;
    otherInfo?: string;
  }) => authApi.post('/onboarding/submit', data),

  getAnswers: () => authApi.get('/onboarding/answers'),

  getStatus: () => authApi.get('/onboarding/status'),

  checkUsername: (username: string) => authApi.post('/onboarding/check-username', { username }),
};

export default authApi;
