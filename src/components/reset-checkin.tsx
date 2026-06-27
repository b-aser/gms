"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RotateCcw, Loader2 } from "lucide-react";
import { se } from "date-fns/locale";

export default function ResetCheckin({
  guestId,
  guestName,
}: {
  guestId: string;
  guestName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReset() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/guests/${guestId}/reset`, { method: "POST" });

    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
        const data = await res.json();
        setError(data.error || "Failed to reset checkin");
        setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2"/>
                Reset Check-in
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Reset Check-in</DialogTitle>
                <DialogDescription>
                    This will mark{" "}
                    <span className="font-semibold">{guestName}</span> as not checked in. Their invite code will become valid again at the gate.
                </DialogDescription>
            </DialogHeader>
            
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            <DialogFooter>
                <Button variant="outline" onClick={()=>setOpen(false)}>
                    Cancel
                </Button>
                <Button variant="destructive"
                onClick={handleReset}
                disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Check-in"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}
