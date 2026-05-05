import { NextResponse } from 'next/server';
import { query } from '@/lib/pg-pool';
import { requireHod } from '@/lib/api-auth';

export async function GET() {
  const { response } = await requireHod();
  if (response) return response;

  try {
    const constraints = await query<{ conname: string; pg_get_constraintdef: string }>(
      `SELECT conname, pg_get_constraintdef(oid)
       FROM pg_constraint
       WHERE conrelid = 'inspection_items'::regclass AND contype = 'u'`
    );

    const itemsByRole = await query<{ inspector_role: string; count: string }>(
      `SELECT inspector_role, COUNT(*) AS count
       FROM inspection_items
       GROUP BY inspector_role
       ORDER BY inspector_role`
    );

    const itemsPerInspection = await query<{
      inspection_id: number;
      inspector_role: string;
      count: string;
    }>(
      `SELECT inspection_id, inspector_role, COUNT(*) AS count
       FROM inspection_items
       GROUP BY inspection_id, inspector_role
       ORDER BY inspection_id, inspector_role`
    );

    const newConstraintApplied = constraints.rows.some((r) =>
      r.pg_get_constraintdef.includes('inspector_role')
    );

    return NextResponse.json({
      newConstraintApplied,
      uniqueConstraints: constraints.rows,
      itemsByRole: itemsByRole.rows,
      itemsPerInspection: itemsPerInspection.rows,
    });
  } catch (error: any) {
    console.error('db-check error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
