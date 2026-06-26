import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";

export default function GuestNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
      <UserX className="h-12 w-12 text-muted-foreground opacity-40" />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Guest not found</h2>
        <p className="text-muted-foreground text-sm">
          This guest may have been deleted.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/admin">Back to Guest List</Link>
      </Button>
    </div>
  );
}