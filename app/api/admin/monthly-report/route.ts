import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg-pool';
import { requireHod } from '@/lib/api-auth';

const pad2 = (n: number) => String(n).padStart(2, '0');

// GET /api/admin/monthly-report?ambulanceId=1&year=2026&month=7  (year = ค.ศ., month = 1-12)
export async function GET(request: NextRequest) {
  const { response } = await requireHod();
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const ambulanceId = parseInt(searchParams.get('ambulanceId') || '');
    const year = parseInt(searchParams.get('year') || '');
    const month = parseInt(searchParams.get('month') || '');

    if (!ambulanceId || !year || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'ambulanceId, year, month are required' },
        { status: 400 }
      );
    }

    const start = `${year}-${pad2(month)}-01`;
    const endYear = month === 12 ? year + 1 : year;
    const endMonth = month === 12 ? 1 : month + 1;
    const end = `${endYear}-${pad2(endMonth)}-01`;

    const [dailyQ, itemsQ] = await Promise.all([
      // Daily overall readiness of the vehicle for the month
      query(
        `SELECT inspection_date::text AS date, overall_status, hod_approved
         FROM inspections
         WHERE ambulance_id = $1 AND inspection_date >= $2 AND inspection_date < $3
         ORDER BY inspection_date`,
        [ambulanceId, start, end]
      ),
      // Per checklist item: status counts over the month
      query(
        `SELECT it.item_code, it.inspector_role, it.status, COUNT(*)::int AS cnt
         FROM inspection_items it
         JOIN inspections i ON i.id = it.inspection_id
         WHERE i.ambulance_id = $1 AND i.inspection_date >= $2 AND i.inspection_date < $3
         GROUP BY it.item_code, it.inspector_role, it.status`,
        [ambulanceId, start, end]
      ),
    ]);

    return NextResponse.json({
      daily: dailyQ.rows.map((r: any) => ({
        date: r.date,
        overallStatus: r.overall_status,
        hodApproved: r.hod_approved,
      })),
      items: itemsQ.rows.map((r: any) => ({
        itemCode: r.item_code,
        inspectorRole: r.inspector_role,
        status: r.status,
        count: r.cnt,
      })),
    });
  } catch (error: any) {
    console.error('monthly-report error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to build monthly report' },
      { status: 500 }
    );
  }
}
