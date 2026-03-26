'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export default function QrScanner({ onScanSuccess, onScanError }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanning = useRef(false);

  useEffect(() => {
    const startScanner = async () => {
      if (isScanning.current) return;

      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            // Ignore continuous scan errors
            console.log('Scan error:', errorMessage);
          }
        );

        isScanning.current = true;
      } catch (error: any) {
        console.error('Failed to start scanner:', error);
        if (onScanError) {
          onScanError(error.message || 'ไม่สามารถเปิดกล้องได้ / Cannot access camera');
        }
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && isScanning.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
            isScanning.current = false;
          })
          .catch((err) => console.error('Failed to stop scanner:', err));
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="space-y-4">
      <div
        id="qr-reader"
        className="w-full border-2 border-primary rounded-lg overflow-hidden"
        style={{ maxWidth: '500px', margin: '0 auto' }}
      />
      <p className="text-sm text-gray-600 text-center">
        📷 วางกล้องให้ตรงกับ QR Code<br />
        <span className="text-xs">Position camera over QR Code</span>
      </p>
    </div>
  );
}
