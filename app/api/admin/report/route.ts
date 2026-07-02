import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg-pool';
import { requireHod } from '@/lib/api-auth';
import { todayBangkok } from '@/lib/dates';

// Report endpoint for weekly / monthly / custom-range exports.
// Returns both aggregate summary (for headline stats / PDF) and a detailed
// per-inspection row list (for CSV / Excel export).
export async function GET(request: NextRequest) {
  const { response } = await requireHod();
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end') || todayBangkok();

    if (!start || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
      return NextResponse.json({ error: 'start date (YYYY-MM-DD) is required' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(end)) {
      return NextResponse.json({ error: 'invalid end date' }, { status: 400 });
    }

    const [summaryQ, vehicleQ, issuesQ, detailQ, totalsQ] = await Promise.all([
      // Overall summary for the range
      query(
        `SELECT
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE overall_status = 'ready')::int AS ready,
           COUNT(*) FILTER (WHERE overall_status = 'monitor')::int AS monitor,
           COUNT(*) FILTER (WHERE overall_status = 'not_ready')::int AS not_ready,
           COUNT(*) FILTER (WHERE hod_approved = true)::int AS approved
         FROM inspections
         WHERE inspection_date >= $1 AND inspection_date <= $2`,
        [start, end]
      ),
      // Per-vehicle performance
      query(
        `SELECT
           a.vehicle_number AS vehicle,
           COUNT(i.id) FILTER (WHERE i.overall_status = 'ready')::int AS ready,
           COUNT(i.id) FILTER (WHERE i.overall_status = 'monitor')::int AS monitor,
           COUNT(i.id) FILTER (WHERE i.overall_status = 'not_ready')::int AS not_ready,
           COUNT(i.id)::int AS total
         FROM ambulances a
         LEFT JOIN inspections i
           ON i.ambulance_id = a.id
          AND i.inspection_date >= $1 AND i.inspection_date <= $2
         GROUP BY a.id, a.vehicle_number
         ORDER BY a.vehicle_number ASC`,
        [start, end]
      ),
      // Common abnormal items
      query(
        `SELECT item_name AS issue, COUNT(*)::int AS count
         FROM inspection_items it
         JOIN inspections ins ON ins.id = it.inspection_id
         WHERE it.status = 'abnormal'
           AND ins.inspection_date >= $1 AND ins.inspection_date <= $2
         GROUP BY item_name
         ORDER BY count DESC
         LIMIT 20`,
        [start, end]
      ),
      // Detailed per-inspection rows (for CSV / Excel)
      query(
        `SELECT
           i.inspection_date AS date,
           a.vehicle_number AS vehicle,
           i.overall_status AS status,
           i.driver_completed AS driver_completed,
           i.equipment_officer_completed AS equipment_completed,
           i.nurse_completed AS nurse_completed,
           i.hod_approved AS hod_approved,
           COALESCE((
             SELECT COUNT(*)::int FROM inspection_items it
             WHERE it.inspection_id = i.id AND it.status = 'abnormal'
           ), 0) AS abnormal_count
         FROM inspections i
         JOIN ambulances a ON a.id = i.ambulance_id
         WHERE i.inspection_date >= $1 AND i.inspection_date <= $2
         ORDER BY i.inspection_date ASC, a.vehicle_number ASC`,
        [start, end]
      ),
      query(
        `SELECT
           (SELECT COUNT(*)::int FROM ambulances) AS total_vehicles,
           (SELECT COUNT(*)::int FROM users WHERE role IN ('driver','equipment_officer','nurse')) AS total_inspectors`
      ),
    ]);

    const sum = summaryQ.rows[0] || { total: 0, ready: 0, monitor: 0, not_ready: 0, approved: 0 };
    const totals = totalsQ.rows[0] || { total_vehicles: 0, total_inspectors: 0 };
    const complianceRate = sum.total > 0 ? Math.round((sum.approved / sum.total) * 1000) / 10 : 0;

    const asDate = (v: any) =>
      v instanceof Date ? v.toISOString().split('T')[0] : String(v).split('T')[0];

    return NextResponse.json({
      start,
      end,
      generatedAt: new Date().toISOString(),
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
      vehicles: vehicleQ.rows.map((r: any) => ({
        vehicle: r.vehicle,
        ready: r.ready,
        monitor: r.monitor,
        notReady: r.not_ready,
        total: r.total,
      })),
      commonIssues: issuesQ.rows.map((r: any) => ({ issue: r.issue, count: r.count })),
      details: detailQ.rows.map((r: any) => ({
        date: asDate(r.date),
        vehicle: r.vehicle,
        status: r.status,
        driverCompleted: !!r.driver_completed,
        equipmentCompleted: !!r.equipment_completed,
        nurseCompleted: !!r.nurse_completed,
        hodApproved: !!r.hod_approved,
        abnormalCount: r.abnormal_count,
      })),
    });
  } catch (error) {
    console.error('Error building report:', error);
    return NextResponse.json({ error: 'Failed to build report' }, { status: 500 });
  }
}
