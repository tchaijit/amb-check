import { NextRequest, NextResponse } from 'next/server';
import { approveInspection, getInspectionById } from '@/lib/db';

// POST - HOD -8!142##'*-
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
    const { hodId } = body;

    if (!hodId) {
      return NextResponse.json(
        { error: 'hodId is required' },
        { status: 400 }
      );
    }

    // #'*-'H28 role #'@*#GA%I'+#7-"1
    const inspection = await getInspectionById(id);
    if (!inspection) {
      return NextResponse.json(
        { error: 'Inspection not found' },
        { status: 404 }
      );
    }

    if (!inspection.driverCompleted || !inspection.equipmentOfficerCompleted || !inspection.nurseCompleted) {
      return NextResponse.json(
        { error: 'All inspections must be completed before approval' },
        { status: 400 }
      );
    }

    await approveInspection(id, hodId);

    return NextResponse.json({
      message: 'Inspection approved successfully',
    });
  } catch (error) {
    console.error('Error approving inspection:', error);
    return NextResponse.json(
      { error: 'Failed to approve inspection' },
      { status: 500 }
    );
  }
}
