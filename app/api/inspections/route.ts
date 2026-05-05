import { NextRequest, NextResponse } from 'next/server';
import { createInspection, getTodayInspectionByAmbulance, getInspectionsByDate } from '@/lib/db';
import {
  getMockInspectionsByDate,
  getMockTodayInspection,
  createMockInspection,
} from '@/lib/mock-store';

// Lookup ambulance metadata from the static mock list (kept in sync with public/ambulance-status route)
const MOCK_AMBULANCES_META: Record<number, { vehicleNumber: string; licensePlate: string }> = {
  1: { vehicleNumber: 'AMB-001', licensePlate: 'BKK-1234' },
  2: { vehicleNumber: 'AMB-002', licensePlate: 'BKK-5678' },
  3: { vehicleNumber: 'AMB-003', licensePlate: 'BKK-9012' },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    let inspections = [];

    // Try database first
    try {
      inspections = await getInspectionsByDate(date);
    } catch (dbError) {
      // Use mock data if database not available
      console.log('Database not available, using mock data');
      inspections = getMockInspectionsByDate(date);
    }

    return NextResponse.json({
      inspections,
      date,
    });
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inspections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ambulanceId } = body;

    if (!ambulanceId) {
      return NextResponse.json(
        { error: 'ambulanceId is required' },
        { status: 400 }
      );
    }

    let inspection;

    // Try database first
    try {
      const existing = await getTodayInspectionByAmbulance(ambulanceId);
      if (existing) {
        return NextResponse.json({
          inspection: existing,
          message: 'Inspection already exists for today',
        });
      }

      inspection = await createInspection(ambulanceId);
    } catch (dbError) {
      // Use mock data if database not available
      console.log('Database not available, using mock data');

      const existing = getMockTodayInspection(ambulanceId);
      if (existing) {
        return NextResponse.json({
          inspection: existing,
          message: 'Inspection already exists for today',
        });
      }

      inspection = createMockInspection(ambulanceId, MOCK_AMBULANCES_META[ambulanceId]);
    }

    return NextResponse.json({
      inspection,
      message: 'Inspection created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating inspection:', error);
    return NextResponse.json(
      { error: 'Failed to create inspection' },
      { status: 500 }
    );
  }
}
