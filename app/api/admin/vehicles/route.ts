import { NextRequest, NextResponse } from 'next/server';
import { getAmbulances, createAmbulance } from '@/lib/db';
import { requireHod } from '@/lib/api-auth';

export async function GET() {
  const { response } = await requireHod();
  if (response) return response;

  try {
    const vehicles = await getAmbulances();
    return NextResponse.json({ vehicles });
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { response } = await requireHod();
  if (response) return response;

  try {
    const body = await request.json();
    const { vehicleNumber, qrCode, licensePlate } = body;

    if (!vehicleNumber || !licensePlate) {
      return NextResponse.json(
        { error: 'vehicleNumber and licensePlate are required' },
        { status: 400 }
      );
    }

    const vehicle = await createAmbulance({
      vehicleNumber,
      qrCode: qrCode || vehicleNumber,
      licensePlate,
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'รหัสรถหรือ QR Code นี้มีอยู่แล้ว' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
  }
}
