"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Heart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

type User = {
  name: string;
  email: string;
};

const navLinks = [
  { href: "/admin", label: "Guests" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/logs", label: "Logs" },
];

export default function AdminNav({ user }: { user: User }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-lg">
            <Heart className="h-5 w-5 text-rose-500" />
            Wedding Admin
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user.name}
          </span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}