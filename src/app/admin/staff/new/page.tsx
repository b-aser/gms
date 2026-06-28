"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Eye, EyeOff, RefreshCw } from "lucide-react";
import Link from "next/link";

const PASSWORD_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function generateStaffPassword(length = 12): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => PASSWORD_CHARS[byte % PASSWORD_CHARS.length]).join(
    "",
  );
}

export default function NewStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleGeneratePassword() {
    setForm((prev) => ({ ...prev, password: generateStaffPassword() }));
    setShowPassword(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: createError } = await authClient.admin.createUser({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    if (createError) {
      setError(createError.message || "Failed to create staff account");
      setLoading(false);
      return;
    }

    router.push("/admin/staff");
    router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/staff">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Add Gate Staff</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Account</CardTitle>
          <CardDescription>
            Create a login for a gate staff member. Share the email and password
            with them directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Abebe Kebede"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tigist@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password">Password *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePassword}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Generate
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this password with the staff member directly.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Staff Account"
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/staff">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
