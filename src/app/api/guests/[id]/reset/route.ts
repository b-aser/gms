import { db } from "@/db";
import { guests } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-session";
import { error } from "console";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { checkinLogs } from "@/db/schema";
import { getSession } from "@/lib/auth-session";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const [guest] = await db
      .select()
      .from(guests)
      .where(eq(guests.id, id))
      .limit(1);

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    if (!guest.checkedIn) {
      return NextResponse.json(
        {
          error: "Guest is not checked in",
        },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(guests)
      .set({
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,
      })
      .where(eq(guests.id, id))
      .returning();

    // Write activity log
    const session = await getSession();
    await db.insert(checkinLogs).values({
      guestId: guest.id,
      guestName: guest.name,
      inviteCode: guest.inviteCode,
      partySize: guest.partySize,
      action: "reset",
      performedBy: session?.user.id ?? null,
      performedByName: session?.user.name ?? "Admin",
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
