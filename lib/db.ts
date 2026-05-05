import { query } from './pg-pool';
import type { Ambulance, Inspection, InspectionItem, User } from './types';

function toCamelCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  const result: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}

// Ambulances
export async function getAmbulances(): Promise<Ambulance[]> {
  const { rows } = await query('SELECT * FROM ambulances ORDER BY vehicle_number');
  return toCamelCase(rows);
}

export async function getAmbulanceByQR(qrCode: string): Promise<Ambulance | null> {
  const { rows } = await query('SELECT * FROM ambulances WHERE qr_code = $1 LIMIT 1', [qrCode]);
  return rows.length > 0 ? toCamelCase(rows[0]) : null;
}

export async function getAmbulanceById(id: number): Promise<Ambulance | null> {
  const { rows } = await query('SELECT * FROM ambulances WHERE id = $1 LIMIT 1', [id]);
  return rows.length > 0 ? toCamelCase(rows[0]) : null;
}

export async function createAmbulance(data: {
  vehicleNumber: string;
  qrCode: string;
  licensePlate: string;
}): Promise<Ambulance> {
  const { rows } = await query(
    `INSERT INTO ambulances (vehicle_number, qr_code, license_plate)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.vehicleNumber, data.qrCode, data.licensePlate]
  );
  return toCamelCase(rows[0]);
}

// Inspections
export async function getInspectionsByDate(date: string): Promise<Inspection[]> {
  const { rows } = await query(
    `SELECT i.*, a.vehicle_number, a.license_plate
     FROM inspections i
     JOIN ambulances a ON i.ambulance_id = a.id
     WHERE i.inspection_date = $1
     ORDER BY i.created_at DESC`,
    [date]
  );
  return toCamelCase(rows);
}

export async function getInspectionById(id: number): Promise<Inspection | null> {
  const { rows } = await query(
    `SELECT i.*, a.vehicle_number, a.license_plate
     FROM inspections i
     JOIN ambulances a ON i.ambulance_id = a.id
     WHERE i.id = $1
     LIMIT 1`,
    [id]
  );
  return rows.length > 0 ? toCamelCase(rows[0]) : null;
}

export async function getTodayInspectionByAmbulance(ambulanceId: number): Promise<Inspection | null> {
  const today = new Date().toISOString().split('T')[0];
  const { rows } = await query(
    `SELECT * FROM inspections
     WHERE ambulance_id = $1 AND inspection_date = $2
     LIMIT 1`,
    [ambulanceId, today]
  );
  return rows.length > 0 ? toCamelCase(rows[0]) : null;
}

export async function createInspection(ambulanceId: number): Promise<Inspection> {
  const today = new Date().toISOString().split('T')[0];
  const { rows } = await query(
    `INSERT INTO inspections (ambulance_id, inspection_date)
     VALUES ($1, $2)
     RETURNING *`,
    [ambulanceId, today]
  );
  return toCamelCase(rows[0]);
}

export async function updateInspectionStatus(
  id: number,
  role: 'driver' | 'equipment_officer' | 'nurse',
  completed: boolean
): Promise<void> {
  const column =
    role === 'driver'
      ? 'driver_completed'
      : role === 'equipment_officer'
      ? 'equipment_officer_completed'
      : 'nurse_completed';

  await query(
    `UPDATE inspections SET ${column} = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [completed, id]
  );
}

export async function updateInspectionOverallStatus(
  id: number,
  status: 'ready' | 'not_ready' | 'monitor'
): Promise<void> {
  await query(
    `UPDATE inspections
     SET overall_status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [status, id]
  );
}

export async function approveInspection(id: number, hodId: number): Promise<void> {
  await query(
    `UPDATE inspections
     SET hod_approved = true,
         hod_approved_by = $1,
         hod_approved_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [hodId, id]
  );
}

// Inspection Items
export async function getInspectionItems(inspectionId: number): Promise<InspectionItem[]> {
  const { rows } = await query(
    'SELECT * FROM inspection_items WHERE inspection_id = $1 ORDER BY id',
    [inspectionId]
  );
  return toCamelCase(rows);
}

export async function saveInspectionItem(data: {
  inspectionId: number;
  category: string;
  itemName: string;
  itemCode?: string;
  inspectorRole: string;
  status?: string;
  value?: string;
  remarks?: string;
  inspectedBy?: number;
}): Promise<InspectionItem> {
  // On insert: set inspected_at (initial timestamp).
  // On update (re-save): keep inspected_at, update last_edited_at + last_edited_by.
  const { rows } = await query(
    `INSERT INTO inspection_items (
       inspection_id, category, item_name, item_code,
       inspector_role, status, value, remarks, inspected_by, inspected_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP
     )
     ON CONFLICT (inspection_id, item_code, inspector_role)
     DO UPDATE SET
       status = EXCLUDED.status,
       value = EXCLUDED.value,
       remarks = EXCLUDED.remarks,
       last_edited_by = EXCLUDED.inspected_by,
       last_edited_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      data.inspectionId,
      data.category,
      data.itemName,
      data.itemCode || null,
      data.inspectorRole,
      data.status || null,
      data.value || null,
      data.remarks || null,
      data.inspectedBy || null,
    ]
  );
  return toCamelCase(rows[0]);
}

// Users
export async function getUsers(): Promise<User[]> {
  const { rows } = await query(
    'SELECT id, email, name, role, created_at FROM users ORDER BY id'
  );
  return toCamelCase(rows);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { rows } = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return rows.length > 0 ? toCamelCase(rows[0]) : null;
}

export async function getUserById(id: number): Promise<User | null> {
  const { rows } = await query(
    'SELECT id, email, name, role, created_at FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows.length > 0 ? toCamelCase(rows[0]) : null;
}

export async function createUser(data: {
  email: string;
  name: string;
  role: string;
  passwordHash: string;
}): Promise<User> {
  const { rows } = await query(
    `INSERT INTO users (email, name, role, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, role, created_at`,
    [data.email, data.name, data.role, data.passwordHash]
  );
  return toCamelCase(rows[0]);
}

export async function updateUser(
  id: number,
  data: { email?: string; name?: string; role?: string; passwordHash?: string }
): Promise<User | null> {
  const sets: string[] = [];
  const values: any[] = [];
  let i = 1;
  if (data.email !== undefined) { sets.push(`email = $${i++}`); values.push(data.email); }
  if (data.name !== undefined) { sets.push(`name = $${i++}`); values.push(data.name); }
  if (data.role !== undefined) { sets.push(`role = $${i++}`); values.push(data.role); }
  if (data.passwordHash !== undefined) { sets.push(`password_hash = $${i++}`); values.push(data.passwordHash); }
  if (sets.length === 0) return getUserById(id);

  values.push(id);
  const { rows } = await query(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $${i}
     RETURNING id, email, name, role, created_at`,
    values
  );
  return rows.length > 0 ? toCamelCase(rows[0]) : null;
}

export async function deleteUser(id: number): Promise<boolean> {
  const { rows } = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return rows.length > 0;
}

// Ambulance update/delete
export async function updateAmbulance(
  id: number,
  data: { vehicleNumber?: string; qrCode?: string; licensePlate?: string; status?: string }
): Promise<Ambulance | null> {
  const sets: string[] = [];
  const values: any[] = [];
  let i = 1;
  if (data.vehicleNumber !== undefined) { sets.push(`vehicle_number = $${i++}`); values.push(data.vehicleNumber); }
  if (data.qrCode !== undefined) { sets.push(`qr_code = $${i++}`); values.push(data.qrCode); }
  if (data.licensePlate !== undefined) { sets.push(`license_plate = $${i++}`); values.push(data.licensePlate); }
  if (data.status !== undefined) { sets.push(`status = $${i++}`); values.push(data.status); }
  if (sets.length === 0) return getAmbulanceById(id);

  sets.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  const { rows } = await query(
    `UPDATE ambulances SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return rows.length > 0 ? toCamelCase(rows[0]) : null;
}

export async function deleteAmbulance(id: number): Promise<boolean> {
  const { rows } = await query('DELETE FROM ambulances WHERE id = $1 RETURNING id', [id]);
  return rows.length > 0;
}
