import { NextResponse } from 'next/server';
import { query } from '@/lib/pg-pool';
import { requireHod } from '@/lib/api-auth';

/**
 * One-shot fix for inspections whose `inspection_date` is wrong because the
 * date was computed from `new Date().toISOString()` (UTC) before the timezone
 * fix landed. Re-derives the date from the FIRST item inspected, in Bangkok
 * time. Skips rows that would collide with an existing (ambulance_id, target_date).
 */
export async function POST() {
  const { response } = await requireHod();
  if (response) return response;

  try {
    const candidates = await query<{
      id: number;
      ambulance_id: number;
      current_date: string;
      target_date: string;
    }>(
      `SELECT
         i.id,
         i.ambulance_id,
         i.inspection_date::text                                               AS current_date,
         (MIN(it.inspected_at) AT TIME ZONE 'Asia/Bangkok')::date::text        AS target_date
       FROM inspections i
       JOIN inspection_items it ON it.inspection_id = i.id
       GROUP BY i.id, i.ambulance_id, i.inspection_date
       HAVING (MIN(it.inspected_at) AT TIME ZONE 'Asia/Bangkok')::date <> i.inspection_date`
    );

    const updates: Array<{ id: number; from: string; to: string }> = [];
    const skipped: Array<{ id: number; from: string; to: string; reason: string }> = [];

    for (const row of candidates.rows) {
      // Avoid violating UNIQUE(ambulance_id, inspection_date) — only update if no clash.
      const clash = await query<{ id: number }>(
        `SELECT id FROM inspections
         WHERE ambulance_id = $1 AND inspection_date = $2 AND id <> $3
         LIMIT 1`,
        [row.ambulance_id, row.target_date, row.id]
      );
      if (clash.rows.length > 0) {
        skipped.push({
          id: row.id,
          from: row.current_date,
          to: row.target_date,
          reason: `another inspection already exists on ${row.target_date} for ambulance ${row.ambulance_id}`,
        });
        continue;
      }
      await query(
        `UPDATE inspections SET inspection_date = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [row.target_date, row.id]
      );
      updates.push({ id: row.id, from: row.current_date, to: row.target_date });
    }

    return NextResponse.json({ ok: true, updated: updates, skipped });
  } catch (error: any) {
    console.error('fix-inspection-dates error:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed' },
      { status: 500 }
    );
  }
}
