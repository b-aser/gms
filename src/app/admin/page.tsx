import { db } from "@/db";
import { guests } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";
import ImportButton from "@/components/import-button";
import GuestTable from "@/components/guest-table";
import ExportButton from "@/components/export-button";
import LiveStats from "@/components/live-stats";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const allGuests = await db
    .select()
    .from(guests)
    .orderBy(desc(guests.createdAt));

  const totalInvites = allGuests.length;
  const totalAttendees = allGuests.reduce((s, g) => s + g.partySize, 0);
  const checkedInInvites = allGuests.filter((g) => g.checkedIn).length;
  const checkedInAttendees = allGuests
    .filter((g) => g.checkedIn)
    .reduce((s, g) => s + g.partySize, 0);

  const initialStats = {
    totalInvites,
    totalAttendees,
    checkedInInvites,
    checkedInAttendees,
    pendingInvites: totalInvites - checkedInInvites,
    pendingAttendees: totalAttendees - checkedInAttendees,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Guests</h1>
          <p className="text-muted-foreground mt-1">
            Manage wedding guest list and invitations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton />
          <ImportButton />
          <Button asChild>
            <Link href="/admin/guests/new">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Guest
            </Link>
          </Button>
        </div>
      </div>

      {/* Live Stats */}
      <LiveStats initial={initialStats} />

      {/* Guest Table */}
      <div className="space-y-4">
        {/* Link to the /guests page */}
        <Button asChild variant="ghost" size="sm" className="justify-end">
          <Link href="/admin/guests">
            <Users className="h-4 w-4 mr-1" />
            View All Guests
          </Link>
        </Button>
        {/* Total guests in this view */}
        <GuestTable guests={allGuests} />
      </div>
    </div>
  );
}
