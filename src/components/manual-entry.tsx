"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ManualEntry({
  onSubmit,
}: {
  onSubmit: (code: string) => void;
}) {
  const [suffix, setSuffix] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (suffix.length < 4) return;
    setLoading(true);
    await onSubmit(`WED-${suffix.trim().toUpperCase()}`);
    setLoading(false);
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="code">Invite Code</Label>
          <div className="flex items-center gap-2">
            <span className="text-xl font-mono font-bold text-muted-foreground shrink-0">
              WED-
            </span>
            <Input
              id="code"
              placeholder="XXXX"
              value={suffix}
              onChange={(e) =>
                setSuffix(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 4)
                )
              }
              className="text-xl font-mono tracking-widest h-14 text-center"
              maxLength={4}
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Enter the 4-character code after WED-
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
          disabled={loading || suffix.length < 4}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Verify Guest"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}