import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/auth';
import { clearAuthCookies } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    // Create a response object
    let response = NextResponse.json({ 
      success: true, 
      message: 'Signout successful' 
    });

    // Clear all auth cookies (both backend JWT and NextAuth)
    response = clearAuthCookies(response);

    // Call NextAuth signOut on server side
    // This ensures the NextAuth session is properly invalidated
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error('NextAuth signOut error:', error);
      // Continue even if NextAuth signOut fails
    }

    return response;
  } catch (error) {
    console.error('Signout error:', error);
    
    // Even on error, clear cookies and return success
    let response = NextResponse.json({ 
      success: true, 
      message: 'Signout completed' 
    });
    
    return clearAuthCookies(response);
  }
}