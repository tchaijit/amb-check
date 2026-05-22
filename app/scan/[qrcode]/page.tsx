'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function QrRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState('');
  const qrCode = params.qrcode as string;

  useEffect(() => {
    const handleQrScan = async () => {
      // Check if user is authenticated
      if (status === 'loading') {
        return; // Wait for session to load
      }

      if (status === 'unauthenticated') {
        // Redirect to login with callback URL
        const callbackUrl = encodeURIComponent(`/scan/${qrCode}`);
        router.push(`/login?callbackUrl=/scan/${qrCode}`);
        return;
      }

      // User is authenticated, proceed with inspection
      try {
        // 1) Look up ambulance by QR code
        const ambRes = await fetch(`/api/ambulances/${encodeURIComponent(qrCode)}`);
        if (!ambRes.ok) {
          if (ambRes.status === 404) {
            setError('ไม่พบรถพยาบาลนี้ / Ambulance not found');
            return;
          }
          setError('ไม่สามารถค้นหารถพยาบาลได้ / Failed to look up ambulance');
          return;
        }
        const { ambulance, todayInspection } = await ambRes.json();

        // 2) Reuse today's inspection if it exists
        let inspectionId: number | undefined = todayInspection?.id;

        // 3) Otherwise create one
        if (!inspectionId) {
          const createRes = await fetch('/api/inspections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ambulanceId: ambulance.id }),
          });
          if (!createRes.ok) {
            setError('ไม่สามารถเริ่มการตรวจสอบได้ / Failed to create inspection');
            return;
          }
          const { inspection } = await createRes.json();
          inspectionId = inspection?.id;
        }

        if (!inspectionId) {
          setError('ไม่ได้รับ inspection id / Missing inspection id');
          return;
        }

        // Navigate to inspection page
        router.push(`/inspect/${inspectionId}`);
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาด / An error occurred');
      }
    };

    if (qrCode) {
      handleQrScan();
    }
  }, [qrCode, status, router]);

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="card bg-red-50 border-red-200">
          <h1 className="text-xl font-bold text-red-800 mb-2">เกิดข้อผิดพลาด / Error</h1>
          <p className="text-red-700 mb-4">{error}</p>
          <button onClick={() => router.push('/')} className="btn-secondary w-full">
            กลับหน้าแรก / Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="card text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-xl font-bold mb-2">กำลังโหลด... / Loading...</h1>
        <p className="text-gray-600">
          {status === 'loading' ? 'กำลังตรวจสอบการเข้าสู่ระบบ...' : 'กำลังเปิดหน้าตรวจสอบ...'}
        </p>
      </div>
    </div>
  );
}
