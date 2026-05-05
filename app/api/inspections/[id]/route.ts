import { NextRequest, NextResponse } from 'next/server';
import {
  getInspectionById,
  getInspectionItems,
  saveInspectionItem,
  updateInspectionStatus,
  updateInspectionOverallStatus,
} from '@/lib/db';
import {
  getMockInspection,
  setMockInspection,
  getMockItems,
  setMockItems,
} from '@/lib/mock-store';
import { todayBangkok } from '@/lib/dates';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

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
      inspection = getMockInspection(id);
      items = getMockItems(id);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
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

      let inspection = getMockInspection(id);
      if (!inspection) {
        inspection = {
          id,
          ambulanceId: 1,
          inspectionDate: todayBangkok(),
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
      }

      if (items && Array.isArray(items)) {
        setMockItems(id, items);
      }

      if (role && typeof completed === 'boolean') {
        if (role === 'driver') {
          inspection.driverCompleted = completed;
        } else if (role === 'equipment_officer') {
          inspection.equipmentOfficerCompleted = completed;
        } else if (role === 'nurse') {
          inspection.nurseCompleted = completed;
        }
      }

      if (overallStatus) {
        inspection.overallStatus = overallStatus;
      }

      inspection.updatedAt = new Date();
      setMockInspection(id, inspection);
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
