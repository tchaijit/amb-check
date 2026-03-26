import { NextRequest, NextResponse } from 'next/server';
import { createInspection, getTodayInspectionByAmbulance, getInspectionsByDate } from '@/lib/db';

// Mock in-memory storage for testing
const mockInspections: any[] = [];
let mockInspectionId = 1;

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
      inspections = mockInspections.filter(i => i.inspectionDate === date);
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

      const today = new Date().toISOString().split('T')[0];
      const existing = mockInspections.find(
        i => i.ambulanceId === ambulanceId && i.inspectionDate === today
      );

      if (existing) {
        return NextResponse.json({
          inspection: existing,
          message: 'Inspection already exists for today',
        });
      }

      inspection = {
        id: mockInspectionId++,
        ambulanceId,
        inspectionDate: today,
        overallStatus: null,
        driverCompleted: false,
        equipmentOfficerCompleted: false,
        nurseCompleted: false,
        hodApproved: false,
        hodApprovedAt: null,
        hodApprovedBy: null,
        remarks: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockInspections.push(inspection);
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
