'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { exportInspectionToPDF, exportMultipleInspectionsToPDF } from '@/lib/pdf-export';
import { INSPECTION_CHECKLIST } from '@/lib/checklist-data';
import { todayBangkok } from '@/lib/dates';
import DateInput from '@/components/DateInput';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const STATUS_OPTIONS: Array<{ code: 'ready' | 'monitor' | 'not_ready'; label: string; cls: string }> = [
  { code: 'ready', label: '✅ พร้อมใช้ / Ready', cls: 'border-green-500 bg-green-50 text-green-700' },
  { code: 'monitor', label: '⚠️ เฝ้าระวัง / Monitor', cls: 'border-orange-500 bg-orange-50 text-orange-700' },
  { code: 'not_ready', label: '⛔ ไม่พร้อมใช้ / Not Ready', cls: 'border-red-500 bg-red-50 text-red-700' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(todayBangkok());
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [pendingStatus, setPendingStatus] = useState<Record<number, string>>({});
  const [detailFor, setDetailFor] = useState<any | null>(null);

  const fetchInspections = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inspections?date=${date}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setInspections(data.inspections || []);
    } catch (error: any) {
      console.error('Error fetching inspections:', error);
      alert(error.message || 'โหลดข้อมูลไม่สำเร็จ');
      setInspections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInspections(selectedDate);
  }, [selectedDate, fetchInspections]);

  const handleApprove = async (inspectionId: number) => {
    const overallStatus = pendingStatus[inspectionId];
    if (!overallStatus) {
      alert('กรุณาเลือกสถานะ (พร้อมใช้/เฝ้าระวัง/ไม่พร้อมใช้) ก่อนอนุมัติ');
      return;
    }
    if (!confirm(`อนุมัติการตรวจสอบนี้ด้วยสถานะ "${STATUS_OPTIONS.find(s => s.code === overallStatus)?.label}" ใช่ไหม?`)) return;

    setApprovingId(inspectionId);
    try {
      const res = await fetch(`/api/inspections/${inspectionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overallStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'อนุมัติไม่สำเร็จ');

      setInspections((prev) =>
        prev.map((ins) =>
          ins.id === inspectionId
            ? { ...ins, hodApproved: true, hodApprovedAt: new Date().toISOString(), overallStatus }
            : ins
        )
      );
    } catch (error: any) {
      alert(error.message || 'เกิดข้อผิดพลาด');
    } finally {
      setApprovingId(null);
    }
  };

  const handleExportPDF = async (inspection: any) => {
    setExporting(true);
    try {
      const result = await exportInspectionToPDF({
        ...inspection,
        inspectionDate: inspection.inspectionDate.toISOString ?
          inspection.inspectionDate.toISOString().split('T')[0] :
          inspection.inspectionDate,
      });

      if (result.success) {
        alert(`บันทึก PDF สำเร็จ / PDF saved: ${result.fileName}`);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง PDF / Error generating PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportAllPDF = async () => {
    setExporting(true);
    try {
      const formattedInspections = inspections.map(inspection => ({
        ...inspection,
        inspectionDate: inspection.inspectionDate.toISOString ?
          inspection.inspectionDate.toISOString().split('T')[0] :
          inspection.inspectionDate,
      }));

      const result = await exportMultipleInspectionsToPDF(formattedInspections);

      if (result.success) {
        alert(`บันทึก PDF สำเร็จ / PDF saved: ${result.fileName}`);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง PDF / Error generating PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold mb-1">แผงควบคุม - HOD Dispatch Center</h1>
        <h2 className="text-lg text-gray-600 mb-2">Dashboard - HOD Dispatch Center</h2>
        <p className="text-gray-700">ตรวจสอบและอนุมัติการตรวจสอบรถพยาบาล / Review and approve ambulance inspections</p>

        <div className="mt-4 flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <DateInput
              value={selectedDate}
              onChange={setSelectedDate}
              label="เลือกวันที่ / Select Date"
              className="input-field"
            />
          </div>
          <button
            onClick={() => fetchInspections(selectedDate)}
            disabled={loading}
            className="btn-primary"
          >
            🔄 {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
          </button>
          {inspections.length > 0 && (
            <button
              onClick={handleExportAllPDF}
              disabled={exporting}
              className="btn-secondary inline-flex items-center gap-2"
            >
              📄 {exporting ? 'กำลังสร้าง...' : 'Export PDF ทั้งหมด'}
            </button>
          )}
        </div>

        {/* Summary */}
        {inspections.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <SummaryStat label="ทั้งหมด" value={inspections.length} cls="bg-gray-50 text-gray-700" />
            <SummaryStat
              label="รออนุมัติ"
              value={inspections.filter((i) => !i.hodApproved && i.driverCompleted && i.equipmentOfficerCompleted && i.nurseCompleted).length}
              cls="bg-yellow-50 text-yellow-800"
            />
            <SummaryStat
              label="อนุมัติแล้ว"
              value={inspections.filter((i) => i.hodApproved).length}
              cls="bg-green-50 text-green-800"
            />
            <SummaryStat
              label="ยังไม่เสร็จ"
              value={inspections.filter((i) => !(i.driverCompleted && i.equipmentOfficerCompleted && i.nurseCompleted)).length}
              cls="bg-blue-50 text-blue-800"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">กำลังโหลดข้อมูลจากฐานข้อมูล...</p>
        </div>
      ) : inspections.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-2">ไม่มีข้อมูลการตรวจสอบ</h3>
          <p className="text-gray-600">
            ไม่พบรายการตรวจสอบของวันที่ {selectedDate}
            <br />
            <span className="text-sm text-gray-500">เจ้าหน้าที่ยังไม่ได้บันทึกการตรวจสอบ หรือยังไม่ได้เลือกวันที่ที่ถูกต้อง</span>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inspections.map((inspection) => {
            const allCompleted = inspection.driverCompleted &&
                                 inspection.equipmentOfficerCompleted &&
                                 inspection.nurseCompleted;

            return (
              <div key={inspection.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold flex items-baseline gap-2 flex-wrap">
                      <span>🚑 {inspection.vehicleNumber}</span>
                      {inspection.licensePlate && (
                        <span className="text-base font-semibold text-blue-700">
                          ({inspection.licensePlate})
                        </span>
                      )}
                    </h3>
                  </div>
                  {inspection.hodApproved ? (
                    <span className="status-ready">อนุมัติแล้ว / Approved</span>
                  ) : allCompleted ? (
                    <span className="status-badge bg-blue-100 text-blue-800">
                      รออนุมัติ / Pending Approval
                    </span>
                  ) : (
                    <span className="status-monitor">ยังไม่เสร็จ / Incomplete</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm text-gray-600">ยานพาหนะ / Vehicle</div>
                    <div className={inspection.driverCompleted ? 'text-green-600 font-bold' : 'text-gray-400'}>
                      {inspection.driverCompleted ? '✓ เสร็จแล้ว / Done' : '○ รอดำเนินการ / Pending'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">เคลื่อนย้ายผู้ป่วย / Patient Escort</div>
                    <div className={inspection.equipmentOfficerCompleted ? 'text-green-600 font-bold' : 'text-gray-400'}>
                      {inspection.equipmentOfficerCompleted ? '✓ เสร็จแล้ว / Done' : '○ รอดำเนินการ / Pending'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">พยาบาล / Nurse</div>
                    <div className={inspection.nurseCompleted ? 'text-green-600 font-bold' : 'text-gray-400'}>
                      {inspection.nurseCompleted ? '✓ เสร็จแล้ว / Done' : '○ รอดำเนินการ / Pending'}
                    </div>
                  </div>
                </div>

                {inspection.overallStatus && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600">สถานะรถพยาบาล / Vehicle Status</div>
                    <div className="mt-1">
                      {inspection.overallStatus === 'ready' && (
                        <span className="status-ready">พร้อมใช้ / Ready for Use</span>
                      )}
                      {inspection.overallStatus === 'not_ready' && (
                        <span className="status-not-ready">ไม่พร้อมใช้ / Not Ready</span>
                      )}
                      {inspection.overallStatus === 'monitor' && (
                        <span className="status-monitor">เฝ้าระวังก่อนใช้ / Monitor Before Use</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Status picker (only when ready to approve) */}
                {allCompleted && !inspection.hodApproved && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      ระบุสถานะรถพยาบาลก่อนอนุมัติ
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {STATUS_OPTIONS.map((opt) => {
                        const selected = pendingStatus[inspection.id] === opt.code;
                        return (
                          <button
                            key={opt.code}
                            onClick={() =>
                              setPendingStatus((prev) => ({ ...prev, [inspection.id]: opt.code }))
                            }
                            className={`text-xs sm:text-sm px-3 py-2 rounded-lg border-2 font-medium transition-all ${
                              selected ? `${opt.cls} ring-2 ring-offset-1` : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setDetailFor(inspection)}
                    className="btn-secondary flex-1"
                  >
                    🔍 ดูรายละเอียด
                  </button>
                  <button
                    onClick={() => handleExportPDF(inspection)}
                    disabled={exporting}
                    className="btn-secondary inline-flex items-center justify-center gap-1"
                    title="Export PDF"
                  >
                    📄 PDF
                  </button>
                  {allCompleted && !inspection.hodApproved && (
                    <button
                      onClick={() => handleApprove(inspection.id)}
                      disabled={approvingId === inspection.id || !pendingStatus[inspection.id]}
                      className="btn-success flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approvingId === inspection.id ? 'กำลังอนุมัติ...' : '✓ อนุมัติ'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailFor && (
        <InspectionDetailModal
          inspection={detailFor}
          onClose={() => setDetailFor(null)}
        />
      )}

      {/* Monthly readiness report */}
      <MonthlyReportSection />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/statistics')}
          className="btn-secondary inline-flex items-center justify-center gap-2"
        >
          📊 สถิติ / Statistics
        </button>
        <button
          onClick={() => router.push('/history')}
          className="btn-secondary inline-flex items-center justify-center gap-2"
        >
          📋 ประวัติการตรวจสอบ / History
        </button>
        <button
          onClick={() => router.push('/')}
          className="btn-secondary"
        >
          กลับหน้าแรก / Back to Home
        </button>
      </div>
    </div>
  );
}

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const STATUS_LEVEL: Record<string, number> = { not_ready: 0, monitor: 1, ready: 2 };
const LEVEL_LABEL: Record<number, string> = { 0: 'ไม่พร้อมใช้', 1: 'เฝ้าระวัง', 2: 'พร้อมใช้' };

function MonthlyReportSection() {
  const now = new Date();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [ambulanceId, setAmbulanceId] = useState<string>('');
  const [year, setYear] = useState<number>(now.getFullYear()); // ค.ศ. internally
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [daily, setDaily] = useState<Array<{ date: string; overallStatus: string | null }>>([]);
  const [itemStats, setItemStats] = useState<Array<{ itemCode: string; inspectorRole: string; status: string; count: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/vehicles');
        if (!res.ok) return;
        const data = await res.json();
        setVehicles(data.vehicles || []);
        if ((data.vehicles || []).length > 0) {
          setAmbulanceId(String(data.vehicles[0].id));
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  useEffect(() => {
    if (!ambulanceId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `/api/admin/monthly-report?ambulanceId=${ambulanceId}&year=${year}&month=${month}`
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || 'โหลดข้อมูลไม่สำเร็จ');
        }
        const data = await res.json();
        if (!cancelled) {
          setDaily(data.daily || []);
          setItemStats(data.items || []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'โหลดข้อมูลไม่สำเร็จ');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ambulanceId, year, month]);

  // Chart data: one point per day of the selected month
  const daysInMonth = new Date(year, month, 0).getDate();
  const byDate = new Map(daily.map((d) => [d.date.slice(0, 10), d.overallStatus]));
  const chartData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const st = byDate.get(iso);
    return {
      day,
      level: st && st in STATUS_LEVEL ? STATUS_LEVEL[st] : null,
    };
  });

  // Item stats: % ready per checklist item over the month
  const statFor = (code: string, role: string) => {
    const rows = itemStats.filter((r) => r.itemCode === code && r.inspectorRole === role);
    const total = rows.reduce((s, r) => s + r.count, 0);
    if (total === 0) return null;
    const ok = rows
      .filter((r) => r.status === 'normal' || r.status === 'fixed' || r.status === 'na')
      .reduce((s, r) => s + r.count, 0);
    return { pct: Math.round((ok / total) * 1000) / 10, total };
  };

  const DEPARTMENTS: Array<{ role: string; label: string }> = [
    { role: 'driver', label: 'ยานพาหนะ / Vehicle' },
    { role: 'equipment_officer', label: 'Patient Escort / เคลื่อนย้ายผู้ป่วย' },
    { role: 'nurse', label: 'Nurse / พยาบาล' },
  ];

  const currentBE = now.getFullYear() + 543;
  const yearOptions = Array.from({ length: 4 }, (_, i) => currentBE - i); // ปี พ.ศ.
  const selVehicle = vehicles.find((v) => String(v.id) === ambulanceId);

  const pctCls = (pct: number) =>
    pct >= 95 ? 'text-green-700' : pct >= 80 ? 'text-orange-600' : 'text-red-600';

  return (
    <div className="card mt-6">
      <h2 className="text-xl font-bold mb-1">
        📈 รายงานการตรวจสภาพรถและอุปกรณ์ภายในรถพยาบาล
      </h2>
      <h3 className="text-sm text-gray-600 mb-4">
        Monthly Ambulance &amp; Equipment Inspection Report
      </h3>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="min-w-[220px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            รถ Ambulance หมายเลขทะเบียน / Vehicle
          </label>
          <select
            value={ambulanceId}
            onChange={(e) => setAmbulanceId(e.target.value)}
            className="input-field w-full text-sm"
          >
            {vehicles.length === 0 && <option value="">— ไม่มีข้อมูลรถ —</option>}
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vehicleNumber} {v.licensePlate ? `(${v.licensePlate})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Year / ปี (พ.ศ.)</label>
          <select
            value={year + 543}
            onChange={(e) => setYear(Number(e.target.value) - 543)}
            className="input-field text-sm"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Month / เดือน</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="input-field text-sm"
          >
            {THAI_MONTHS_FULL.map((name, i) => (
              <option key={name} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div className="px-3 py-2 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium">
          Unit: Refer Center
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">กำลังโหลดรายงาน...</p>
        </div>
      ) : (
        <>
          {/* Line chart: daily readiness */}
          <div className="border rounded-xl p-4 mb-6">
            <h4 className="font-bold text-center mb-1">
              กราฟแสดงความพร้อมใช้งานรถพยาบาลรายเดือน
            </h4>
            <p className="text-xs text-gray-500 text-center mb-3">
              {selVehicle ? `${selVehicle.vehicleNumber} (${selVehicle.licensePlate || '-'})` : ''}{' '}
              — {THAI_MONTHS_FULL[month - 1]} {year + 543}
            </p>
            {daily.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">
                ไม่มีข้อมูลการตรวจในเดือนนี้ / No inspections this month
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'วันที่ / Date', position: 'insideBottom', offset: -2, fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 2]}
                    ticks={[0, 1, 2]}
                    tickFormatter={(v: number) => LEVEL_LABEL[v] || ''}
                    tick={{ fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value: any) => [LEVEL_LABEL[value as number] ?? '-', 'สถานะ']}
                    labelFormatter={(day: any) => `วันที่ ${day} ${THAI_MONTHS_FULL[month - 1]}`}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="level"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Per-item % readiness table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-blue-50 text-left">
                  <th className="border px-3 py-2 w-44">แผนกที่รับผิดชอบ</th>
                  <th className="border px-3 py-2">Topic</th>
                  <th className="border px-3 py-2 w-36 text-center">% ความพร้อมใช้</th>
                </tr>
              </thead>
              <tbody>
                {DEPARTMENTS.map(({ role, label }) => {
                  const roleItems = INSPECTION_CHECKLIST.filter((c) => c.inspectorRole === role);
                  return roleItems.map((c, idx) => {
                    const st = statFor(c.code, role);
                    return (
                      <tr key={`${role}-${c.code}`} className="hover:bg-gray-50">
                        {idx === 0 && (
                          <td
                            className="border px-3 py-2 font-semibold align-top bg-gray-50"
                            rowSpan={roleItems.length}
                          >
                            {label}
                          </td>
                        )}
                        <td className="border px-3 py-2">
                          {c.code}. {c.name.split(' / ')[0]}
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {st === null ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <span className={`font-semibold ${pctCls(st.pct)}`}>{st.pct}%</span>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-2">
              % ความพร้อมใช้ = จำนวนครั้งที่ผลตรวจเป็น ปกติ/แก้ไขแล้ว/ไม่เกี่ยวข้อง ÷ จำนวนครั้งที่ตรวจทั้งเดือน · &quot;-&quot; = ไม่มีข้อมูลการตรวจ
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryStat({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className={`px-3 py-2 rounded-lg ${cls}`}>
      <div className="text-xs">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

const ROLE_META: Record<string, { label: string; icon: string; color: string }> = {
  driver: { label: 'ยานพาหนะ / Vehicle', icon: '🚗', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  equipment_officer: { label: 'เจ้าหน้าที่เคลื่อนย้าย / Patient Escort', icon: '🔧', color: 'bg-green-50 border-green-200 text-green-800' },
  nurse: { label: 'พยาบาล / Nurse', icon: '👨‍⚕️', color: 'bg-purple-50 border-purple-200 text-purple-800' },
};

function InspectionDetailModal({
  inspection,
  onClose,
}: {
  inspection: any;
  onClose: () => void;
}) {
  const [items, setItems] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/inspections/${inspection.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'โหลดข้อมูลไม่สำเร็จ');
        if (!cancelled) setItems(data.items || []);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inspection.id]);

  const counts = items
    ? items.reduce(
        (acc, it) => {
          if (it.status === 'normal') acc.normal++;
          else if (it.status === 'abnormal') acc.abnormal++;
          else if (it.status === 'fixed') acc.fixed++;
          else if (it.status === 'na') acc.na++;
          return acc;
        },
        { normal: 0, abnormal: 0, fixed: 0, na: 0 }
      )
    : { normal: 0, abnormal: 0, fixed: 0, na: 0 };

  const inspectedDate = inspection.inspectionDate
    ? new Date(inspection.inspectionDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
    : '-';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <span className="text-xl">🚑</span>
              <h2 className="text-lg font-bold text-gray-900">
                {inspection.vehicleNumber}
                {inspection.licensePlate && (
                  <span className="text-base font-semibold text-blue-700 ml-1">
                    ({inspection.licensePlate})
                  </span>
                )}
              </h2>
              {inspection.hodApproved ? (
                <span className="status-ready">อนุมัติแล้ว</span>
              ) : (
                <span className="status-badge bg-yellow-100 text-yellow-800">ยังไม่อนุมัติ</span>
              )}
              {inspection.overallStatus === 'ready' && (
                <span className="status-ready">พร้อมใช้</span>
              )}
              {inspection.overallStatus === 'monitor' && (
                <span className="status-monitor">เฝ้าระวัง</span>
              )}
              {inspection.overallStatus === 'not_ready' && (
                <span className="status-not-ready">ไม่พร้อมใช้</span>
              )}
            </div>
            <p className="text-xs text-gray-500">วันตรวจ: {inspectedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
            aria-label="ปิด"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <SummaryPill label="✅ ปกติ" value={counts.normal} cls="bg-green-50 text-green-700" />
            <SummaryPill label="🛠️ แก้ไขแล้ว" value={counts.fixed} cls="bg-orange-50 text-orange-700" />
            <SummaryPill label="❌ ผิดปกติ" value={counts.abnormal} cls="bg-red-50 text-red-700" />
            <SummaryPill label="➖ ไม่มี/ไม่เกี่ยวข้อง" value={counts.na} cls="bg-gray-100 text-gray-600" />
          </div>

          {inspection.remarks && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-900">
              <span className="font-semibold">📝 หมายเหตุ:</span> {inspection.remarks}
            </div>
          )}

          {/* Post-approval edit warning */}
          {inspection.hodApprovedAt && items?.some(
            (it) => it.lastEditedAt && new Date(it.lastEditedAt) > new Date(inspection.hodApprovedAt)
          ) && (
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-3 text-sm text-orange-900">
              <div className="font-semibold flex items-center gap-2">
                <span>🔔</span>
                <span>มีการแก้ไขข้อมูลหลัง HOD อนุมัติ</span>
              </div>
              <div className="text-xs mt-1 opacity-80">
                อนุมัติเมื่อ: {new Date(inspection.hodApprovedAt).toLocaleString('th-TH')}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">กำลังโหลดรายการตรวจ...</p>
            </div>
          ) : (
            (['driver', 'equipment_officer', 'nurse'] as const).map((role) => (
              <RoleSection
                key={role}
                role={role}
                items={items || []}
                hodApprovedAt={inspection.hodApprovedAt}
                completed={
                  role === 'driver'
                    ? !!inspection.driverCompleted
                    : role === 'equipment_officer'
                    ? !!inspection.equipmentOfficerCompleted
                    : !!inspection.nurseCompleted
                }
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryPill({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className={`text-center px-3 py-2 rounded-lg ${cls}`}>
      <div className="text-xs">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

function RoleSection({
  role,
  items,
  completed,
  hodApprovedAt,
}: {
  role: 'driver' | 'equipment_officer' | 'nurse';
  items: any[];
  completed: boolean;
  hodApprovedAt?: string | Date | null;
}) {
  const meta = ROLE_META[role];
  const checklist = INSPECTION_CHECKLIST.filter((c) => c.inspectorRole === role);
  const itemMap = new Map(items.filter((i) => i.inspectorRole === role).map((i) => [i.itemCode, i]));
  const approvedTs = hodApprovedAt ? new Date(hodApprovedAt).getTime() : 0;

  return (
    <div className={`border rounded-xl p-3 ${meta.color}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-sm flex items-center gap-2">
          <span>{meta.icon}</span> {meta.label}
          <span className="text-[11px] font-normal opacity-70">({checklist.length} รายการ)</span>
        </div>
        <span className={`text-[11px] font-medium ${completed ? 'text-green-700' : 'text-gray-500'}`}>
          {completed ? '✓ ตรวจแล้ว' : '○ ยังไม่ตรวจ'}
        </span>
      </div>
      <ul className="text-[12px] grid sm:grid-cols-2 gap-x-3 gap-y-1 max-h-72 overflow-y-auto pr-1">
        {checklist.map((c) => {
          const it = itemMap.get(c.code);
          const mark = !it
            ? { icon: '⬜', cls: 'text-gray-400', title: 'ยังไม่ตรวจ' }
            : it.status === 'abnormal'
            ? { icon: '❌', cls: 'text-red-600 font-semibold', title: 'ผิดปกติ' }
            : it.status === 'fixed'
            ? { icon: '🛠️', cls: 'text-orange-600 font-semibold', title: 'แก้ไขแล้ว' }
            : it.status === 'na'
            ? { icon: '➖', cls: 'text-gray-500', title: 'ไม่มี/ไม่เกี่ยวข้อง' }
            : { icon: '✅', cls: 'text-green-700', title: 'ปกติ' };

          const editedTs = it?.lastEditedAt ? new Date(it.lastEditedAt).getTime() : 0;
          const editedAfterApproval = editedTs > 0 && approvedTs > 0 && editedTs > approvedTs;

          return (
            <li
              key={`${role}-${c.code}`}
              className={`flex items-start gap-1.5 ${mark.cls}`}
              title={`${mark.title}${it?.remarks ? ` — ${it.remarks}` : ''}${it?.value ? ` · ${it.value}` : ''}`}
            >
              <span className="flex-shrink-0">{mark.icon}</span>
              <span className="opacity-60 flex-shrink-0">{c.code}.</span>
              <span className="flex-1 min-w-0">
                <span className="block truncate" title={c.name}>
                  {c.name.split(' / ')[0]}
                  {editedAfterApproval && (
                    <span className="ml-1 text-[10px] text-orange-600 font-bold">🔔</span>
                  )}
                </span>
                {it?.value && (
                  <span className="block text-[10px] opacity-75 truncate">📊 {it.value}</span>
                )}
                {it?.remarks && (
                  <span className="block text-[10px] opacity-75 truncate">📝 {it.remarks}</span>
                )}
                {it?.lastEditedAt && (
                  <span className={`block text-[10px] truncate font-normal ${editedAfterApproval ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
                    ✏️ แก้ไขล่าสุด: {new Date(it.lastEditedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
