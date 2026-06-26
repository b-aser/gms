import { db } from "@/db";
import { guests } from "@/db/schema";
import { eq } from "drizzle-orm";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I

function generateCode(): string {
    let code = "WED-";
    for (let i = 0; i < 4; i++) {
        code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return code;
}

export async function generateUniqueInviteCode(): Promise<string> {
    let code = generateCode();
    let attempts = 0;

    while (attempts < 10) {
        const existing = await db
        .select({ id: guests.id})
        .from(guests)
        .where(eq(guests.inviteCode, code))
        .limit(1);

        if (existing.length === 0) return code;

        code = generateCode();
        attempts++;
    }

    throw new Error("Failed to generate unique invite code after 10 attempts");
}