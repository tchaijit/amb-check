import { NextRequest, NextResponse } from 'next/server';
import { getAmbulances, getInspectionsByDate, getInspectionItems } from '@/lib/db';
import { getMockInspectionsByDate, getMockItems } from '@/lib/mock-store';
import { todayBangkok } from '@/lib/dates';

const MOCK_AMBULANCES = [
  { id: 1, vehicleNumber: 'AMB-001', qrCode: 'AMB-001', licensePlate: 'BKK-1234', status: 'active' },
  { id: 2, vehicleNumber: 'AMB-002', qrCode: 'AMB-002', licensePlate: 'BKK-5678', status: 'active' },
  { id: 3, vehicleNumber: 'AMB-003', qrCode: 'AMB-003', licensePlate: 'BKK-9012', status: 'active' },
];

function deriveStatus(inspection: any) {
  if (!inspection) {
    return { code: 'no_data', label: 'ยังไม่ตรวจ', labelEn: 'Not Inspected' };
  }
  const allCompleted =
    inspection.driverCompleted &&
    inspection.equipmentOfficerCompleted &&
    inspection.nurseCompleted;

  if (!allCompleted) {
    return { code: 'in_progress', label: 'กำลังตรวจสอบ', labelEn: 'In Progress' };
  }
  if (!inspection.hodApproved) {
    return { code: 'pending_approval', label: 'รออนุมัติ', labelEn: 'Pending Approval' };
  }
  if (inspection.overallStatus === 'ready') {
    return { code: 'ready', label: 'พร้อมใช้', labelEn: 'Ready for Use' };
  }
  if (inspection.overallStatus === 'monitor') {
    return { code: 'monitor', label: 'เฝ้าระวังก่อนใช้', labelEn: 'Monitor Before Use' };
  }
  if (inspection.overallStatus === 'not_ready') {
    return { code: 'not_ready', label: 'ไม่พร้อมใช้', labelEn: 'Not Ready' };
  }
  return { code: 'pending_approval', label: 'รออนุมัติ', labelEn: 'Pending Approval' };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || todayBangkok();

    let ambulances: any[] = [];
    let inspections: any[] = [];
    let useMock = false;

    try {
      ambulances = await getAmbulances();
      inspections = await getInspectionsByDate(date);
    } catch (dbError) {
      console.log('Database not available, using mock data');
      ambulances = MOCK_AMBULANCES;
      inspections = getMockInspectionsByDate(date);
      useMock = true;
    }

    const results = await Promise.all(
      ambulances.map(async (amb) => {
        const inspection = inspections.find((i: any) => i.ambulanceId === amb.id);
        const status = deriveStatus(inspection);

        let items: any[] = [];
        if (inspection) {
          try {
            items = useMock
              ? getMockItems(inspection.id)
              : await getInspectionItems(inspection.id);
          } catch {
            items = [];
          }
        }

        return {
          ambulance: {
            id: amb.id,
            vehicleNumber: amb.vehicleNumber,
            licensePlate: amb.licensePlate,
          },
          status,
          inspection: inspection
            ? {
                id: inspection.id,
                driverCompleted: inspection.driverCompleted,
                equipmentOfficerCompleted: inspection.equipmentOfficerCompleted,
                nurseCompleted: inspection.nurseCompleted,
                hodApproved: inspection.hodApproved,
                hodApprovedAt: inspection.hodApprovedAt,
                overallStatus: inspection.overallStatus,
                remarks: inspection.remarks,
                items: items.map((it: any) => ({
                  itemCode: it.itemCode,
                  inspectorRole: it.inspectorRole,
                  status: it.status,
                  value: it.value,
                  remarks: it.remarks,
                  lastEditedAt: it.lastEditedAt,
                })),
              }
            : null,
        };
      })
    );

    return NextResponse.json({ date, items: results });
  } catch (error) {
    console.error('Error fetching ambulance status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ambulance status' },
      { status: 500 }
    );
  }
}
