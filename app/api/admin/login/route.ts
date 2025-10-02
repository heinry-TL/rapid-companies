import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, generateToken } from '@/lib/admin-auth';
import type { LoginRequest } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json() as LoginRequest;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = await authenticateAdmin(username, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await generateToken(user);
    console.log('🔑 Generated token:', token.substring(0, 20) + '...');

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });

    // Set cookie on response
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    console.log('🍪 Cookie set on response');
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}