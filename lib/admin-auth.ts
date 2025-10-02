import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';

export interface AdminUser {
  id: number;
  username?: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'editor';
  active: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AdminUser): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
  try {
    console.log('🔍 Authenticating user:', username);

    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', username)
      .eq('active', true)
      .single();

    if (error) {
      console.error('❌ Database query error:', error);
      return null;
    }

    if (!data) {
      console.error('❌ No user found for email:', username);
      return null;
    }

    console.log('✅ User found:', data.email);
    console.log('🔑 Password hash from DB:', data.password_hash?.substring(0, 20) + '...');

    const user = data as AdminUser;
    const isValid = await verifyPassword(password, user.password_hash);

    console.log('🔐 Password valid:', isValid);

    if (!isValid) {
      console.error('❌ Invalid password for user:', username);
      return null;
    }

    // Update last login
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    console.log('✅ Authentication successful for:', username);
    return user;
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return null;
  }
}

export async function getAdminUser(userId: number): Promise<AdminUser | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, full_name, role, active, last_login, created_at, updated_at')
      .eq('id', userId)
      .eq('active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data as AdminUser;
  } catch (error) {
    console.error('Get admin user error:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<{ user: AdminUser } | NextResponse> {
  const token = request.cookies.get('admin-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/alpha-console/login', request.url));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.redirect(new URL('/alpha-console/login', request.url));
  }

  const user = await getAdminUser(decoded.userId);
  if (!user) {
    return NextResponse.redirect(new URL('/alpha-console/login', request.url));
  }

  return { user };
}

export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest, user: AdminUser): Promise<boolean> => {
    return allowedRoles.includes(user.role);
  };
}