import { db } from "@/db";
import { guests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PrintCard from "@/components/print-card";

type params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function PrintGuestPage({ params }: params) {
    const { id } = await params;

    const [guest] = await db
    .select()
    .from(guests)
    .where(eq(guests.id, id))
    .limit(1);

    if (!guest) notFound();

    return <PrintCard guest={guest} />
}