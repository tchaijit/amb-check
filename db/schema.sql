-- AMB Check Database Schema
-- For Vercel Postgres

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('driver', 'equipment_officer', 'nurse', 'hod')),
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ambulances table
CREATE TABLE IF NOT EXISTS ambulances (
  id SERIAL PRIMARY KEY,
  vehicle_number VARCHAR(50) UNIQUE NOT NULL,
  qr_code VARCHAR(100) UNIQUE NOT NULL,
  license_plate VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id SERIAL PRIMARY KEY,
  ambulance_id INTEGER NOT NULL REFERENCES ambulances(id),
  inspection_date DATE NOT NULL,
  overall_status VARCHAR(50) CHECK (overall_status IN ('ready', 'not_ready', 'monitor')),
  driver_completed BOOLEAN DEFAULT FALSE,
  equipment_officer_completed BOOLEAN DEFAULT FALSE,
  nurse_completed BOOLEAN DEFAULT FALSE,
  hod_approved BOOLEAN DEFAULT FALSE,
  hod_approved_at TIMESTAMP,
  hod_approved_by INTEGER REFERENCES users(id),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ambulance_id, inspection_date)
);

-- Inspection Items table
CREATE TABLE IF NOT EXISTS inspection_items (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_code VARCHAR(50),
  inspector_role VARCHAR(50) NOT NULL CHECK (inspector_role IN ('driver', 'equipment_officer', 'nurse')),
  status VARCHAR(50) CHECK (status IN ('normal', 'abnormal', 'fixed')),
  value TEXT,
  remarks TEXT,
  inspected_by INTEGER REFERENCES users(id),
  inspected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(inspection_id, item_code)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inspections_ambulance_date ON inspections(ambulance_id, inspection_date);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_inspection_items_inspection_id ON inspection_items(inspection_id);
CREATE INDEX IF NOT EXISTS idx_ambulances_qr_code ON ambulances(qr_code);

-- Seed data for ambulances
INSERT INTO ambulances (vehicle_number, qr_code, license_plate) VALUES
  ('AMB-001', 'AMB-001', 'กท-1234 กรุงเทพมหานคร'),
  ('AMB-002', 'AMB-002', 'นบ-5678 นนทบุรี'),
  ('AMB-003', 'AMB-003', 'สป-9012 สมุทรปราการ'),
  ('AMB-004', 'AMB-004', 'ปท-3456 ปทุมธานี'),
  ('AMB-005', 'AMB-005', 'ชบ-7890 ชลบุรี')
ON CONFLICT (vehicle_number) DO NOTHING;

-- Sample user (for testing)
INSERT INTO users (email, name, role) VALUES
  ('driver@hospital.com', 'John Driver', 'driver'),
  ('equipment@hospital.com', 'Jane Equipment', 'equipment_officer'),
  ('nurse@hospital.com', 'Mary Nurse', 'nurse'),
  ('hod@hospital.com', 'Dr. Smith HOD', 'hod')
ON CONFLICT (email) DO NOTHING;
