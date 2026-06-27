import { db } from "@/db";
import { guests, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-session";
import { desc, eq, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await requireAdmin();

        const recent = await db
        .select({
            id: guests.id,
            name: guests.name,
            partySize: guests.partySize,
            inviteCode: guests.inviteCode,
            checkedInAt: guests.checkedInAt,
            checkedInBy: guests.checkedInBy,
            staffName: users.name,
        })
        .from(guests)
        .leftJoin(users, eq(guests.checkedInBy, users.id))
        .where(isNotNull(guests.checkedInAt))
        .orderBy(desc(guests.checkedInAt))
        .limit(8);

        return NextResponse.json(recent)
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}