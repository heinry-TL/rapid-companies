import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from './lib/admin-auth';

export async function middleware(request: NextRequest) {
  // Admin routes and API protection
  if (request.nextUrl.pathname.startsWith('/alpha-console') ||
      request.nextUrl.pathname.startsWith('/api/admin')) {

    // Skip authentication for login page and login/logout endpoints
    if (
      request.nextUrl.pathname === '/alpha-console/login' ||
      request.nextUrl.pathname === '/api/admin/login' ||
      request.nextUrl.pathname === '/api/admin/logout'
    ) {
      return NextResponse.next();
    }

    // Require authentication for all other admin routes
    const authResult = await requireAuth(request);

    // If authResult is a NextResponse, it's a redirect to login
    if (authResult instanceof NextResponse) {
      // For API routes, return 401 instead of redirecting
      if (request.nextUrl.pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      return authResult;
    }

    // If authenticated, set user info in header and continue
    const response = NextResponse.next();
    response.headers.set('x-admin-user', JSON.stringify({
      id: authResult.user.id,
      email: authResult.user.email,
      full_name: authResult.user.full_name,
      role: authResult.user.role
    }));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/alpha-console/:path*',
    '/api/admin/:path*',
  ],
};