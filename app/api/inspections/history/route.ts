import { NextRequest, NextResponse } from 'next/server';
import { getInspectionsByDateRange, getRoleMetaForInspections } from '@/lib/db';
import { todayBangkok } from '@/lib/dates';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end') || todayBangkok();

    if (!start) {
      return NextResponse.json({ error: 'start date is required' }, { status: 400 });
    }

    const inspections = await getInspectionsByDateRange(start, end);
    const ids = inspections.map((i: any) => i.id);
    const roleMeta = await getRoleMetaForInspections(ids);

    // Build a per-inspection map: { [inspectionId]: { driver: meta, equipment_officer: meta, nurse: meta } }
    const metaByInspection: Record<
      number,
      Record<string, { lastAt: string | null; userName: string | null }>
    > = {};
    for (const m of roleMeta) {
      if (!metaByInspection[m.inspectionId]) metaByInspection[m.inspectionId] = {};
      metaByInspection[m.inspectionId][m.inspectorRole] = {
        lastAt: m.lastAt,
        userName: m.userName,
      };
    }

    const enriched = inspections.map((ins: any) => ({
      ...ins,
      roleMeta: metaByInspection[ins.id] || {},
    }));

    return NextResponse.json({ inspections: enriched, start, end });
  } catch (error: any) {
    console.error('Error fetching inspection history:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
