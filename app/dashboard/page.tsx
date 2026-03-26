'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { exportInspectionToPDF, exportMultipleInspectionsToPDF } from '@/lib/pdf-export';

export default function DashboardPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      // TODO: Create API endpoint for fetching inspections by date
      // const response = await fetch(`/api/inspections?date=${selectedDate}`);
      // const data = await response.json();
      // setInspections(data.inspections);

      // Using mock data for demonstration
      const mockInspections = [
        {
          id: 1,
          vehicleNumber: 'AMB-001',
          licensePlate: 'กท-1234 กรุงเทพมหานคร',
          inspectionDate: new Date(),
          driverCompleted: true,
          equipmentOfficerCompleted: true,
          nurseCompleted: true,
          overallStatus: 'ready',
          hodApproved: false,
          remarks: null,
        },
        {
          id: 2,
          vehicleNumber: 'AMB-002',
          licensePlate: 'นบ-5678 นนทบุรี',
          inspectionDate: new Date(),
          driverCompleted: true,
          equipmentOfficerCompleted: true,
          nurseCompleted: true,
          overallStatus: 'monitor',
          hodApproved: false,
          remarks: 'พบรายการผิดปกติบางข้อ แต่แก้ไขแล้ว',
        },
      ];

      setInspections(mockInspections);
    } catch (error) {
      console.error('Error fetching inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (inspectionId: number) => {
    try {
      // TODO: Connect to real API
      // const response = await fetch(`/api/inspections/${inspectionId}/approve`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ hodId: 1 }),
      // });
      // if (!response.ok) throw new Error('Failed to approve');

      // Mock approval
      setInspections(prev => prev.map(inspection =>
        inspection.id === inspectionId
          ? { ...inspection, hodApproved: true, hodApprovedAt: new Date() }
          : inspection
      ));

      alert('อนุมัติสำเร็จ / Approved successfully');
    } catch (error: any) {
      alert(error.message || 'เกิดข้อผิดพลาด / An error occurred');
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

        <div className="mt-4 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">เลือกวันที่ / Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
          <button
            onClick={fetchInspections}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'กำลังโหลด... / Loading...' : 'ค้นหา / Search'}
          </button>
          {inspections.length > 0 && (
            <button
              onClick={handleExportAllPDF}
              disabled={exporting}
              className="btn-secondary inline-flex items-center gap-2"
            >
              📄 {exporting ? 'กำลังสร้าง... / Generating...' : 'Export PDF ทั้งหมด / Export All'}
            </button>
          )}
        </div>
      </div>

      {inspections.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-2">ไม่มีข้อมูลการตรวจสอบ / No Inspection Data</h3>
          <p className="text-gray-600 mb-4">
            กรุณาเลือกวันที่และกดค้นหา หรือไม่พบข้อมูลการตรวจสอบในวันที่เลือก
            <br />
            <span className="text-sm">Please select a date and click Search, or no inspections found for the selected date</span>
          </p>
          <p className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-4 max-w-2xl mx-auto">
            💡 หมายเหตุ: ระบบอยู่ระหว่างพัฒนา เจ้าหน้าที่ควรทำการตรวจสอบให้เสร็จก่อน
            <br />
            Note: The system is still in development. Staff should complete inspections first, then HOD will see pending approvals here.
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
                    <h3 className="text-lg font-bold">
                      รถพยาบาล / Ambulance {inspection.vehicleNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ทะเบียน / License: {inspection.licensePlate}
                    </p>
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
                  {allCompleted && !inspection.hodApproved && (
                    <button
                      onClick={() => handleApprove(inspection.id)}
                      className="btn-success flex-1"
                    >
                      อนุมัติ / Approve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
