"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Undo2, Loader2, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

type RecentGuest = {
  id: string;
  name: string;
  partySize: number;
  inviteCode: string;
  checkedInAt: string;
  checkedInBy: string | null;
  staffName: string | null;
};

export default function RecentCheckins() {
  const [checkins, setCheckins] = useState<RecentGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [undoing, setUndoing] = useState(false);
  const [undoError, setUndoError] = useState("");
  const [undoSuccess, setUndoSuccess] = useState("");

  const fetchRecent = useCallback(async () => {
    try {
      const res = await fetch("/api/checkin/recent");
      if (res.ok) {
        const data = await res.json();
        setCheckins(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecent();
    const interval = setInterval(fetchRecent, 10_000);
    return () => clearInterval(interval);
  }, [fetchRecent]);

  async function handleUndo() {
    setUndoing(true);
    setUndoError("");
    setUndoSuccess("");

    const res = await fetch("/api/checkin/undo", { method: "POST" });
    const data = await res.json();

    if (res.ok) {
      setUndoSuccess(`Undid check-in for ${data.guest.name}`);
      await fetchRecent();
    } else {
      setUndoError(data.error || "Failed to undo");
    }

    setUndoing(false);

    // Clear messages after 4 seconds
    setTimeout(() => {
      setUndoError("");
      setUndoSuccess("");
    }, 4000);
  }
  const mostRecent = checkins[0];
  const canUndo = (() => {
    if (!mostRecent?.checkedInAt) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(mostRecent.checkedInAt) > fiveMinutesAgo;
  })();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (checkins.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No check-ins yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Check-ins
          </CardTitle>
          <span className="text-sx text-muted-foreground">
            Auto-refreshes every 10s
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Undo feedback */}
        {undoSuccess && (
          <p className="text-sm text-green-600 text-center font-medium">
            {" "}
            ✓ {undoSuccess}
          </p>
        )}
        {undoError && (
          <p className="text-sm text-destructive text-center">{undoError}</p>
        )}

        {checkins.map((guest, index) => {
          const isFirst = index === 0;
          const partyLabel = 
          guest.partySize === 1
          ? "Solo"
          : guest.partySize === 2
          ? "+1"
          : `Family (${guest.partySize})`;


          return (
            <div key={guest.id} className={`flex items-center justify-between gap-3 py-2 ${isFirst ? "border-b pb-3":""}`}>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{guest.name}</p>
                        <Badge variant="secondary" className="text-xs shrink-0">
                            {partyLabel}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(guest.checkedInAt), {
                            addSuffix: true,
                        })}
                        {" · "}
                        {format(new Date(guest.checkedInAt), "HH:mm")}
                    </p>
                </div>

                {isFirst && canUndo && (
                    <Button variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={undoing}
                    className="shrink-0"
                    >
                        {undoing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-ping"/>
                        ):(
                            <>
                            <Undo2 className="h-3.5 w-3.5 mr-1"/>
                            Undo
                            </>
                        )}
                    </Button>
                )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  );
}
