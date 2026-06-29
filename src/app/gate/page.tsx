"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScanLine, Keyboard, Search } from "lucide-react";
import QRScanner from "@/components/qr-scanner";
import ManualEntry from "@/components/manual-entry";
import CheckinResult from "@/components/checkin-result";
import RecentCheckins from "@/components/recent-checkins";
import GateSearch from "@/components/gate-search";
import GateSessionStats from "@/components/gate-session-stats";

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

type Mode = "choose" | "scan" | "manual" | "search";

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

  if (mode === "choose") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-1 pt-4">
          <h1 className="text-2xl font-bold">Gate Check-in</h1>
          <p className="text-muted-foreground text-sm">
            How would you like to verify this guest?
          </p>
        </div>
  
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setMode("scan")}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <ScanLine className="h-8 w-8 text-primary" />
            <span className="font-semibold text-sm">Scan QR</span>
            <span className="text-xs text-muted-foreground text-center">
              Camera scan
            </span>
          </button>
  
          <button
            onClick={() => setMode("manual")}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <Keyboard className="h-8 w-8 text-primary" />
            <span className="font-semibold text-sm">Enter Code</span>
            <span className="text-xs text-muted-foreground text-center">
              Type invite code
            </span>
          </button>
  
          <button
            onClick={() => setMode("search")}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <Search className="h-8 w-8 text-primary" />
            <span className="font-semibold text-sm">Search</span>
            <span className="text-xs text-muted-foreground text-center">
              Find by name
            </span>
          </button>
        </div>
        {/* <GateSessionStats /> */}
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

  if (mode === "search") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setMode("choose")}>
            ← Back
          </Button>
          <h2 className="text-lg font-semibold">Search Guest</h2>
        </div>
        <GateSearch onCheckin={async (code) => {
          await handleCode(code);
        }} />
      </div>
    );
  }
}