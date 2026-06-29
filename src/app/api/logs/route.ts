import { db } from "@/db";
import { checkinLogs } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-session";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const staffId = searchParams.get("staff") ?? "";
    const dateFrom = searchParams.get("from") ?? "";
    const dateTo = searchParams.get("to") ?? "";
    const pageSize = 20;

    const conditions = [];

    if (staffId && staffId !== "all") {
      conditions.push(eq(checkinLogs.performedBy, staffId));
    }

    if (dateFrom) {
      conditions.push(gte(checkinLogs.createdAt, new Date(dateFrom)));
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      conditions.push(lte(checkinLogs.createdAt, to));
    }

    const logs = await db
      .select()
      .from(checkinLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(checkinLogs.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const total = await db.$count(
        checkinLogs,
        conditions.length > 0 ? and(...conditions) : undefined
    )

    return NextResponse.json({
        logs,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    })
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
