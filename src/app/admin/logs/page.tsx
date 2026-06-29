import ActivityLog from "@/components/activity-log";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
    const staff = await db
    .select({id:users.id, name:users.name})
    .from(users)
    .where(eq(users.role, "gate_staff"))

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Activity Logs</h1>
                <p className="text-muted-foreground mt-1" >
                    Full audit trail of every check-in and reset
                </p>
            </div>
            <ActivityLog staff={staff} />
        </div>
    )
}