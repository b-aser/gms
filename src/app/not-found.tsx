import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 gap-6">
      <Heart className="h-12 w-12 text-rose-400" />
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">
          This page doesn't exist.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </main>
  );
}