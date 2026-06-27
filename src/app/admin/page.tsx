import { db } from "@/db";
import { guests } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Users, CheckCircle, Clock } from "lucide-react";
import ImportButton from "@/components/import-button";
import GuestTable from "@/components/guest-table";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const allGuests = await db
    .select()
    .from(guests)
    .orderBy(desc(guests.createdAt));

  const totalGuests = allGuests.length;
  const totalAttendees = allGuests.reduce((sum, g) => sum + g.partySize, 0);
  const checkedIn = allGuests.filter((g) => g.checkedIn).length;
  const checkedInAttendees = allGuests
    .filter((g) => g.checkedIn)
    .reduce((sum, g) => sum + g.partySize, 0);

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
          <ImportButton />
          <Button asChild>
            <Link href="/admin/guests/new">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Guest
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalGuests}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Attendees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalAttendees}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Checked In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{checkedIn}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awaiting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-2xl font-bold">
                {checkedInAttendees}/{totalAttendees}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

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
