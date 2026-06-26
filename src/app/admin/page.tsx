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
      <div className="flex items-center justify-between">
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
      <Card>
        <CardContent className="px-2">
          {allGuests.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No guests yet</p>
              <p className="text-sm mt-1">
                Add your first guest to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Invite Code</TableHead>
                  <TableHead>Party Size</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">{guest.name}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                        {guest.inviteCode}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {guest.partySize === 1
                          ? "Solo"
                          : guest.partySize === 2
                            ? "+1"
                            : `Family (${guest.partySize})`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {guest.phone || guest.email || "—"}
                    </TableCell>
                    <TableCell>
                      {guest.checkedIn ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Checked In
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="link" size="sm">
                        <Link href={`/admin/guests/${guest.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
