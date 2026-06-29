"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type GuestResult = {
  id: string;
  name: string;
  phone: string | null;
  partySize: number;
  inviteCode: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  notes: string | null;
};

type Props = {
  onCheckin: (code: string) => Promise<void>;
};

export default function GateSearch({ onCheckin }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GuestResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<GuestResult | null>(null);
  const [confirming, setConfirming] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/guests/search?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function handleConfirm() {
    if (!selected) return;
    setConfirming(true);
    await onCheckin(selected.inviteCode);
    setConfirming(false);
    setSelected(null);
  }

  const partyLabel = (size: number) =>
    size === 1 ? "Solo" : size === 2 ? "+1 (2 people)" : `Family (${size})`;

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-12 text-base"
          autoFocus
          autoComplete="off"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Results */}
      {query.trim().length >= 2 && !searching && (
        <Card>
          <CardContent className="p-0">
            {results.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No guests found</p>
                <p className="text-xs mt-1">Try a different name or phone</p>
              </div>
            ) : (
              <ul className="divide-y">
                {results.map((guest) => (
                  <li key={guest.id}>
                    <button
                      onClick={() => setSelected(guest)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-medium truncate">{guest.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {guest.phone ?? "No phone"}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {partyLabel(guest.partySize)}
                          </Badge>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                            {guest.inviteCode}
                          </code>
                        </div>
                      </div>

                      <div className="ml-3 shrink-0">
                        {guest.checkedIn ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                            Checked In
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {query.trim().length > 0 && query.trim().length < 2 && (
        <p className="text-xs text-muted-foreground text-center">
          Type at least 2 characters to search
        </p>
      )}

      {/* Confirm dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Check-in</DialogTitle>
            <DialogDescription>
              Review guest details before admitting.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {selected.checkedIn ? (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">
                      Already Checked In
                    </p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      This guest was already admitted. Proceeding will
                      attempt to check them in again.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Ready to Admit</p>
                    <p className="text-sm text-green-700 mt-0.5">
                      Guest is on the list and has not been checked in yet.
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-lg border p-4 space-y-3 text-sm">
                <Row label="Name" value={selected.name} />
                <Row label="Party Size" value={partyLabel(selected.partySize)} />
                <Row
                  label="Phone"
                  value={selected.phone ?? "—"}
                />
                <Row label="Invite Code" value={selected.inviteCode} mono />
                {selected.notes && (
                  <Row label="Notes" value={selected.notes} />
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelected(null)}
              disabled={confirming}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={confirming}>
              {confirming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Check In Guest"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right font-medium ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}