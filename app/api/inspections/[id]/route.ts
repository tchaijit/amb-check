import { NextRequest, NextResponse } from 'next/server';
import {
  getInspectionById,
  getInspectionItems,
  saveInspectionItem,
  updateInspectionStatus,
  updateInspectionOverallStatus,
  getAmbulanceById,
} from '@/lib/db';
import {
  getMockInspection,
  setMockInspection,
  getMockItems,
  setMockItems,
} from '@/lib/mock-store';
import { todayBangkok } from '@/lib/dates';
import { sendTelegramMessage, formatInspectionComplete } from '@/lib/telegram';
import { auth } from '@/auth';

// A real database is configured — mock fallback on WRITE would silently lose data.
const dbConfigured = () =>
  !!(
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL
  );

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
      console.error('DB read failed, falling back to mock:', (dbError as Error)?.message);
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

        // Send Telegram notification when section is completed
        if (completed && process.env.TELEGRAM_BOT_TOKEN) {
          try {
            const session = await auth();
            const inspection = await getInspectionById(id);
            const ambulance = inspection ? await getAmbulanceById(inspection.ambulanceId) : null;

            if (session?.user && ambulance) {
              const message = formatInspectionComplete({
                vehicleNumber: ambulance.vehicleNumber,
                licensePlate: ambulance.licensePlate,
                inspectorName: session.user.name || 'Unknown',
                inspectorRole: role,
                date: new Date().toLocaleDateString('th-TH'),
              });

              await sendTelegramMessage(message);
            }
          } catch (notifyError) {
            console.error('Failed to send Telegram notification:', notifyError);
            // Don't fail the request if notification fails
          }
        }
      }

      if (overallStatus) {
        await updateInspectionOverallStatus(id, overallStatus);
      }
    } catch (dbError) {
      // If a real DB is configured, surface the failure instead of silently
      // "saving" to the in-memory mock (data would be lost on serverless).
      if (dbConfigured()) {
        console.error('DB save failed (no fallback, DB is configured):', (dbError as Error)?.message);
        return NextResponse.json(
          {
            error:
              'บันทึกลงฐานข้อมูลไม่สำเร็จ กรุณาลองใหม่หรือแจ้งผู้ดูแลระบบ / Failed to save to database. Please retry or contact admin.',
            detail: (dbError as Error)?.message || 'unknown DB error',
          },
          { status: 500 }
        );
      }

      // No DB configured (local/demo mode) — use mock data
      console.error('DB save failed, falling back to mock:', (dbError as Error)?.message);

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
