import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.error('VITE_GOOGLE_CLIENT_ID is not set in environment variables');
}

// Debug environment variables in production
if (import.meta.env.PROD) {
  console.log('Production environment check:', {
    googleClientId: googleClientId ? 'Set' : 'Not set',
    apiUrl: import.meta.env.VITE_API_URL || 'Not set',
    appUrl: import.meta.env.VITE_APP_URL || 'Not set'
  });
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId || ''}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
