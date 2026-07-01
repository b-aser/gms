import { db } from "@/db";
import { guests } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-session";
import { isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await requireAdmin();

        const checkedInGuests = await db
        .select({
            checkedInAt: guests.checkedInAt,
            partySize: guests.partySize,
        })
        .from(guests)
        .where(isNotNull(guests.checkedInAt));

        if (checkedInGuests.length === 0) {
            return NextResponse.json([]);
        }

        // Build 30-min buckets
        const buckets: Record<string, {invites:number; attendees:number}> = {};

        for (const guest of checkedInGuests){
            if (!guest.checkedInAt) continue;

            const date = new Date(guest.checkedInAt);
            // ROund down the nearest 30 minutes
            const minutes = date.getMinutes() < 30 ? 0 : 30;
            date.setMinutes(minutes, 0, 0);

            const key = date.toISOString();

            if (!buckets[key]) {
                buckets[key] = { invites: 0, attendees: 0 };
            }

            buckets[key].invites++;
            buckets[key].attendees += guest.partySize;
        }

        // Sort by time and format for chart
        const sorted = Object.entries(buckets)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .map(([time, data]) => ({
            time,
            label: new Date(time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            invites: data.invites,
            attendees: data.attendees,
        }));

        return NextResponse.json(sorted);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}