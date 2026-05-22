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

    console.log('Creating vehicle with data:', { vehicleNumber, qrCode, licensePlate });

    if (!vehicleNumber || !licensePlate) {
      return NextResponse.json(
        { error: 'vehicleNumber and licensePlate are required' },
        { status: 400 }
      );
    }

    console.log('Calling createAmbulance...');
    const vehicle = await createAmbulance({
      vehicleNumber,
      qrCode: qrCode || vehicleNumber,
      licensePlate,
    });
    console.log('Vehicle created successfully:', vehicle.id);

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'รหัสรถหรือ QR Code นี้มีอยู่แล้ว' },
        { status: 409 }
      );
    }
    return NextResponse.json({
      error: 'Failed to create vehicle',
      details: error?.message
    }, { status: 500 });
  }
}
