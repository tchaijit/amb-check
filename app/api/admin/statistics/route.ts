import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg-pool';
import { requireHod } from '@/lib/api-auth';

const ALLOWED_RANGE: Record<string, number> = {
  '7days': 7,
  '30days': 30,
  '90days': 90,
};

export async function GET(request: NextRequest) {
  const { response } = await requireHod();
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const rangeKey = searchParams.get('range') || '30days';
    const days = ALLOWED_RANGE[rangeKey] ?? 30;

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days + 1);
    const since = sinceDate.toISOString().split('T')[0];

    const [summaryQ, dailyQ, vehicleQ, issuesQ, totalsQ] = await Promise.all([
      // Summary by overall_status
      query(
        `SELECT
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE overall_status = 'ready')::int AS ready,
           COUNT(*) FILTER (WHERE overall_status = 'monitor')::int AS monitor,
           COUNT(*) FILTER (WHERE overall_status = 'not_ready')::int AS not_ready,
           COUNT(*) FILTER (WHERE hod_approved = true)::int AS approved
         FROM inspections
         WHERE inspection_date >= $1`,
        [since]
      ),
      // Daily breakdown
      query(
        `SELECT
           inspection_date AS date,
           COUNT(*)::int AS inspections,
           COUNT(*) FILTER (WHERE overall_status = 'ready')::int AS ready,
           COUNT(*) FILTER (WHERE overall_status = 'monitor')::int AS monitor,
           COUNT(*) FILTER (WHERE overall_status = 'not_ready')::int AS not_ready
         FROM inspections
         WHERE inspection_date >= $1
         GROUP BY inspection_date
         ORDER BY inspection_date ASC`,
        [since]
      ),
      // Per-vehicle performance
      query(
        `SELECT
           a.vehicle_number AS vehicle,
           COUNT(i.id) FILTER (WHERE i.overall_status = 'ready')::int AS ready,
           COUNT(i.id) FILTER (WHERE i.overall_status = 'monitor')::int AS monitor,
           COUNT(i.id) FILTER (WHERE i.overall_status = 'not_ready')::int AS not_ready
         FROM ambulances a
         LEFT JOIN inspections i
           ON i.ambulance_id = a.id AND i.inspection_date >= $1
         GROUP BY a.id, a.vehicle_number
         ORDER BY a.vehicle_number ASC`,
        [since]
      ),
      // Common abnormal items
      query(
        `SELECT item_name AS issue, COUNT(*)::int AS count
         FROM inspection_items it
         JOIN inspections ins ON ins.id = it.inspection_id
         WHERE it.status = 'abnormal' AND ins.inspection_date >= $1
         GROUP BY item_name
         ORDER BY count DESC
         LIMIT 8`,
        [since]
      ),
      // Totals
      query(
        `SELECT
           (SELECT COUNT(*)::int FROM ambulances) AS total_vehicles,
           (SELECT COUNT(*)::int FROM users WHERE role IN ('driver','equipment_officer','nurse')) AS total_inspectors`
      ),
    ]);

    const sum = summaryQ.rows[0] || { total: 0, ready: 0, monitor: 0, not_ready: 0, approved: 0 };
    const totals = totalsQ.rows[0] || { total_vehicles: 0, total_inspectors: 0 };

    const complianceRate = sum.total > 0 ? Math.round((sum.approved / sum.total) * 1000) / 10 : 0;

    return NextResponse.json({
      range: rangeKey,
      days,
      since,
      summary: {
        totalInspections: sum.total,
        readyVehicles: sum.ready,
        monitorVehicles: sum.monitor,
        notReadyVehicles: sum.not_ready,
        approvedCount: sum.approved,
        complianceRate,
      },
      totals: {
        totalVehicles: totals.total_vehicles,
        totalInspectors: totals.total_inspectors,
      },
      daily: dailyQ.rows.map((r: any) => ({
        date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0],
        inspections: r.inspections,
        ready: r.ready,
        monitor: r.monitor,
        notReady: r.not_ready,
      })),
      vehicles: vehicleQ.rows.map((r: any) => ({
        vehicle: r.vehicle,
        ready: r.ready,
        monitor: r.monitor,
        notReady: r.not_ready,
      })),
      commonIssues: issuesQ.rows.map((r: any) => ({ issue: r.issue, count: r.count })),
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
