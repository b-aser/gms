import { db } from "@/db";
import { checkinLogs, guests } from "@/db/schema";
import { requireAuth } from "@/lib/auth-session";
import { desc, eq, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await requireAuth();

    // Find the most recent check-in done by this staff memeber
    const [last] = await db
      .select()
      .from(guests)
      .where(isNotNull(guests.checkedInAt))
      .orderBy(desc(guests.checkedInAt))
      .limit(1);

    if (!last) {
      return NextResponse.json(
        { error: "No recent check-in to undo" },
        { status: 404 },
      );
    }

    // Only allow undo within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (last.checkedInAt && last.checkedInAt < fiveMinutesAgo) {
      return NextResponse.json(
        { error: "Undo window has expired (5 minutes)" },
        { status: 400 },
      );
    }

    // Only allow staff to undo their own check-ins
    if (last.checkedInBy !== session.user.id) {
      return NextResponse.json(
        { error: "You can only undo your own check-ins" },
        { status: 403 },
      );
    }

    const [updated] = await db
      .update(guests)
      .set({
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,
      })
      .where(eq(guests.id, last.id))
      .returning();

    await db.insert(checkinLogs).values({
      guestId: last.id,
      guestName: last.name,
      inviteCode: last.inviteCode,
      partySize: last.partySize,
      action: "reset",
      performedBy: session.user.id,
      performedByName: session.user.name,
    });

    return NextResponse.json({
      success: true,
      guest: { name: updated.name, inviteCode: updated.inviteCode },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
