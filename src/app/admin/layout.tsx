import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import AdminNav from "@/components/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/gate");

  return (
    <div className="min-h-screen bg-muted/40">
      <AdminNav user={session.user} />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </main>
    </div>
  );
}