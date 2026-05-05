import { NextResponse } from 'next/server';
import { query } from '@/lib/pg-pool';
import { requireHod } from '@/lib/api-auth';

export async function POST() {
  const { response } = await requireHod();
  if (response) return response;

  const steps: string[] = [];

  try {
    await query(`ALTER TABLE inspection_items ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP`);
    steps.push('last_edited_at column ensured');

    await query(`ALTER TABLE inspection_items ADD COLUMN IF NOT EXISTS last_edited_by INTEGER REFERENCES users(id)`);
    steps.push('last_edited_by column ensured');

    await query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'inspection_items_inspection_id_item_code_key'
        ) THEN
          ALTER TABLE inspection_items DROP CONSTRAINT inspection_items_inspection_id_item_code_key;
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'inspection_items_inspection_id_item_code_role_key'
        ) THEN
          ALTER TABLE inspection_items
            ADD CONSTRAINT inspection_items_inspection_id_item_code_role_key
            UNIQUE (inspection_id, item_code, inspector_role);
        END IF;
      END$$;
    `);
    steps.push('UNIQUE constraint migrated to (inspection_id, item_code, inspector_role)');

    const { rows: constraints } = await query<{ conname: string; pg_get_constraintdef: string }>(
      `SELECT conname, pg_get_constraintdef(oid)
       FROM pg_constraint
       WHERE conrelid = 'inspection_items'::regclass AND contype = 'u'`
    );

    return NextResponse.json({ ok: true, steps, constraints });
  } catch (error: any) {
    console.error('migrate error:', error);
    return NextResponse.json(
      { ok: false, steps, error: error.message || 'Failed' },
      { status: 500 }
    );
  }
}
