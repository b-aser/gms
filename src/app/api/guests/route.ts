import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { guests } from "@/db/schema";
import { requireAdmin, requireAuth } from "@/lib/auth-session";
import { generateUniqueInviteCode } from "@/lib/invite-code";
import { z } from "zod";
import { desc } from "drizzle-orm";

const createGuestSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  partySize: z.number().int().min(1).max(20).default(1),
  notes: z.string().optional(),
});

// GET /api/guests - admin only
export async function GET() {
  try {
    await requireAdmin();

    const allGuests = await db
      .select()
      .from(guests)
      .orderBy(desc(guests.createdAt));

    return NextResponse.json(allGuests);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/guests - admin only
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = createGuestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, phone, email, partySize, notes } = parsed.data;
    const inviteCode = await generateUniqueInviteCode();

    const [guest] = await db
      .insert(guests)
      .values({
        name,
        phone: phone || null,
        email: email || null,
        partySize,
        inviteCode,
        notes,
      })
      .returning();

    return NextResponse.json(guest, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
