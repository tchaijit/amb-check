import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function requireHod() {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  if (session.user.role !== 'hod') {
    return {
      session,
      response: NextResponse.json({ error: 'Forbidden — HOD only' }, { status: 403 }),
    };
  }
  return { session, response: null };
}
