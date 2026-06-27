import GuestTable from "@/components/guest-table";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { guests } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GuestsPage() {
  const allGuests = await db
    .select()
    .from(guests)
    .orderBy(desc(guests.createdAt));

  return (
    <div className="space-y-8">
      {/* Back side button to go back to the admin page */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">All Guests</h1>
      </div>
      <div className="">
        <span className="text-xs text-muted-foreground">
          Total guests {allGuests.length}
        </span>
      </div>
      <GuestTable guests={allGuests} />
    </div>
  );
}
