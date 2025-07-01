import { NextRequest } from 'next/server';
import { clearAuthCookies, successResponse } from '@/lib/api-utils';

export async function POST(_request: NextRequest) {
  try {
    // Clear auth cookies
    const response = successResponse(null, 'Logout successful');
    return clearAuthCookies(response);
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, we should clear cookies
    const response = successResponse(null, 'Logout completed');
    return clearAuthCookies(response);
  }
}