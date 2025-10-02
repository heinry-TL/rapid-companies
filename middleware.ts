import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.ADMIN_SESSION_SECRET || 'your-secret-key';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAuthToken(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('❌ Token verification error:', error);
    return null;
  }
}

async function getAdminUserDetails(userId: number) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, full_name, role, active')
    .eq('id', userId)
    .eq('active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes and API protection
  if (pathname.startsWith('/alpha-console') || pathname.startsWith('/api/admin')) {

    // Skip authentication for login page and login/logout endpoints
    if (
      pathname === '/alpha-console/login' ||
      pathname === '/api/admin/login' ||
      pathname === '/api/admin/logout'
    ) {
      return NextResponse.next();
    }

    // Require authentication for all other admin routes
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      console.log('❌ No token found');
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/alpha-console/login', request.url));
    }

    const decoded = await verifyAuthToken(token);
    if (!decoded) {
      console.log('❌ Token verification failed');
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/alpha-console/login', request.url));
    }

    // Get full user details from database
    const user = await getAdminUserDetails(decoded.userId as number);
    if (!user) {
      console.log('❌ User not found in database');
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/alpha-console/login', request.url));
    }

    console.log('✅ Authenticated user:', user.email);
    // If authenticated, set user info in header and continue
    const response = NextResponse.next();
    response.headers.set('x-admin-user', JSON.stringify({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
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