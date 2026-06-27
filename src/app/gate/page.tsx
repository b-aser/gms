"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScanLine, Keyboard } from "lucide-react";
import QRScanner from "@/components/qr-scanner";
import ManualEntry from "@/components/manual-entry";
import CheckinResult from "@/components/checkin-result";
import RecentCheckins from "@/components/recent-checkins";

type ResultStatus = "success" | "already_checked_in" | "invalid";

type CheckinResult = {
  status: ResultStatus;
  guest?: {
    name: string;
    partySize: number;
    checkedInAt: string;
    notes?: string;
  };
};

type Mode = "choose" | "scan" | "manual";

export default function GatePage() {
  const [mode, setMode] = useState<Mode>("choose");
  const [result, setResult] = useState<CheckinResult | null>(null);

  async function handleCode(code: string) {
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();

    if (res.status === 404) {
      setResult({ status: "invalid" });
      return;
    }

    setResult({ status: data.status, guest: data.guest });
  }

  function handleReset() {
    setResult(null);
    setMode("choose");
  }

  // Show result screen
  if (result) {
    return <CheckinResult result={result} onReset={handleReset} />;
  }

  // Mode chooser
  if (mode === "choose") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-1 pt-4">
          <h1 className="text-2xl font-bold">Gate Check-in</h1>
          <p className="text-muted-foreground text-sm">
            How would you like to verify this guest?
          </p>
        </div>
  
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMode("scan")}
            className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <ScanLine className="h-10 w-10 text-primary" />
            <span className="font-semibold">Scan QR</span>
            <span className="text-xs text-muted-foreground text-center">
              Use camera to scan guest QR code
            </span>
          </button>
  
          <button
            onClick={() => setMode("manual")}
            className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <Keyboard className="h-10 w-10 text-primary" />
            <span className="font-semibold">Enter Code</span>
            <span className="text-xs text-muted-foreground text-center">
              Type the invite code manually
            </span>
          </button>
        </div>
  
        <RecentCheckins />
      </div>
    );
  }

  if (mode === "scan") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setMode("choose")}>
            ← Back
          </Button>
          <h2 className="text-lg font-semibold">Scan QR Code</h2>
        </div>
        <QRScanner onScan={handleCode} />
      </div>
    );
  }

  if (mode === "manual") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setMode("choose")}>
            ← Back
          </Button>
          <h2 className="text-lg font-semibold">Enter Invite Code</h2>
        </div>
        <ManualEntry onSubmit={handleCode} />
      </div>
    );
  }
}