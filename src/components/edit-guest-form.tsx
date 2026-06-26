"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type Guest = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  partySize: number;
  inviteCode: string;
  checkedIn: boolean;
  notes: string | null;
};

export default function EditGuestForm({ guest }: { guest: Guest }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: guest.name,
    phone: guest.phone ?? "",
    email: guest.email ?? "",
    partySize: guest.partySize,
    notes: guest.notes ?? "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "partySize" ? parseInt(value) || 1 : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/guests/${guest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to update guest");
      setLoading(false);
      return;
    }

    router.push(`/admin/guests/${guest.id}`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest Information</CardTitle>
        <CardDescription className="flex items-center gap-2">
          Invite code{" "}
          <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
            {guest.inviteCode}
          </code>{" "}
          cannot be changed.
          {guest.checkedIn && (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 ml-1">
              Checked In
            </Badge>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+251 9xx xxx xxxx"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="guest@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partySize">Party Size</Label>
            <Input
              id="partySize"
              name="partySize"
              type="number"
              min={1}
              max={20}
              value={form.partySize}
              onChange={handleChange}
            />
            <p className="text-xs text-muted-foreground">
              1 = solo · 2 = +1 · 3 or more = family
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any special notes..."
              value={form.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/guests/${guest.id}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}