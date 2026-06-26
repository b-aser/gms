import { db } from "@/db";
import { guests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import EditGuestForm from "@/components/edit-guest-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function EditGuestPage({ params }: Params) {
  const { id } = await params;
  const [guest] = await db
    .select()
    .from(guests)
    .where(eq(guests.id, id))
    .limit(1);

  if (!guest) notFound();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/guests/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Guest</h1>
      </div>
      <EditGuestForm guest={guest} />
    </div>
  );
}
