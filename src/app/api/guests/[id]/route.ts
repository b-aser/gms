import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { guests } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-session";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateGuestSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  partySize: z.number().int().min(1).max(20).optional(),
  notes: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/guests/:id - admin only
export async function GET(_req: NextRequest, { params }: Params) {
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

    return NextResponse.json(guest);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// PATCH /api/guests/:id - admin only
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const parsed = updateGuestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(guests)
      .set(parsed.data)
      .where(eq(guests.id, id))
      .returning();

    if (!updated) {
      {
        return NextResponse.json({ error: "Guest not found" }, { status: 404 });
      }
      return NextResponse.json(updated);
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// DELETE /api/guests/:id - admin only
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const [deleted] = await db
      .delete(guests)
      .where(eq(guests.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
