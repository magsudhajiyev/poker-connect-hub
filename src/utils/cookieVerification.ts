/**
 * Verify that authentication cookies have been properly set
 * by making a test request to the /auth/me endpoint
 */
export async function verifyCookiesSet(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.success && data.data?.user;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Wait for cookies to be set with verification
 * This is more reliable than just waiting a fixed time
 */
export async function waitForCookiesWithVerification(maxAttempts = 5): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    // Wait before checking
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Verify cookies are set
    const verified = await verifyCookiesSet();
    if (verified) {
      return true;
    }
  }
  
  return false;
}