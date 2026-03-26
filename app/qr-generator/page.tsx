'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

export default function QrGeneratorPage() {
  const router = useRouter();
  const [ambulances] = useState([
    { id: 1, vehicleNumber: 'AMB-001', licensePlate: 'กท-1234 กรุงเทพมหานคร' },
    { id: 2, vehicleNumber: 'AMB-002', licensePlate: 'นบ-5678 นนทบุรี' },
    { id: 3, vehicleNumber: 'AMB-003', licensePlate: 'สป-9012 สมุทรปราการ' },
    { id: 4, vehicleNumber: 'AMB-004', licensePlate: 'ปท-3456 ปทุมธานี' },
    { id: 5, vehicleNumber: 'AMB-005', licensePlate: 'ชบ-7890 ชลบุรี' },
  ]);

  const handlePrint = (vehicleNumber: string) => {
    router.push(`/qr-generator/print/${vehicleNumber}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold mb-1">สร้าง QR Code สำหรับรถพยาบาล</h1>
        <h2 className="text-lg text-gray-600 mb-2">Generate QR Codes for Ambulances</h2>
        <p className="text-gray-700">
          สร้างและพิมพ์ QR Code เพื่อนำไปติดที่รถพยาบาลแต่ละคัน<br />
          <span className="text-sm text-gray-500">Generate and print QR Codes to attach on each ambulance</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ambulances.map((ambulance) => (
          <div key={ambulance.id} className="card">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold mb-1">{ambulance.vehicleNumber}</h3>
              <p className="text-sm text-gray-600">{ambulance.licensePlate}</p>
            </div>

            <div className="flex justify-center mb-4 p-4 bg-white border-2 border-gray-200 rounded-lg">
              <QRCodeSVG
                value={ambulance.vehicleNumber}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <button
              onClick={() => handlePrint(ambulance.vehicleNumber)}
              className="btn-primary w-full"
            >
              🖨️ พิมพ์ QR Code / Print
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={() => router.push('/')}
          className="btn-secondary w-full"
        >
          กลับหน้าแรก / Back to Home
        </button>
      </div>

      <div className="mt-6 card bg-blue-50 border border-blue-200">
        <h3 className="font-bold mb-2">💡 คำแนะนำ / Instructions</h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>กด "พิมพ์ QR Code" เพื่อเปิดหน้าพิมพ์สำหรับรถพยาบาลแต่ละคัน</li>
          <li>ควรพิมพ์บนกระดาษกันน้ำหรือใช้ซองพลาสติกคลุม</li>
          <li>ติด QR Code ในตำแหน่งที่มองเห็นง่าย เช่น ด้านข้างตัวรถ</li>
          <li className="text-gray-500 text-xs">Click "Print QR Code" to open print page for each ambulance</li>
          <li className="text-gray-500 text-xs">Should print on waterproof paper or use plastic cover</li>
          <li className="text-gray-500 text-xs">Attach QR Code in visible location, e.g., side of vehicle</li>
        </ul>
      </div>
    </div>
  );
}
