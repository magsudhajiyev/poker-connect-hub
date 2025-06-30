// Cookie utility functions for debugging authentication issues

export const checkCookies = () => {
  if (typeof document === 'undefined') {
return;
}
  
  console.log('=== Cookie Debug Info ===');
  console.log('All cookies:', document.cookie);
  console.log('Cookie enabled:', navigator.cookieEnabled);
  
  // Parse cookies
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key) {
acc[key] = value;
}
    return acc;
  }, {} as Record<string, string>);
  
  console.log('Parsed cookies:', cookies);
  console.log('NOTE: HTTP-only cookies (access_token, refresh_token) are not visible to JavaScript');
  console.log('========================');
  
  return cookies;
};

// Since we're using HTTP-only cookies, we can't check them directly in JavaScript
// Instead, we should verify authentication by making an API call
export const waitForCookies = async (_maxAttempts = 10, _delay = 100): Promise<boolean> => {
  // Since HTTP-only cookies aren't visible to JavaScript, we'll just wait a bit
  // to ensure the cookies have been set by the browser
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // The real verification happens by calling the /auth/me endpoint
  console.log('Cookies should be set (HTTP-only, not visible to JavaScript)');
  return true;
};