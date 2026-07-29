'use client';

import { useState, useEffect } from 'react';
import { INSPECTION_CHECKLIST } from '@/lib/checklist-data';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const STATUS_LEVEL: Record<string, number> = { not_ready: 0, monitor: 1, ready: 2 };
const LEVEL_LABEL: Record<number, string> = { 0: 'ไม่พร้อมใช้', 1: 'เฝ้าระวัง', 2: 'พร้อมใช้' };

export default function MonthlyReport() {
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

