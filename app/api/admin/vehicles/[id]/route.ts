import { NextRequest, NextResponse } from 'next/server';
import { updateAmbulance, deleteAmbulance, getAmbulanceById } from '@/lib/db';
import { requireHod } from '@/lib/api-auth';

const ALLOWED_STATUS = ['active', 'inactive'];

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
    const { vehicleNumber, qrCode, licensePlate, status } = body;

    if (status && !ALLOWED_STATUS.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const data: any = {};
    if (vehicleNumber !== undefined) data.vehicleNumber = vehicleNumber;
    if (qrCode !== undefined) data.qrCode = qrCode;
    if (licensePlate !== undefined) data.licensePlate = licensePlate;
    if (status !== undefined) data.status = status;

    const vehicle = await updateAmbulance(id, data);
    if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });

    return NextResponse.json({ vehicle });
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'รหัสรถหรือ QR Code นี้มีอยู่แล้ว' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireHod();
  if (response) return response;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const target = await getAmbulanceById(id);
    if (!target) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });

    const ok = await deleteAmbulance(id);
    if (!ok) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    if (error?.code === '23503') {
      return NextResponse.json(
        { error: 'ลบไม่ได้ — รถคันนี้มีประวัติการตรวจสอบในระบบ' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
  }
}
