import { GuestActions } from "@/components/guest-actions";
import { QRDisplay } from "@/components/qr-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { guests, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [guest] = await db
    .select()
    .from(guests)
    .where(eq(guests.id, id))
    .limit(1);

  if (!guest) notFound();

  let checkedInByName: string | null = null;
  if (guest.checkedInBy) {
    const [staffUser] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, guest.checkedInBy))
      .limit(1);
    checkedInByName = staffUser?.name ?? null;
  }

  const partyLabel =
    guest.partySize === 1
      ? "Solo"
      : guest.partySize === 2
        ? "+1"
        : `Family (${guest.partySize})`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{guest.name}</h1>
        {guest.checkedIn ? (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Checked In
          </Badge>
        ) : (
          <Badge variant="outline">Pending</Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Guest Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Guest Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Row label="Name" value={guest.name} />
            <Row label="Party Size" value={partyLabel} />
            <Row label="Phone" value={guest.phone ?? "—"} />
            <Row label="Email" value={guest.email ?? "—"} />
            <Row label="Notes" value={guest.notes ?? "—"} />
            <Row
              label="Added"
              value={format(new Date(guest.createdAt), "dd MMM yyyy, HH:mm")}
            />
            {guest.checkedIn && guest.checkedInAt && (
              <>
                <Row
                  label="Checked in at"
                  value={format(
                    new Date(guest.checkedInAt),
                    "dd MMM yyyy, HH:mm",
                  )}
                />
                <Row label="Checked in by" value={checkedInByName ?? "—"} />
              </>
            )}
          </CardContent>
        </Card>

        {/* QR + Invite Code */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invite Code</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <p className="text-3xl font-mono font-bold tracking-widest">
                {guest.inviteCode}
              </p>
              <p className="text-xs text-muted-foreground">
                Share this code with the guest for manual entry at the gate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <QRDisplay code={guest.inviteCode} name={guest.name} />
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Actions */}
      <GuestActions guestId={guest.id} guestName={guest.name} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
