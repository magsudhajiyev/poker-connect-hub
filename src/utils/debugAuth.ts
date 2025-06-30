// Debug utilities for authentication issues

export const debugAuthState = () => {
  console.log('=== Auth Debug Info ===');
  console.log('Current URL:', window.location.href);
  console.log('All cookies (visible):', document.cookie);
  console.log('LocalStorage auth keys:', Object.keys(localStorage).filter(k => k.includes('auth')));
  console.log('SessionStorage auth keys:', Object.keys(sessionStorage).filter(k => k.includes('auth')));
  
  // Check for NextAuth session
  const nextAuthCookies = document.cookie.split(';').filter(c => 
    c.includes('next-auth') || c.includes('__Secure-next-auth')
  );
  console.log('NextAuth cookies:', nextAuthCookies);
  
  console.log('========================');
};

export const clearAllAuthData = () => {
  console.log('Clearing all auth data...');
  
  // Clear all cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    // Also try with domain
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=" + window.location.hostname);
    // Try without domain but with different paths
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/auth");
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/api");
  });
  
  // Clear localStorage auth items
  Object.keys(localStorage).forEach(key => {
    if (key.includes('auth') || key.includes('user') || key.includes('token')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear sessionStorage auth items  
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('auth') || key.includes('user') || key.includes('token')) {
      sessionStorage.removeItem(key);
    }
  });
  
  console.log('Auth data cleared');
};