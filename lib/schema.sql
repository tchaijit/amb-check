-- สร้างตาราง Ambulances (รถพยาบาล)
CREATE TABLE IF NOT EXISTS ambulances (
  id SERIAL PRIMARY KEY,
  vehicle_number VARCHAR(50) UNIQUE NOT NULL, -- หมายเลขรถ
  qr_code TEXT UNIQUE NOT NULL, -- QR Code ประจำรถ
  license_plate VARCHAR(20) NOT NULL, -- ทะเบียนรถ
  status VARCHAR(20) DEFAULT 'active', -- สถานะรถ: active, inactive, maintenance
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง Users (ผู้ใช้งาน)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- driver, equipment_officer, nurse, hod
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง Inspections (การตรวจสอบ)
CREATE TABLE IF NOT EXISTS inspections (
  id SERIAL PRIMARY KEY,
  ambulance_id INTEGER REFERENCES ambulances(id),
  inspection_date DATE NOT NULL,
  overall_status VARCHAR(20), -- ready, not_ready, monitor (พร้อมใช้, ไม่พร้อมใช้, เฝ้าระวังก่อนใช้)
  driver_completed BOOLEAN DEFAULT false,
  equipment_officer_completed BOOLEAN DEFAULT false,
  nurse_completed BOOLEAN DEFAULT false,
  hod_approved BOOLEAN DEFAULT false,
  hod_approved_at TIMESTAMP,
  hod_approved_by INTEGER REFERENCES users(id),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง Inspection Items (รายการตรวจสอบ)
CREATE TABLE IF NOT EXISTS inspection_items (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER REFERENCES inspections(id),
  category VARCHAR(50) NOT NULL, -- vehicle, equipment, oxygen
  item_name TEXT NOT NULL,
  item_code VARCHAR(20), -- รหัสรายการตามฟอร์ม
  inspector_role VARCHAR(50) NOT NULL, -- driver, equipment_officer, nurse
  status VARCHAR(20), -- normal, abnormal, fixed (ปกติ, ไม่ปกติ, แก้ไขแล้ว)
  value TEXT, -- สำหรับข้อมูลที่เป็นตัวเลข เช่น ปริมาณออกซิเจน
  remarks TEXT,
  inspected_by INTEGER REFERENCES users(id),
  inspected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง Index สำหรับเพิ่มประสิทธิภาพ
CREATE INDEX idx_inspections_ambulance_date ON inspections(ambulance_id, inspection_date);
CREATE INDEX idx_inspections_status ON inspections(overall_status);
CREATE INDEX idx_inspection_items_inspection_id ON inspection_items(inspection_id);
CREATE INDEX idx_ambulances_qr_code ON ambulances(qr_code);
