"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function ExportButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);

    try {
      const res = await fetch("/api/guests");
      const guests = await res.json();

      const headers = [
        "Name",
        "Invite Code",
        "Party Size",
        "Phone",
        "Email",
        "Status",
        "Checked In At",
        "Notes",
        "Added",
      ];

      const rows = guests.map((g: {
        name: string;
        inviteCode: string;
        partySize: number;
        phone: string | null;
        email: string | null;
        checkedIn: boolean;
        checkedInAt: string | null;
        notes: string | null;
        createdAt: string;
      }) => [
        g.name,
        g.inviteCode,
        g.partySize,
        g.phone ?? "",
        g.email ?? "",
        g.checkedIn ? "Checked In" : "Pending",
        g.checkedInAt
          ? format(new Date(g.checkedInAt), "dd MMM yyyy HH:mm")
          : "",
        g.notes ?? "",
        format(new Date(g.createdAt), "dd MMM yyyy HH:mm"),
      ]);

      const csvContent = [headers, ...rows]
        .map((row) =>
          row.map((cell: string | number | null) => {
            const str = String(cell);
            // Wrap in quotes if contains comma, quote, or newline
            return str.includes(",") || str.includes('"') || str.includes("\n")
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          }).join(",")
        )
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `guests-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </>
      )}
    </Button>
  );
}