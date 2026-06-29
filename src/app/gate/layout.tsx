import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import GateNav from "@/components/gate-nav";
import OfflineBanner from "@/components/offline-banner";

export default async function GateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-muted/40">
      <GateNav user={session.user} />
      <OfflineBanner />
      <main className="container mx-auto px-4 py-8 max-w-lg">
        {children}
      </main>
    </div>
  );
}