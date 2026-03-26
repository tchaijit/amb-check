'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const QrScanner = dynamic(() => import('@/components/QrScanner'), { ssr: false });

export default function ScannerPage() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');

  const processQrCode = async (code: string) => {
    setError('');
    setLoading(true);

    try {
      // Mock: Direct to inspection page with ID
      // In production, this would call API to check/create inspection
      // const response = await fetch(`/api/ambulances/${code}`);

      // For demo: assume code is like "AMB-001"
      if (code.startsWith('AMB-')) {
        const inspectionId = Math.floor(Math.random() * 1000) + 1;
        router.push(`/inspect/${inspectionId}`);
      } else {
        throw new Error('รูปแบบ QR Code ไม่ถูกต้อง / Invalid QR Code format');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด / An error occurred');
      setLoading(false);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    console.log('QR Code scanned:', decodedText);
    processQrCode(decodedText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    processQrCode(qrCode);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-2 text-center">สแกน QR Code</h1>
        <h2 className="text-lg text-gray-600 text-center mb-4">Scan QR Code</h2>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setScanMode('camera')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              scanMode === 'camera'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📷 สแกนด้วยกล้อง / Scan
          </button>
          <button
            type="button"
            onClick={() => setScanMode('manual')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              scanMode === 'manual'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ⌨️ กรอกเอง / Manual
          </button>
        </div>

        {scanMode === 'camera' ? (
          <div className="space-y-4">
            <QrScanner
              onScanSuccess={handleScanSuccess}
              onScanError={(err) => setError(err)}
            />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            {loading && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded text-center">
                กำลังโหลด... / Loading...
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              QR Code รถพยาบาล / Ambulance QR Code
            </label>
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="เช่น / e.g. AMB-001"
              className="input-field"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'กำลังโหลด... / Loading...' : 'เริ่มตรวจสอบ / Start Inspection'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t">
          <button
            onClick={() => router.push('/')}
            className="btn-secondary w-full"
          >
            กลับหน้าแรก / Back to Home
          </button>
        </div>
      </div>

      <div className="mt-6 card bg-yellow-50 border border-yellow-200">
        <h3 className="font-bold mb-2">💡 สำหรับการทดสอบ / For Testing</h3>
        <p className="text-sm text-gray-700 mb-2">
          คุณสามารถใช้ QR Code ตัวอย่างเหล่านี้:<br />
          <span className="text-gray-500">You can use these sample QR Codes:</span>
        </p>
        <ul className="text-sm space-y-1">
          <li><code className="bg-white px-2 py-1 rounded">AMB-001</code></li>
          <li><code className="bg-white px-2 py-1 rounded">AMB-002</code></li>
          <li><code className="bg-white px-2 py-1 rounded">AMB-003</code></li>
        </ul>
      </div>
    </div>
  );
}
