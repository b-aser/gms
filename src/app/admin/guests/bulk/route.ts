import { db } from "@/db";
import { guests } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-session";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const bulkDeleteSchema = z.object({
    ids: z.array(z.string().uuid()).min(1).max(500),
})

export async function DELETE(req: NextRequest) {
    try {
        await requireAdmin();

        const body = await req.json();
        const parsed = bulkDeleteSchema.safeParse(body);

        if(!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const { ids } = parsed.data;

        // Only delete gueata who are Not Checked-in
        const deleted = await db
        .delete(guests)
        .where(
            and(
                inArray(guests.id, ids),
                eq(guests.checkedIn, false),
            )
        )
        .returning({id: guests.id});

        const skipped = ids.length - deleted.length;

        return NextResponse.json({
            deleted: deleted.length,
            skipped,
        })
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}