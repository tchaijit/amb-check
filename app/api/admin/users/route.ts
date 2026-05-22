import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUsers, createUser, getUserByEmail } from '@/lib/db';
import { requireHod } from '@/lib/api-auth';

const ALLOWED_ROLES = ['driver', 'equipment_officer', 'nurse', 'hod'];

export async function GET() {
  const { response } = await requireHod();
  if (response) return response;

  try {
    const users = await getUsers();
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { response } = await requireHod();
  if (response) return response;

  try {
    const body = await request.json();
    const { email, name, role, password } = body;

    console.log('Creating user with data:', { email, name, role, passwordLength: password?.length });

    if (!email || !name || !role || !password) {
      return NextResponse.json({ error: 'email, name, role, password are required' }, { status: 400 });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: `Invalid role: ${role}. Allowed roles: ${ALLOWED_ROLES.join(', ')}` }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Creating user in database...');
    const user = await createUser({ email, name, role, passwordHash });
    console.log('User created successfully:', user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return NextResponse.json({
      error: 'Failed to create user',
      details: error.message
    }, { status: 500 });
  }
}
