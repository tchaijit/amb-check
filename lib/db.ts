import { sql } from '@vercel/postgres';
import type { Ambulance, Inspection, InspectionItem, User } from './types';

// Helper function *3+#1A% snake_case 2 DB @G camelCase
function toCamelCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }

  const result: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}

// Ambulances
export async function getAmbulances(): Promise<Ambulance[]> {
  const { rows } = await sql`SELECT * FROM ambulances ORDER BY vehicle_number`;
  return toCamelCase(rows);
}

export async function getAmbulanceByQR(qrCode: string): Promise<Ambulance | null> {
  const { rows } = await sql`SELECT * FROM ambulances WHERE qr_code = ${qrCode} LIMIT 1`;
  return rows.length > 0 ? toCamelCase(rows[0]) : null;
}

export async function getAmbulanceById(id: number): Promise<Ambulance | null> {
  const { rows } = await sql`SELECT * FROM ambulances WHERE id = ${id} LIMIT 1`;
  return rows.length > 0 ? toCamelCase(rows[0]) : null;
}

export async function createAmbulance(data: {
  vehicleNumber: string;
  qrCode: string;
  licensePlate: string;
}): Promise<Ambulance> {
  const { rows } = await sql`
    INSERT INTO ambulances (vehicle_number, qr_code, license_plate)
    VALUES (${data.vehicleNumber}, ${data.qrCode}, ${data.licensePlate})
    RETURNING *
  `;
  return toCamelCase(rows[0]);
}

// Inspections
export async function getInspectionsByDate(date: string): Promise<Inspection[]> {
  const { rows } = await sql`
    SELECT i.*, a.vehicle_number, a.license_plate
    FROM inspections i
    JOIN ambulances a ON i.ambulance_id = a.id
    WHERE i.inspection_date = ${date}
    ORDER BY i.created_at DESC
  `;
  return toCamelCase(rows);
}

export async function getInspectionById(id: number): Promise<Inspection | null> {
  const { rows } = await sql`
    SELECT i.*, a.vehicle_number, a.license_plate
    FROM inspections i
    JOIN ambulances a ON i.ambulance_id = a.id
    WHERE i.id = ${id}
    LIMIT 1
  `;
  return rows.length > 0 ? toCamelCase(rows[0]) : null;
}

export async function getTodayInspectionByAmbulance(ambulanceId: number): Promise<Inspection | null> {
  const today = new Date().toISOString().split('T')[0];
  const { rows } = await sql`
    SELECT * FROM inspections
    WHERE ambulance_id = ${ambulanceId}
    AND inspection_date = ${today}
    LIMIT 1
  `;
  return rows.length > 0 ? toCamelCase(rows[0]) : null;
}

export async function createInspection(ambulanceId: number): Promise<Inspection> {
  const today = new Date().toISOString().split('T')[0];
  const { rows } = await sql`
    INSERT INTO inspections (ambulance_id, inspection_date)
    VALUES (${ambulanceId}, ${today})
    RETURNING *
  `;
  return toCamelCase(rows[0]);
}

export async function updateInspectionStatus(
  id: number,
  role: 'driver' | 'equipment_officer' | 'nurse',
  completed: boolean
): Promise<void> {
  if (role === 'driver') {
    await sql`
      UPDATE inspections
      SET driver_completed = ${completed},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
  } else if (role === 'equipment_officer') {
    await sql`
      UPDATE inspections
      SET equipment_officer_completed = ${completed},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
  } else {
    await sql`
      UPDATE inspections
      SET nurse_completed = ${completed},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
  }
}

export async function updateInspectionOverallStatus(
  id: number,
  status: 'ready' | 'not_ready' | 'monitor'
): Promise<void> {
  await sql`
    UPDATE inspections
    SET overall_status = ${status},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;
}

export async function approveInspection(id: number, hodId: number): Promise<void> {
  await sql`
    UPDATE inspections
    SET hod_approved = true,
        hod_approved_by = ${hodId},
        hod_approved_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;
}

// Inspection Items
export async function getInspectionItems(inspectionId: number): Promise<InspectionItem[]> {
  const { rows } = await sql`
    SELECT * FROM inspection_items
    WHERE inspection_id = ${inspectionId}
    ORDER BY id
  `;
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
  const { rows } = await sql`
    INSERT INTO inspection_items (
      inspection_id, category, item_name, item_code,
      inspector_role, status, value, remarks, inspected_by, inspected_at
    ) VALUES (
      ${data.inspectionId}, ${data.category}, ${data.itemName}, ${data.itemCode || null},
      ${data.inspectorRole}, ${data.status || null}, ${data.value || null},
      ${data.remarks || null}, ${data.inspectedBy || null}, CURRENT_TIMESTAMP
    )
    ON CONFLICT (inspection_id, item_code)
    DO UPDATE SET
      status = ${data.status || null},
      value = ${data.value || null},
      remarks = ${data.remarks || null},
      inspected_by = ${data.inspectedBy || null},
      inspected_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return toCamelCase(rows[0]);
}

// Users (Basic - for demo)
export async function getUserByEmail(email: string): Promise<User | null> {
  const { rows } = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
  return rows.length > 0 ? toCamelCase(rows[0]) : null;
}

export async function createUser(data: {
  email: string;
  name: string;
  role: string;
  passwordHash: string;
}): Promise<User> {
  const { rows } = await sql`
    INSERT INTO users (email, name, role, password_hash)
    VALUES (${data.email}, ${data.name}, ${data.role}, ${data.passwordHash})
    RETURNING id, email, name, role, created_at
  `;
  return toCamelCase(rows[0]);
}
