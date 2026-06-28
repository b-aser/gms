"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
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
import { Trash2, Loader2 } from "lucide-react";

export default function StaffActions({
  staffId,
  staffName,
}: {
  staffId: string;
  staffName: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (session?.user.id === staffId) {
      setError("Cannot delete your own account");
      return;
    }

    setLoading(true);
    setError("");

    const { error: removeError } = await authClient.admin.removeUser({
      userId: staffId,
    });

    if (removeError) {
      setError(removeError.message || "Failed to delete staff account");
      setLoading(false);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="text-destructive/80 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Staff Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-semibold">{staffName}</span>? They will
            immediately lose access to the gate check-in system.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Remove Staff"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
