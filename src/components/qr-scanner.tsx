"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2 } from "lucide-react";

export default function QRScanner({
  onScan,
}: {
  onScan: (code: string) => void;
}) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(true);
  const hasScanned = useRef(false);

  useEffect(() => {
    const scannerId = "qr-reader";
    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (hasScanned.current) return;
          hasScanned.current = true;
          scanner.stop().then(() => onScan(decodedText));
        },
        () => {}
      )
      .then(() => setStarting(false))
      .catch((err) => {
        setError("Camera access denied. Please allow camera permissions.");
        console.error(err);
        setStarting(false);
      });

    return () => {
      scanner.isScanning && scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="space-y-4">
      {starting && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <div
        id="qr-reader"
        className="overflow-hidden rounded-xl border"
        style={{ width: "100%" }}
      />

      <p className="text-xs text-muted-foreground text-center">
        Point the camera at the guest's QR code
      </p>
    </div>
  );
}