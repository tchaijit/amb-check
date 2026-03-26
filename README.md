# AMB Check - ระบบตรวจสอบรถพยาบาล

## Ambulance Inspection System for Bangkok Siriroj Hospital

ระบบตรวจสอบความพร้อมรถพยาบาลแบบครบวงจร พร้อมระบบ QR Code, การอนุมัติหลายขั้นตอน และรายงานสถิติ

---

## ✨ Features

### 🔐 Authentication System
- NextAuth v5 with JWT
- Role-based access control
- 4 roles: Driver, Equipment Officer, Nurse, HOD

### 📋 Inspection System
- Multi-role checklist workflow
- QR code scanning
- Real-time status tracking
- PSI gauge for oxygen tanks

### 📊 Reporting & Statistics
- PDF Export
- Inspection History
- Statistics Dashboard with charts

---

## 🚀 Tech Stack

- Next.js 15 + TypeScript
- Tailwind CSS
- NextAuth v5
- Vercel Postgres
- Recharts, jsPDF

---

## 📦 Installation

```bash
npm install
npm run dev
```

---

## 👥 Test Accounts

Password: `password123`

- Driver: `driver@hospital.com`
- Equipment: `equipment@hospital.com`
- Nurse: `nurse@hospital.com`
- HOD: `hod@hospital.com`

---

Built for Bangkok Hospital 🏥
