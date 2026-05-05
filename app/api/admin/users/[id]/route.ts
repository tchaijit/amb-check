import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { updateUser, deleteUser, getUserById, getUserByEmail } from '@/lib/db';
import { requireHod } from '@/lib/api-auth';

const ALLOWED_ROLES = ['driver', 'equipment_officer', 'nurse', 'hod'];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireHod();
  if (response) return response;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const body = await request.json();
    const { email, name, role, password } = body;

    if (role && !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    if (password && password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (email) {
      const existing = await getUserByEmail(email);
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
    }

    const data: any = {};
    if (email) data.email = email;
    if (name) data.name = name;
    if (role) data.role = role;
    if (password) data.passwordHash = await bcrypt.hash(password, 10);

    const user = await updateUser(id, data);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireHod();
  if (response) return response;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    if (session && Number(session.user.id) === id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const target = await getUserById(id);
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const ok = await deleteUser(id);
    if (!ok) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    if (error?.code === '23503') {
      return NextResponse.json(
        { error: 'ลบไม่ได้ — user นี้มีประวัติการตรวจสอบในระบบ' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
