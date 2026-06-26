"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

export function QRDisplay({ code, name }: { code: string; name: string }) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(code, { 
        width: 200,
        margin: 2,
        color: {
            dark: "#1A1A1A",
            light: "#F5F5F5",
        },
        errorCorrectionLevel: "H",
    }).then(setDataUrl);
  }, [code]);

  function handleDownload() {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `invite-${name.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  }

  if (!dataUrl) return <div className="h-[200px] w-[200px] bg-muted rounded animate-pulse" />;

  return (
    <>
      <img
        src={dataUrl}
        alt={`QR code for ${name}`}
        className="rounded border"
        width={200}
        height={200}
      />
      <Button variant="outline" size="sm" onClick={handleDownload}>
        <Download className="h-4 w-4 mr-2" />
        Download QR
      </Button>
    </>
  )
}
