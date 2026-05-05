import { NextRequest, NextResponse } from 'next/server';
import { approveInspection, getInspectionById, updateInspectionOverallStatus } from '@/lib/db';
import { requireHod } from '@/lib/api-auth';

const ALLOWED_STATUS = ['ready', 'not_ready', 'monitor'] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireHod();
  if (response) return response;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    let overallStatus: string | undefined;
    try {
      const body = await request.json();
      overallStatus = body?.overallStatus;
    } catch {
      // empty body is fine
    }

    if (overallStatus && !ALLOWED_STATUS.includes(overallStatus as any)) {
      return NextResponse.json({ error: 'Invalid overallStatus' }, { status: 400 });
    }

    const inspection = await getInspectionById(id);
    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }
    if (
      !inspection.driverCompleted ||
      !inspection.equipmentOfficerCompleted ||
      !inspection.nurseCompleted
    ) {
      return NextResponse.json(
        { error: 'การตรวจสอบยังไม่ครบ 3 ฝ่าย — อนุมัติไม่ได้' },
        { status: 400 }
      );
    }

    if (overallStatus) {
      await updateInspectionOverallStatus(id, overallStatus as any);
    }
    const hodId = Number(session!.user.id);
    await approveInspection(id, hodId);

    return NextResponse.json({ message: 'Approved successfully' });
  } catch (error) {
    console.error('Error approving inspection:', error);
    return NextResponse.json({ error: 'Failed to approve inspection' }, { status: 500 });
  }
}
