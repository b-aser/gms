"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Users, X } from "lucide-react";

type Guest = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  partySize: number;
  inviteCode: string;
  checkedIn: boolean;
  checkedInAt: Date | null;
  notes: string | null;
  createdAt: Date;
};

type StatusFilter = "all" | "pending" | "checked_in";
type SizeFilter = "all" | "solo" | "plus_one" | "family";

export default function GuestTable({ guests }: { guests: Guest[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("all");

  const filtered = useMemo(() => {
    return guests.filter((g) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          g.name.toLowerCase().includes(q) ||
          g.phone?.toLowerCase().includes(q) ||
          g.email?.toLowerCase().includes(q) ||
          g.inviteCode.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Status
      if (statusFilter === "pending" && g.checkedIn) return false;
      if (statusFilter === "checked_in" && !g.checkedIn) return false;

      // Size
      if (sizeFilter === "solo" && g.partySize !== 1) return false;
      if (sizeFilter === "plus_one" && g.partySize !== 2) return false;
      if (sizeFilter === "family" && g.partySize < 3) return false;

      return true;
    });
  }, [guests, search, statusFilter, sizeFilter]);

  const hasFilters =
    search.trim() !== "" || statusFilter !== "all" || sizeFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setSizeFilter("all");
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, email, or code ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="checked_in">Checked In</SelectItem>
          </SelectContent>
        </Select>

        <Select
        value={sizeFilter}
        onValueChange={(v) => setSizeFilter(v as SizeFilter)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="PartySize" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="solo">Solo</SelectItem>
            <SelectItem value="plus_one">+1</SelectItem>
            <SelectItem value="family">Family (3+)</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Result count */}
      <Card>
        <CardContent className="p-0">
          {guests.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30"/>
              <p className="font-medium">No guests yet</p>
              <p className="text-sm mt-1">Add guests to get started</p>
            </div>
          ): filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No guests match your filters</p>
              <button
                onClick={clearFilters}
                className="text-sm underline mt-1 hover:text-foreground"
              >
                Clear filters
              </button>
            </div>
          ): (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Invite Code</TableHead>
                <TableHead>Party Size</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                      {guest.inviteCode}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {guest.partySize === 1
                        ? "Solo"
                        : guest.partySize === 2
                        ? "+1"
                        : `Family (${guest.partySize})`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {guest.phone || guest.email || "—"}
                  </TableCell>
                  <TableCell>
                    {guest.checkedIn ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Checked In
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/guests/${guest.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
