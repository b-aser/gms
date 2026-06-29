"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

type Props = {
  selectedIds: string[];
  checkedInIds: string[];
  onSuccess: () => void;
  onClear: () => void;
};

export default function BulkDelete({
  selectedIds,
  checkedInIds,
  onSuccess,
  onClear,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkedInSelected = selectedIds.filter((id) =>
    checkedInIds.includes(id),
  );
  const willDelete = selectedIds.length - checkedInSelected.length;
  const willSkip = checkedInSelected.length;

  async function handleDelete() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/guests/bulk", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: selectedIds,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to delete guests");
      setLoading(false);
      return;
    }

    setOpen(false);
    onSuccess();
    onClear();
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Delete {selectedIds.length} guest{selectedIds.length !== 1 ? "s" : ""}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Guests</DialogTitle>
            <DialogDescription>
              You have slelected{" "}
              <span className="font-semibold">
                {selectedIds.length} guest{selectedIds.length !== 1 ? "s" : ""}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="border p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Will be deleted</span>
                <span className="font-semibold text-destructive">
                  {willDelete} guest{willDelete !== 1 ? "s" : ""}
                </span>
              </div>
              {willSkip > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Skipped (already checked in)
                  </span>
                  <span className="font-semibold text-amber-600">
                    {willSkip} guest{willSkip !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            {willSkip > 0 && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                <p>
                  Checked-in guests are protected from bulk deletion. Remove
                  them individually if needed.
                </p>
              </div>
            )}

            {willSkip === 0 && (
              <div className="flex items-start gap-2 bg-muted p-3 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  All selected guests are in and will be skipped. Nothing will
                  be deleted.
                </p>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading || willDelete === 0}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `Delete ${willDelete} Guest${willDelete !== 1 ? "s" : ""}`
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
