'use client';

import MonthlyReport from '@/components/MonthlyReport';

export default function MonthlyReportPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold mb-1">รายงานการตรวจสภาพรถและอุปกรณ์ภายในรถพยาบาล</h1>
        <h2 className="text-lg text-gray-600">Monthly Ambulance &amp; Equipment Inspection Report</h2>
      </div>
      <MonthlyReport />
    </div>
  );
}
