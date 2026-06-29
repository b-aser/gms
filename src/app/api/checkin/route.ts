import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { guests } from "@/db/schema";
import { requireAuth } from "@/lib/auth-session";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { checkinLogs } from "@/db/schema";

const checkinSchema = z.object({
  code: z.string().min(1),
});

// POST /api/checkin
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await req.json();
    const parsed = checkinSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const code = parsed.data.code.trim().toUpperCase();

    const [guest] = await db
      .select()
      .from(guests)
      .where(eq(guests.inviteCode, code))
      .limit(1);

    if (!guest) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 },
      );
    }

    if (guest.checkedIn) {
      return NextResponse.json({
        status: "already_checked_in",
        guest: {
          name: guest.name,
          partySize: guest.partySize,
          checkedInAt: guest.checkedInAt,
        },
      });
    }

    const [updated] = await db
      .update(guests)
      .set({
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: session.user.id,
      })
      .where(eq(guests.id, guest.id))
      .returning();

    // Write activity log
    await db.insert(checkinLogs).values({
      guestId: guest.id,
      guestName: guest.name,
      inviteCode: guest.inviteCode,
      partySize: guest.partySize,
      action: "checkin",
      performedBy: session.user.id,
      performedByName: session.user.name,
    });

    return NextResponse.json({
      status: "success",
      guest: {
        name: updated.name,
        partySize: updated.partySize,
        checkedInAt: updated.checkedInAt,
        notes: updated.notes,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
