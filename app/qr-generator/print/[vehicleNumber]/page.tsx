'use client';

import { useParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';

export default function PrintQrPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleNumber = params.vehicleNumber as string;

  const ambulances: Record<string, { licensePlate: string }> = {
    'AMB-001': { licensePlate: 'กท-1234 กรุงเทพมหานคร' },
    'AMB-002': { licensePlate: 'นบ-5678 นนทบุรี' },
    'AMB-003': { licensePlate: 'สป-9012 สมุทรปราการ' },
    'AMB-004': { licensePlate: 'ปท-3456 ปทุมธานี' },
    'AMB-005': { licensePlate: 'ชบ-7890 ชลบุรี' },
  };

  const ambulance = ambulances[vehicleNumber];

  useEffect(() => {
    // Load print styles
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body { margin: 0; }
        .no-print { display: none !important; }
        .print-container {
          page-break-after: always;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2cm;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!ambulance) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="card bg-red-50 border-red-200">
          <h1 className="text-xl font-bold text-red-800 mb-2">ไม่พบข้อมูลรถพยาบาล</h1>
          <p className="text-red-700">Ambulance not found</p>
          <button onClick={() => router.push('/qr-generator')} className="btn-secondary mt-4">
            กลับ / Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Control buttons - hidden when printing */}
      <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
        <button onClick={() => router.back()} className="btn-secondary">
          ← กลับ / Back
        </button>
        <button onClick={handlePrint} className="btn-primary">
          🖨️ พิมพ์ / Print
        </button>
      </div>

      {/* Printable content */}
      <div className="print-container bg-white">
        <div className="text-center max-w-md mx-auto">
          {/* Hospital Logo / Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Bangkok Hospital Siriroj
            </h1>
            <h2 className="text-xl text-gray-700">Ambulance QR Code</h2>
          </div>

          {/* QR Code */}
          <div className="bg-white p-8 border-4 border-primary rounded-2xl mb-6 inline-block">
            <QRCodeSVG
              value={vehicleNumber}
              size={300}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Vehicle Information */}
          <div className="bg-primary text-white p-6 rounded-lg mb-4">
            <div className="text-4xl font-bold mb-2">{vehicleNumber}</div>
            <div className="text-xl">{ambulance.licensePlate}</div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-100 p-4 rounded-lg text-left">
            <h3 className="font-bold mb-2 text-center">วิธีใช้งาน / How to Use</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>เปิดแอปพลิเคชัน AMB Check</li>
              <li>เลือกตำแหน่งของคุณ</li>
              <li>สแกน QR Code นี้</li>
              <li>ทำการตรวจสอบตาม checklist</li>
            </ol>
            <div className="text-xs text-gray-500 mt-2 text-center">
              Open AMB Check app → Select role → Scan QR → Complete checklist
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-xs text-gray-500">
            <p>พิมพ์บนกระดาษกันน้ำและติดในตำแหน่งที่มองเห็นง่าย</p>
            <p>Print on waterproof paper and attach in visible location</p>
          </div>
        </div>
      </div>
    </>
  );
}
