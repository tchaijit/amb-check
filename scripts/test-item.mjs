import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';
const { Pool } = pg;

const raw = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
const cs = raw.replace(/[?&]sslmode=[^&]+/g, '').replace(/[?&]supa=[^&]+/g, '').replace(/[?&]pgbouncer=[^&]+/g, '');
const pool = new Pool({ connectionString: cs, ssl: { rejectUnauthorized: false } });

// Replicate lib/db.ts saveInspectionItem EXACTLY
const sql = `INSERT INTO inspection_items (
       inspection_id, category, item_name, item_code,
       inspector_role, status, value, remarks, inspected_by, employee_code, inspected_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, CURRENT_TIMESTAMP)
     ON CONFLICT (inspection_id, item_code, inspector_role)
     DO UPDATE SET status=EXCLUDED.status, value=EXCLUDED.value, remarks=EXCLUDED.remarks,
       last_edited_by=EXCLUDED.inspected_by, employee_code=EXCLUDED.employee_code, last_edited_at=CURRENT_TIMESTAMP
     RETURNING *`;

try {
  const ins = await pool.query('SELECT id FROM inspections ORDER BY id DESC LIMIT 1');
  const inspId = ins.rows[0].id;
  // exact frontend payload: inspectedBy defaults to 1
  const r = await pool.query(sql, [inspId, 'driver_check', 'SELFTEST', '__SELFTEST__', 'driver', 'normal', 'ok', null, 1, 'EMP-TEST']);
  console.log('SAVE OK, row id:', r.rows[0].id, '| employee_code:', r.rows[0].employee_code);
  await pool.query('DELETE FROM inspection_items WHERE item_code=$1', ['__SELFTEST__']);
  console.log('cleanup done');
} catch (e) {
  console.error('SAVE ERROR:', e.message, '| code:', e.code, '| detail:', e.detail);
} finally {
  await pool.end();
}
