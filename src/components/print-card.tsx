"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Heart, Users } from "lucide-react";

type Guest = {
  id: string;
  name: string;
  partySize: number;
  inviteCode: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

export default function PrintCard({ guest }: { guest: Guest }) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(guest.inviteCode, {
      width: 180,
      margin: 2,
      color: {
        dark: "#1A1A1A",
        light: "#F5F5F5",
      },
      errorCorrectionLevel: "H",
    }).then(setQrDataUrl);
  }, [guest.inviteCode]);

  useEffect(() => {
    if (qrDataUrl) {
      setTimeout(() => window.print(), 1000);
    }
  }, [qrDataUrl]);

  const partyLabel =
    guest.partySize === 1
      ? "1 Guest"
      : guest.partySize === 2
        ? "2 Guests (+1)"
        : `${guest.partySize} Guests (Family)`;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .print-card {
            width: 148mm;
            min-height: 210mm;
            page-break-after: always;
          }
        }

        @media screen {
          body { background: #f4f4f5; }
          .print-card {
            width: 148mm;
            min-height: 210mm;
          }
        }
      `}</style>

      {/* Screen toolbar — hidden on print */}
      <div className="no-print flex items-center justify-between px-6 py-4 bg-white border-b">
        <p className="text-sm text-muted-foreground">
          Print preview for{" "}
          <span className="font-medium text-foreground">{guest.name}</span>
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            ← Back
          </button>
          <button
            onClick={() => window.print()}
            className="bg-primary text-primary-foreground text-sm px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Print
          </button>
        </div>
      </div>

      {/* Card — centered on screen, full bleed on print */}
      <div className="flex items-start justify-center min-h-screen py-10 no-print-wrapper">
        <div className="print-card bg-white shadow-lg rounded-xl overflow-hidden flex flex-col">
          {/* Header band */}
          <div className="bg-rose-500 px-8 py-6 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="h-5 w-5 fill-white" />
              <span className="text-sm font-medium uppercase tracking-widest opacity-90">
                Wedding Invitation
              </span>
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <p className="text-xs opacity-75 mt-1">
              Please present this card at the entrance
            </p>
          </div>

          {/* Guest name */}
          <div className="px-8 pt-8 pb-4 text-center border-b">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
              This invitation is reserved for
            </p>
            <h1 className="text-3xl font-bold text-gray-900">{guest.name}</h1>
            <div className="flex items-center justify-center gap-2 mt-3 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">{partyLabel}</span>
            </div>
          </div>

          {/* QR + Code */}
          <div className="flex flex-col items-center px-8 py-8 gap-5 flex-1">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code"
                width={180}
                height={180}
                className="rounded-lg border"
              />
            ) : (
              <div className="w-[180px] h-[180px] bg-muted rounded-lg animate-pulse" />
            )}

            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Invite Code
              </p>
              <p className="text-3xl font-mono font-bold tracking-widest text-gray-900">
                {guest.inviteCode}
              </p>
              <p className="text-xs text-muted-foreground">
                Scan the QR or provide this code at the gate
              </p>
            </div>

            {guest.notes && (
              <div className="w-full bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-center">
                <p className="text-xs text-amber-700 font-medium">Note</p>
                <p className="text-sm text-amber-800 mt-0.5">{guest.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-muted/30 border-t text-center">
            <p className="text-xs text-muted-foreground">
              This invitation is personal and non-transferable
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
