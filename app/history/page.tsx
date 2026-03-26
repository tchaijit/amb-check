'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { exportInspectionToPDF } from '@/lib/pdf-export';

export default function HistoryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [inspections, setInspections] = useState<any[]>([]);
  const [filteredInspections, setFilteredInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Set default start date to 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);

    fetchHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inspections, startDate, endDate, vehicleFilter, statusFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // TODO: Connect to real API
      // const response = await fetch(`/api/inspections/history?start=${startDate}&end=${endDate}`);
      // const data = await response.json();
      // setInspections(data.inspections);

      // Mock data for demonstration
      const mockHistory = [
        {
          id: 1,
          vehicleNumber: 'AMB-001',
          inspectionDate: '2026-03-25',
          driverCompleted: true,
          equipmentOfficerCompleted: true,
          nurseCompleted: true,
          overallStatus: 'ready',
          hodApproved: true,
          hodApprovedAt: '2026-03-25T10:30:00',
          remarks: null,
        },
        {
          id: 2,
          vehicleNumber: 'AMB-002',
          inspectionDate: '2026-03-25',
          driverCompleted: true,
          equipmentOfficerCompleted: true,
          nurseCompleted: true,
          overallStatus: 'monitor',
          hodApproved: true,
          hodApprovedAt: '2026-03-25T11:00:00',
          remarks: 'พบรายการผิดปกติบางข้อ แต่แก้ไขแล้ว',
        },
        {
          id: 3,
          vehicleNumber: 'AMB-001',
          inspectionDate: '2026-03-24',
          driverCompleted: true,
          equipmentOfficerCompleted: true,
          nurseCompleted: true,
          overallStatus: 'ready',
          hodApproved: true,
          hodApprovedAt: '2026-03-24T09:15:00',
          remarks: null,
        },
        {
          id: 4,
          vehicleNumber: 'AMB-003',
          inspectionDate: '2026-03-24',
          driverCompleted: true,
          equipmentOfficerCompleted: true,
          nurseCompleted: true,
          overallStatus: 'ready',
          hodApproved: true,
          hodApprovedAt: '2026-03-24T09:45:00',
          remarks: null,
        },
        {
          id: 5,
          vehicleNumber: 'AMB-002',
          inspectionDate: '2026-03-23',
          driverCompleted: true,
          equipmentOfficerCompleted: true,
          nurseCompleted: true,
          overallStatus: 'not_ready',
          hodApproved: false,
          hodApprovedAt: null,
          remarks: 'พบปัญหาเครื่องยนต์ ส่งซ่อม',
        },
      ];

      setInspections(mockHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
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
            onClick={fetchHistory}
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
        <div className="space-y-3">
          {filteredInspections.map((inspection) => (
            <div key={inspection.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    🚑 {inspection.vehicleNumber}
                    {inspection.hodApproved && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        ✓ อนุมัติแล้ว / Approved
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(inspection.inspectionDate).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {inspection.hodApprovedAt && (
                      <span className="ml-2">
                        • อนุมัติเวลา / Approved at: {new Date(inspection.hodApprovedAt).toLocaleTimeString('th-TH')}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  {inspection.overallStatus === 'ready' && (
                    <span className="status-ready">พร้อมใช้ / Ready</span>
                  )}
                  {inspection.overallStatus === 'monitor' && (
                    <span className="status-monitor">ติดตาม / Monitor</span>
                  )}
                  {inspection.overallStatus === 'not_ready' && (
                    <span className="status-not-ready">ไม่พร้อม / Not Ready</span>
                  )}
                </div>
              </div>

              {inspection.remarks && (
                <div className="mb-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                  <strong>หมายเหตุ / Remarks:</strong> {inspection.remarks}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/inspect/${inspection.id}`)}
                  className="btn-secondary flex-1"
                >
                  ดูรายละเอียด / View Details
                </button>
                <button
                  onClick={() => handleExportPDF(inspection)}
                  disabled={exporting}
                  className="btn-secondary inline-flex items-center justify-center gap-1"
                  title="Export PDF"
                >
                  📄 PDF
                </button>
              </div>
            </div>
          ))}
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
