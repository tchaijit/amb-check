import { NextRequest, NextResponse } from 'next/server';
import {
  getInspectionById,
  getInspectionItems,
  saveInspectionItem,
  updateInspectionStatus,
  updateInspectionOverallStatus,
} from '@/lib/db';

// Mock storage (shared across requests in memory)
const mockInspections = new Map<number, any>();
const mockItems = new Map<number, any[]>();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    let inspection;
    let items: any[] = [];

    // Try database first
    try {
      inspection = await getInspectionById(id);
      if (!inspection) {
        throw new Error('Not found in DB');
      }
      items = await getInspectionItems(id);
    } catch (dbError) {
      // Use mock data
      console.log('Using mock data for inspection');
      inspection = mockInspections.get(id);
      items = mockItems.get(id) || [];

      if (!inspection) {
        return NextResponse.json(
          { error: 'Inspection not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      inspection,
      items,
    });
  } catch (error) {
    console.error('Error fetching inspection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inspection' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const { items, role, completed, overallStatus } = body;

    // Try database first
    try {
      if (items && Array.isArray(items)) {
        for (const item of items) {
          await saveInspectionItem({
            inspectionId: id,
            ...item,
          });
        }
      }

      if (role && typeof completed === 'boolean') {
        await updateInspectionStatus(id, role, completed);
      }

      if (overallStatus) {
        await updateInspectionOverallStatus(id, overallStatus);
      }
    } catch (dbError) {
      // Use mock data
      console.log('Using mock data to save inspection');

      let inspection = mockInspections.get(id);
      if (!inspection) {
        // Create mock inspection if not exists
        inspection = {
          id,
          ambulanceId: 1,
          inspectionDate: new Date().toISOString().split('T')[0],
          overallStatus: null,
          driverCompleted: false,
          equipmentOfficerCompleted: false,
          nurseCompleted: false,
          hodApproved: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      // Save items
      if (items && Array.isArray(items)) {
        mockItems.set(id, items);
      }

      // Update completion status
      if (role && typeof completed === 'boolean') {
        if (role === 'driver') {
          inspection.driverCompleted = completed;
        } else if (role === 'equipment_officer') {
          inspection.equipmentOfficerCompleted = completed;
        } else if (role === 'nurse') {
          inspection.nurseCompleted = completed;
        }
      }

      // Update overall status
      if (overallStatus) {
        inspection.overallStatus = overallStatus;
      }

      inspection.updatedAt = new Date();
      mockInspections.set(id, inspection);
    }

    return NextResponse.json({
      message: 'Inspection updated successfully',
    });
  } catch (error) {
    console.error('Error updating inspection:', error);
    return NextResponse.json(
      { error: 'Failed to update inspection' },
      { status: 500 }
    );
  }
}
