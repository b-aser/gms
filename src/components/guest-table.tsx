import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

import { Button } from "./ui/button";

import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Users } from "lucide-react";
import { guests } from "@/db/schema";

export default function GuestTable({
  allGuests,
}: {
  allGuests: (typeof guests.$inferSelect)[];
}) {
  return (
    <Card>
      <CardContent className="px-2">
        {allGuests.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No guests yet</p>
            <p className="text-sm mt-1">Add your first guest to get started</p>
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
  );
}

// TODO: Add a filter to the table to filter by name, invite code, party size, contact, status
