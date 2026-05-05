'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export default function QrScanner({ onScanSuccess, onScanError }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanErrorRef = useRef(onScanError);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanErrorRef.current = onScanError;
  }, [onScanSuccess, onScanError]);

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => onScanSuccessRef.current(decodedText),
        () => {
          // Ignore continuous scan errors
        }
      )
      .then(() => {
        if (cancelled) {
          // Component unmounted before start finished — stop now.
          scanner.stop().then(() => scanner.clear()).catch(() => {});
        }
      })
      .catch((error: any) => {
        // Ignore aborts from React Strict Mode remount or component unmount.
        const name = error?.name || '';
        const msg = String(error?.message || error || '');
        const isAbort =
          cancelled || name === 'AbortError' || /abort/i.test(msg);
        if (isAbort) return;
        console.error('Failed to start scanner:', error);
        onScanErrorRef.current?.(msg || 'ไม่สามารถเปิดกล้องได้ / Cannot access camera');
      });

    return () => {
      cancelled = true;
      if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        scanner.stop().then(() => scanner.clear()).catch(() => {});
      }
      // If not yet SCANNING, the .then() above will handle stop after start resolves.
    };
  }, []);

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
