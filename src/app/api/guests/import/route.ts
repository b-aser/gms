import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { guests } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-session";
import { generateUniqueInviteCode } from "@/lib/invite-code";
import { z } from "zod";
import { error } from "console";

const importSchema = z.object({
  guests: z
    .array(
      z.object({
        name: z.string().min(1),
        phone: z.string().optional().default(""),
        email: z.string().optional().default(""),
        partySize: z.number().int().min(1).max(10).default(1),
        notes: z.string().optional().default(""),
      }),
    )
    .min(1)
    .max(500),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = importSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const rows = parsed.data.guests;
    const inserted: string[] = [];
    const skipped: string[] = [];

    // Insert one by one to generate unique invite codes safely
    for (const row of rows) {
      try {
        const inviteCode = await generateUniqueInviteCode();
        await db.insert(guests).values({
          name: row.name,
          phone: row.phone || null,
          email: row.email || null,
          partySize: row.partySize,
          inviteCode,
          notes: row.notes || null,
        });
        inserted.push(row.name);
      } catch {
        skipped.push(row.name);
      }
    }
    return NextResponse.json({
      imported: inserted.length,
      skipped: skipped.length,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
