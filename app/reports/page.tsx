'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DateInput from '@/components/DateInput';
import {
  ReportData,
  weekRange,
  monthRange,
  exportReportToCSV,
  exportReportToPDF,
} from '@/lib/report-export';

type Preset = 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';

const PRESETS: Array<{ key: Preset; label: string; sub: string }> = [
  { key: 'thisWeek', label: 'สัปดาห์นี้', sub: 'This week' },
  { key: 'lastWeek', label: 'สัปดาห์ก่อน', sub: 'Last week' },
  { key: 'thisMonth', label: 'เดือนนี้', sub: 'This month' },
  { key: 'lastMonth', label: 'เดือนก่อน', sub: 'Last month' },
  { key: 'custom', label: 'กำหนดเอง', sub: 'Custom' },
];

function rangeForPreset(preset: Preset): { start: string; end: string } {
  switch (preset) {
    case 'thisWeek':
      return weekRange();
    case 'lastWeek':
      return weekRange(new Date(), 1);
    case 'thisMonth':
      return monthRange();
    case 'lastMonth':
      return monthRange(new Date(), 1);
    default:
      return weekRange();
  }
}

function presetLabel(preset: Preset): string {
  const map: Record<Preset, string> = {
    thisWeek: 'Weekly',
    lastWeek: 'Weekly',
    thisMonth: 'Monthly',
    lastMonth: 'Monthly',
    custom: 'Custom',
  };
  return map[preset];
}

const fmt = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

export default function ReportsPage() {
  const router = useRouter();
  const [preset, setPreset] = useState<Preset>('thisWeek');
  const initial = rangeForPreset('thisWeek');
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<'' | 'csv' | 'pdf'>('');
  const [error, setError] = useState('');
  const [data, setData] = useState<ReportData | null>(null);

  const applyPreset = (p: Preset) => {
    setPreset(p);
    if (p !== 'custom') {
      const r = rangeForPreset(p);
      setStart(r.start);
      setEnd(r.end);
    }
  };

  const fetchReport = useCallback(async () => {
    if (!start || !end) return;
    if (start > end) {
      setError('วันเริ่มต้นต้องมาก่อนวันสิ้นสุด');
      setData(null);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/report?start=${start}&end=${end}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'โหลดรายงานไม่สำเร็จ');
      setData(json);
    } catch (err: any) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleCSV = () => {
    if (!data) return;
    setExporting('csv');
    try {
      exportReportToCSV(data, presetLabel(preset));
    } finally {
      setExporting('');
    }
  };

  const handlePDF = async () => {
    if (!data) return;
    setExporting('pdf');
    try {
      const r = await exportReportToPDF(data, presetLabel(preset));
      if (!r.success) setError('สร้าง PDF ไม่สำเร็จ');
    } finally {
      setExporting('');
    }
  };

  const s = data?.summary;
  const hasData = !!data && (data.summary.totalInspections > 0 || data.details.length > 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1">📄 รายงาน / Reports</h1>
          <h2 className="text-sm text-gray-600">ออกรายงานรายสัปดาห์ / รายเดือน และ export เป็น Excel หรือ PDF</h2>
        </div>

        {/* Preset selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => applyPreset(p.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                preset === p.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {p.label}
              <span className={`block text-[10px] ${preset === p.key ? 'text-blue-100' : 'text-gray-400'}`}>
                {p.sub}
              </span>
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">วันเริ่มต้น / Start</label>
            <DateInput
              value={start}
              onChange={(v) => {
                setStart(v);
                setPreset('custom');
              }}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">วันสิ้นสุด / End</label>
            <DateInput
              value={end}
              onChange={(v) => {
                setEnd(v);
                setPreset('custom');
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={fetchReport} disabled={loading} className="btn-secondary">
            🔄 {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
          </button>
          <button
            onClick={handleCSV}
            disabled={!hasData || !!exporting}
            className="btn-primary disabled:opacity-50"
          >
            📊 {exporting === 'csv' ? 'กำลัง export...' : 'Export Excel (CSV)'}
          </button>
          <button
            onClick={handlePDF}
            disabled={!hasData || !!exporting}
            className="btn-primary disabled:opacity-50"
          >
            📄 {exporting === 'pdf' ? 'กำลังสร้าง PDF...' : 'Export PDF'}
          </button>
        </div>

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}
      </div>

      {loading && !data ? (
        <div className="card text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">กำลังโหลดรายงาน...</p>
        </div>
      ) : !hasData ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-bold mb-2">ไม่มีข้อมูลในช่วงนี้</h3>
          <p className="text-gray-600 text-sm">
            ไม่พบการตรวจสอบระหว่าง {fmt(start)} — {fmt(end)}
          </p>
        </div>
      ) : (
        <>
          {/* Summary preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <PreviewCard gradient="from-blue-500 to-blue-600" label="ทั้งหมด" value={s!.totalInspections} />
            <PreviewCard gradient="from-green-500 to-green-600" label="พร้อมใช้" value={s!.readyVehicles} />
            <PreviewCard gradient="from-yellow-500 to-orange-500" label="เฝ้าระวัง" value={s!.monitorVehicles} />
            <PreviewCard gradient="from-red-500 to-red-600" label="ไม่พร้อม" value={s!.notReadyVehicles} />
          </div>

          <div className="card mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">
                รายละเอียด ({data!.details.length} รายการ)
              </h3>
              <span className="text-sm text-gray-500">
                {fmt(data!.start)} — {fmt(data!.end)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="py-2 pr-3">วันที่</th>
                    <th className="py-2 pr-3">รถ</th>
                    <th className="py-2 pr-3">สถานะ</th>
                    <th className="py-2 pr-3 text-center">HOD</th>
                    <th className="py-2 pr-3 text-center">ผิดปกติ</th>
                  </tr>
                </thead>
                <tbody>
                  {data!.details.slice(0, 100).map((d, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap">{fmt(d.date)}</td>
                      <td className="py-2 pr-3 font-medium">{d.vehicle}</td>
                      <td className="py-2 pr-3">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="py-2 pr-3 text-center">{d.hodApproved ? '✅' : '—'}</td>
                      <td className="py-2 pr-3 text-center">
                        {d.abnormalCount > 0 ? (
                          <span className="text-red-600 font-bold">{d.abnormalCount}</span>
                        ) : (
                          '0'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data!.details.length > 100 && (
                <p className="text-xs text-gray-400 mt-2">
                  แสดง 100 รายการแรก — export เพื่อดูทั้งหมด ({data!.details.length} รายการ)
                </p>
              )}
            </div>
          </div>
        </>
      )}

      <div className="mt-6">
        <button onClick={() => router.push('/dashboard')} className="btn-secondary w-full">
          ← กลับแดชบอร์ด
        </button>
      </div>
    </div>
  );
}

function PreviewCard({ gradient, label, value }: { gradient: string; label: string; value: number }) {
  return (
    <div className={`card bg-gradient-to-br ${gradient} text-white`}>
      <div className="text-sm opacity-90">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    ready: { cls: 'bg-green-100 text-green-800', label: 'พร้อมใช้' },
    monitor: { cls: 'bg-yellow-100 text-yellow-800', label: 'เฝ้าระวัง' },
    not_ready: { cls: 'bg-red-100 text-red-800', label: 'ไม่พร้อม' },
  };
  const s = map[status] || { cls: 'bg-gray-100 text-gray-600', label: status || '-' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
}
