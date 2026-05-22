'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

interface Ambulance {
  id: number;
  vehicleNumber: string;
  licensePlate: string;
  qrCode: string;
  status?: string;
}

export default function QrGeneratorPage() {
  const router = useRouter();
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        const res = await fetch('/api/admin/vehicles');
        if (!res.ok) {
          throw new Error('Failed to fetch vehicles');
        }
        const data = await res.json();
        setAmbulances(data.vehicles || []);
      } catch (err: any) {
        console.error('Error fetching ambulances:', err);
        setError('ไม่สามารถโหลดข้อมูลรถพยาบาลได้ / Failed to load ambulances');
      } finally {
        setLoading(false);
      }
    };

    fetchAmbulances();
  }, []);

  const handlePrint = (vehicleNumber: string) => {
    router.push(`/qr-generator/print/${vehicleNumber}`);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="card text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-xl font-bold mb-2">กำลังโหลด... / Loading...</h1>
          <p className="text-gray-600">กำลังโหลดข้อมูลรถพยาบาล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="card bg-red-50 border-red-200">
          <h1 className="text-xl font-bold text-red-800 mb-2">เกิดข้อผิดพลาด / Error</h1>
          <p className="text-red-700 mb-4">{error}</p>
          <button onClick={() => router.push('/admin')} className="btn-secondary w-full">
            ไปที่หน้าจัดการรถ / Go to Vehicle Management
          </button>
        </div>
      </div>
    );
  }

  if (ambulances.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="card bg-yellow-50 border-yellow-200">
          <h1 className="text-xl font-bold text-yellow-800 mb-2">ไม่พบรถพยาบาล / No Ambulances</h1>
          <p className="text-yellow-700 mb-4">กรุณาเพิ่มรถพยาบาลในหน้าจัดการก่อน / Please add ambulances in the management page first</p>
          <button onClick={() => router.push('/admin')} className="btn-primary w-full">
            ไปที่หน้าจัดการรถ / Go to Vehicle Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold mb-1">สร้าง QR Code สำหรับรถพยาบาล</h1>
        <h2 className="text-lg text-gray-600 mb-2">Generate QR Codes for Ambulances</h2>
        <p className="text-gray-700">
          สร้างและพิมพ์ QR Code เพื่อนำไปติดที่รถพยาบาลแต่ละคัน<br />
          <span className="text-sm text-gray-500">Generate and print QR Codes to attach on each ambulance</span>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          จำนวนรถพยาบาลทั้งหมด: {ambulances.length} คัน / Total: {ambulances.length} vehicles
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
                value={`${typeof window !== 'undefined' ? window.location.origin : 'https://bsi-amb-check.vercel.app'}/scan/${ambulance.vehicleNumber}`}
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
