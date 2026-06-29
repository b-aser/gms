import { db } from "@/db";
import { guests } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-session";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await requireAdmin();

        const allGuests = await db
        .select().from(guests)

        const totalInvites = allGuests.length;
        const totalAttendees = allGuests.reduce((sum, g) => sum + g.partySize, 0);
        const checkedInInvites = allGuests.filter((g) => g.checkedIn).length;
        const checkedInAttendees = allGuests.filter((g) => g.checkedIn).reduce((sum, g) => sum + g.partySize, 0);

        return NextResponse.json({
            totalInvites,
            totalAttendees,
            checkedInInvites,
            checkedInAttendees,
            pendingInvites: totalInvites - checkedInInvites,
            pendingAttendees: totalAttendees - checkedInAttendees,
        });
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}