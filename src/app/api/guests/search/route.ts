import { db } from "@/db";
import { guests } from "@/db/schema";
import { requireAuth } from "@/lib/auth-session";
import { ilike, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await requireAuth();

        const { searchParams} = new URL(req.url);
        const q = searchParams.get("q") ?? "";

        if (q.length < 2) {
            return NextResponse.json([]);
        }

        const results = await db
        .select({
            id: guests.id,
            name: guests.name,
            phone: guests.phone,
            partySize: guests.partySize,
            inviteCode: guests.inviteCode,
            checkedIn: guests.checkedIn,
            checkedInAt: guests.checkedInAt,
            notes: guests.notes,
        })
        .from(guests)
        .where(
            or(
                ilike(guests.name, `%${q}%`),
                ilike(guests.phone, `%${q}%`),
            )
        )
        .limit(8);

        return NextResponse.json(results);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}