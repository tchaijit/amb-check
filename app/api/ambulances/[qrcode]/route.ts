import { NextRequest, NextResponse } from 'next/server';
import { getAmbulanceByQR, getTodayInspectionByAmbulance } from '@/lib/db';

// Mock data for local testing (when database is not available)
const MOCK_AMBULANCES: Record<string, any> = {
  'AMB-001': {
    id: 1,
    vehicleNumber: 'AMB-001',
    qrCode: 'AMB-001',
    licensePlate: 'BKK-1234',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'AMB-002': {
    id: 2,
    vehicleNumber: 'AMB-002',
    qrCode: 'AMB-002',
    licensePlate: 'BKK-5678',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'AMB-003': {
    id: 3,
    vehicleNumber: 'AMB-003',
    qrCode: 'AMB-003',
    licensePlate: 'BKK-9012',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { qrcode: string } }
) {
  try {
    const qrCode = params.qrcode;

    let ambulance;
    let todayInspection = null;

    // Try to get from database first
    try {
      ambulance = await getAmbulanceByQR(qrCode);
      if (ambulance) {
        todayInspection = await getTodayInspectionByAmbulance(ambulance.id);
      }
    } catch (dbError) {
      // If database fails, use mock data for testing
      console.log('Database not available, using mock data');
      ambulance = MOCK_AMBULANCES[qrCode];
    }

    if (!ambulance) {
      return NextResponse.json(
        { error: 'Ambulance not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ambulance,
      todayInspection,
      hasInspectionToday: !!todayInspection,
    });
  } catch (error) {
    console.error('Error fetching ambulance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ambulance' },
      { status: 500 }
    );
  }
}
