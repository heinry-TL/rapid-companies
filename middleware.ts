import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from './lib/admin-auth';

export async function middleware(request: NextRequest) {
  // Admin routes protection
  if (request.nextUrl.pathname.startsWith('/alpha-console')) {
    // Skip authentication for login page and API login endpoint
    if (
      request.nextUrl.pathname === '/alpha-console/login' ||
      request.nextUrl.pathname === '/api/admin/login' ||
      request.nextUrl.pathname === '/api/admin/logout'
    ) {
      return NextResponse.next();
    }

    // TEMPORARY: Skip auth check for testing - REMOVE THIS IN PRODUCTION
    console.log('Middleware: Temporarily skipping auth for testing');
    const testResponse = NextResponse.next();
    // Set a dummy user for testing
    testResponse.headers.set('x-admin-user', JSON.stringify({
      id: 1,
      username: 'admin',
      email: 'admin@rapidcompanies.com',
      full_name: 'System Administrator',
      role: 'super_admin'
    }));
    return testResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/alpha-console/:path*',
  ],
};