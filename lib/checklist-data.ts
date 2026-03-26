import { InspectionChecklistItem } from './types';

export const INSPECTION_CHECKLIST: InspectionChecklistItem[] = [
  // Driver - Vehicle inspection
  { code: '1', name: 'ระดับน้ำมันเครื่อง / Engine oil level', icon: '🛢️', category: 'vehicle', inspectorRole: 'driver', hasGauge: true },
  { code: '2', name: 'ระบบเบรค / Brake system', icon: '🛑', category: 'vehicle', inspectorRole: 'driver' },
  { code: '2.1', name: 'ระดับน้ำมันเบรค / Brake fluid level', icon: '🛢️', category: 'vehicle', inspectorRole: 'driver', hasGauge: true },
  { code: '2.2', name: 'ระบบการทำงานของเบรค / Brake system working', icon: '🔧', category: 'vehicle', inspectorRole: 'driver' },
  { code: '3', name: 'ระบบคลัทช์ / Clutch system', icon: '⚙️', category: 'vehicle', inspectorRole: 'driver' },
  { code: '3.1', name: 'ระดับน้ำมันคลัทช์ / Clutch fluid level', icon: '🛢️', category: 'vehicle', inspectorRole: 'driver', hasGauge: true },
  { code: '3.2', name: 'ระบบการทำงานของคลัทช์ / Clutch system working', icon: '🔧', category: 'vehicle', inspectorRole: 'driver' },
  { code: '4', name: 'ระดับน้ำมันพวงมาลัยเพาเวอร์ / Power steering fluid', icon: '🛢️', category: 'vehicle', inspectorRole: 'driver', hasGauge: true },
  { code: '5', name: 'ระดับน้ำมันเชื้อเพลิง (รถพยาบาลไม่ต่ำกว่า 3/4 ถัง) / Fuel level (Ambulance ≥ 3/4 tank)', icon: '⛽', category: 'vehicle', inspectorRole: 'driver', hasGauge: true },
  { code: '6', name: 'ระดับน้ำหม้อน้ำ (อยู่ในระดับ Full) / Coolant level (Full)', icon: '💧', category: 'vehicle', inspectorRole: 'driver', hasGauge: true },
  { code: '7', name: 'ระดับน้ำยาฉีดกระจก (อยู่ในตำแหน่ง Full) / Windshield washer fluid (Full)', icon: '💦', category: 'vehicle', inspectorRole: 'driver', hasGauge: true },
  { code: '8', name: 'การทำงานของใบปัดน้ำฝน / Wiper function', icon: '🌧️', category: 'vehicle', inspectorRole: 'driver' },
  { code: '9', name: 'สัญญาณเสียงไซเรน / Siren sound', icon: '🚨', category: 'vehicle', inspectorRole: 'driver' },
  { code: '10', name: 'ไฟฉุกเฉินบนหลังคา (ไฟวับวาบ) / Emergency lights on roof (Flashing lights)', icon: '🚨', category: 'vehicle', inspectorRole: 'driver' },
  { code: '11', name: 'ไฟหน้ารถ / Headlights', icon: '💡', category: 'vehicle', inspectorRole: 'driver' },
  { code: '11.1', name: 'ไฟหน้ารถซ้าย / Left headlight', icon: '💡', category: 'vehicle', inspectorRole: 'driver' },
  { code: '11.2', name: 'ไฟหน้ารถขวา / Right headlight', icon: '💡', category: 'vehicle', inspectorRole: 'driver' },
  { code: '12', name: 'ไฟหรี่หน้ารถ / Parking lights', icon: '🔦', category: 'vehicle', inspectorRole: 'driver' },
  { code: '13', name: 'ไฟท้ายรถ / Tail lights', icon: '🔴', category: 'vehicle', inspectorRole: 'driver' },
  { code: '14', name: 'ไฟเบรค / Brake lights', icon: '🔴', category: 'vehicle', inspectorRole: 'driver' },
  { code: '15', name: 'ไฟเลี้ยวหน้า / Front turn signals', icon: '➡️', category: 'vehicle', inspectorRole: 'driver' },
  { code: '15.1', name: 'ไฟเลี้ยวหน้าซ้าย / Left front turn signal', icon: '⬅️', category: 'vehicle', inspectorRole: 'driver' },
  { code: '15.2', name: 'ไฟเลี้ยวหน้าขวา / Right front turn signal', icon: '➡️', category: 'vehicle', inspectorRole: 'driver' },
  { code: '16', name: 'ไฟเลี้ยวหลัง / Rear turn signals', icon: '➡️', category: 'vehicle', inspectorRole: 'driver' },
  { code: '16.1', name: 'ไฟเลี้ยวหลังซ้าย / Left rear turn signal', icon: '⬅️', category: 'vehicle', inspectorRole: 'driver' },
  { code: '16.2', name: 'ไฟเลี้ยวหลังขวา / Right rear turn signal', icon: '➡️', category: 'vehicle', inspectorRole: 'driver' },
  { code: '17', name: 'ไฟถอย / Reverse lights', icon: '⬅️', category: 'vehicle', inspectorRole: 'driver' },
  { code: '17.1', name: 'ไฟถอยซ้าย / Left reverse light', icon: '⬅️', category: 'vehicle', inspectorRole: 'driver' },
  { code: '17.2', name: 'ไฟถอยขวา / Right reverse light', icon: '⬅️', category: 'vehicle', inspectorRole: 'driver' },
  { code: '18', name: 'ไฟแสงสว่างภายในรถ / Interior lights', icon: '💡', category: 'vehicle', inspectorRole: 'driver' },
  { code: '19', name: 'ระบบเครื่องปรับอากาศ / Air conditioning', icon: '❄️', category: 'vehicle', inspectorRole: 'driver' },
  { code: '20', name: 'วิทยุสื่อสาร - เสาอากาศ (ทดสอบเรียกขานกับศูนย์สิริโรจน์) / Radio communication - Antenna (Test call with Siriroj Center)', icon: '📡', category: 'vehicle', inspectorRole: 'driver' },
  { code: '21', name: 'การทำงานตรวจสภาพภายนอกยางรถ/ตรวจสภาพดอกยาง / Tire exterior & tread inspection', icon: '🛞', category: 'vehicle', inspectorRole: 'driver' },
  { code: '22', name: 'แรงดันลมยาง (40-50 ปอนด์) / Tire pressure (40-50 PSI)', icon: '⚙️', category: 'vehicle', inspectorRole: 'driver' },

  // Equipment Officer
  { code: '23', name: 'หม้อแปลงไฟ 220V (อุปกรณ์ใช้ไฟ VAC ใช้งานได้) / 220V Power inverter (VAC electrical equipment working)', icon: '⚡', category: 'equipment', inspectorRole: 'driver' },
  { code: '24', name: 'พัดลมดูดอากาศ / Exhaust fan', icon: '🌀', category: 'equipment', inspectorRole: 'driver' },
  { code: '25', name: 'เสื้อ EMS 4 ตัว / EMS uniforms (4 sets)', icon: '👕', category: 'equipment', inspectorRole: 'driver' },
  { code: '26', name: 'เครื่องมือประจำรถ / Vehicle tools', icon: '🔧', category: 'equipment', inspectorRole: 'driver' },
  { code: '27', name: 'ความสะอาดภายในรถ / Interior cleanliness', icon: '🧹', category: 'equipment', inspectorRole: 'driver' },
  { code: '28', name: 'ความสะอาดภายนอกรถ / Exterior cleanliness', icon: '🚿', category: 'equipment', inspectorRole: 'driver' },
  { code: '29', name: 'เข็มขัดนิรภัย / Safety belts', icon: '🔒', category: 'equipment', inspectorRole: 'driver' },
  { code: '30', name: 'ถังดับเพลิงพร้อมใช้ / Fire extinguisher', icon: '🧯', category: 'equipment', inspectorRole: 'driver' },
  { code: '31', name: 'เอกสารประจำรถ พรบ/ประกัน / Vehicle documents', icon: '📄', category: 'equipment', inspectorRole: 'driver' },

  // Oxygen - Equipment Officer
  { code: '1', name: 'ปริมาณออกซิเจน ถัง 1 / Oxygen tank 1 (≥500 PSI)', icon: '🫁', category: 'oxygen', inspectorRole: 'equipment_officer', hasGauge: true, psiConfig: { min: 0, max: 2000, threshold: 500 } },
  { code: '2', name: 'ปริมาณออกซิเจน ถัง 2 / Oxygen tank 2 (≥500 PSI)', icon: '🫁', category: 'oxygen', inspectorRole: 'equipment_officer', hasGauge: true, psiConfig: { min: 0, max: 2000, threshold: 500 } },
  { code: '3', name: 'ปริมาณออกซิเจน Mobile / Mobile oxygen (1000 PSI)', icon: '🫁', category: 'oxygen', inspectorRole: 'equipment_officer', hasGauge: true, psiConfig: { min: 0, max: 2000, threshold: 1000 } },
  { code: '4', name: 'เตียงผู้ป่วย FERNO พร้อมใช้งาน / FERNO stretcher', icon: '🛏️', category: 'oxygen', inspectorRole: 'equipment_officer' },
  { code: '5', name: 'Spinal board + Head immobilizer + Belt 4 เส้น', icon: '🦴', category: 'oxygen', inspectorRole: 'equipment_officer' },
  { code: '6', name: 'เปลตักพร้อมใช้ / Scoop stretcher', icon: '🛏️', category: 'oxygen', inspectorRole: 'equipment_officer' },

  // Nurse - Medical equipment
  { code: '1', name: 'ปริมาณ O2 คงเหลือรวมหลังจากออกรถครั้งสุดท้าย / Total O2 remaining after last dispatch', icon: '🫁', category: 'oxygen', inspectorRole: 'nurse', dualTanks: true },
  { code: '2', name: 'การทำงานของ O2 Flow Meter และทดสอบปริมาณ O2 / O2 Flow Meter function and test O2 volume', icon: '⚕️', category: 'oxygen', inspectorRole: 'nurse' },
  { code: '3', name: 'การทำงานของ Suction / Suction function', icon: '💨', category: 'oxygen', inspectorRole: 'nurse' },
];

export function getChecklistByRole(role: 'driver' | 'equipment_officer' | 'nurse') {
  return INSPECTION_CHECKLIST.filter(item => item.inspectorRole === role);
}

export function getChecklistCounts() {
  return {
    driver: INSPECTION_CHECKLIST.filter(i => i.inspectorRole === 'driver').length,
    equipment_officer: INSPECTION_CHECKLIST.filter(i => i.inspectorRole === 'equipment_officer').length,
    nurse: INSPECTION_CHECKLIST.filter(i => i.inspectorRole === 'nurse').length,
    total: INSPECTION_CHECKLIST.length,
  };
}
