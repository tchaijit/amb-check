'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { exportInspectionToPDF } from '@/lib/pdf-export';
import { todayBangkok } from '@/lib/dates';

export default function HistoryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [inspections, setInspections] = useState<any[]>([]);
  const [filteredInspections, setFilteredInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(todayBangkok());
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Set default start date to 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const start = thirtyDaysAgo.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    setStartDate(start);
    fetchHistory(start, endDate);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inspections, startDate, endDate, vehicleFilter, statusFilter]);

  const fetchHistory = async (start?: string, end?: string) => {
    const s = start ?? startDate;
    const e = end ?? endDate;
    if (!s) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/inspections/history?start=${encodeURIComponent(s)}&end=${encodeURIComponent(e)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
      const normalized = (data.inspections || []).map((ins: any) => ({
        ...ins,
        inspectionDate:
          typeof ins.inspectionDate === 'string'
            ? ins.inspectionDate.split('T')[0]
            : new Date(ins.inspectionDate).toISOString().split('T')[0],
      }));
      setInspections(normalized);
    } catch (error: any) {
      console.error('Error fetching history:', error);
      alert(error?.message || 'โหลดประวัติไม่สำเร็จ');
      setInspections([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...inspections];

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(i => i.inspectionDate >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(i => i.inspectionDate <= endDate);
    }

    // Filter by vehicle
    if (vehicleFilter) {
      filtered = filtered.filter(i =>
        i.vehicleNumber.toLowerCase().includes(vehicleFilter.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.overallStatus === statusFilter);
    }

    setFilteredInspections(filtered);
  };

  const handleExportPDF = async (inspection: any) => {
    setExporting(true);
    try {
      const result = await exportInspectionToPDF(inspection);
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
        <h1 className="text-2xl font-bold mb-1">ประวัติการตรวจสอบ</h1>
        <h2 className="text-lg text-gray-600 mb-4">Inspection History</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">วันที่เริ่มต้น / Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">วันที่สิ้นสุด / End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">หมายเลขรถ / Vehicle Number</label>
            <input
              type="text"
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              placeholder="AMB-001"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">สถานะ / Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">ทั้งหมด / All</option>
              <option value="ready">พร้อมใช้ / Ready</option>
              <option value="monitor">ติดตาม / Monitor</option>
              <option value="not_ready">ไม่พร้อม / Not Ready</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => fetchHistory()}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'กำลังโหลด... / Loading...' : 'ค้นหา / Search'}
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="card mb-4 bg-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">ผลการค้นหา / Search Results</p>
            <p className="text-2xl font-bold text-blue-600">
              {filteredInspections.length} รายการ / Records
            </p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>ทั้งหมด / Total: {inspections.length}</p>
            <p>กรอง / Filtered: {filteredInspections.length}</p>
          </div>
        </div>
      </div>

      {/* Inspection List */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="text-2xl mb-2">กำลังโหลด... / Loading...</div>
        </div>
      ) : filteredInspections.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-2">ไม่พบข้อมูล / No Data Found</h3>
          <p className="text-gray-600">
            ไม่พบประวัติการตรวจสอบตามเงื่อนไขที่เลือก
            <br />
            <span className="text-sm">No inspection history found matching the selected criteria</span>
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-600 bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 whitespace-nowrap">วันที่ตรวจ</th>
                <th className="text-left px-3 py-2 whitespace-nowrap">รถ</th>
                <th className="text-left px-3 py-2">ยานพาหนะ</th>
                <th className="text-left px-3 py-2">เคลื่อนย้าย</th>
                <th className="text-left px-3 py-2">พยาบาล</th>
                <th className="text-left px-3 py-2 whitespace-nowrap">สถานะ</th>
                <th className="text-left px-3 py-2 whitespace-nowrap">HOD</th>
                <th className="text-right px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredInspections.map((ins) => (
                <tr key={ins.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-800">
                    {new Date(ins.inspectionDate).toLocaleDateString('th-TH', {
                      year: '2-digit',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="font-semibold">🚑 {ins.vehicleNumber}</div>
                    {ins.licensePlate && (
                      <div className="text-xs text-blue-700">{ins.licensePlate}</div>
                    )}
                  </td>
                  <RoleCell completed={!!ins.driverCompleted} meta={ins.roleMeta?.driver} />
                  <RoleCell
                    completed={!!ins.equipmentOfficerCompleted}
                    meta={ins.roleMeta?.equipment_officer}
                  />
                  <RoleCell completed={!!ins.nurseCompleted} meta={ins.roleMeta?.nurse} />
                  <td className="px-3 py-2 whitespace-nowrap">
                    {ins.overallStatus === 'ready' && (
                      <span className="status-ready">พร้อมใช้</span>
                    )}
                    {ins.overallStatus === 'monitor' && (
                      <span className="status-monitor">เฝ้าระวัง</span>
                    )}
                    {ins.overallStatus === 'not_ready' && (
                      <span className="status-not-ready">ไม่พร้อม</span>
                    )}
                    {!ins.overallStatus && (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {ins.hodApproved ? (
                      <div>
                        <div className="text-green-700 font-medium">✓ อนุมัติ</div>
                        {ins.hodApprovedAt && (
                          <div className="text-gray-500">
                            {new Date(ins.hodApprovedAt).toLocaleString('th-TH', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">รอ</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => router.push(`/inspect/${ins.id}`)}
                        className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100"
                        title="ดูรายละเอียด"
                      >
                        🔍
                      </button>
                      <button
                        onClick={() => handleExportPDF(ins)}
                        disabled={exporting}
                        className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-50"
                        title="Export PDF"
                      >
                        📄
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="btn-secondary w-full"
        >
          กลับแดชบอร์ด / Back to Dashboard
        </button>
      </div>
    </div>
  );
}

function RoleCell({
  completed,
  meta,
}: {
  completed: boolean;
  meta?: { lastAt: string | null; userName: string | null };
}) {
  if (!completed && !meta?.lastAt) {
    return (
      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-400">
        ○ ยังไม่ตรวจ
      </td>
    );
  }
  return (
    <td className="px-3 py-2 whitespace-nowrap text-xs">
      <div className={completed ? 'text-green-700 font-medium' : 'text-gray-600'}>
        {completed ? '✓' : '◐'} {meta?.userName || '—'}
      </div>
      {meta?.lastAt && (
        <div className="text-gray-500">
          {new Date(meta.lastAt).toLocaleString('th-TH', {
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </div>
      )}
    </td>
  );
}
