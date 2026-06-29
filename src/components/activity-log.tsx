"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

type Log = {
  id: string;
  guestName: string;
  inviteCode: string;
  partySize: number;
  action: string;
  performedByName: string;
  createdAt: string;
};

type StaffMember = {
  id: string;
  name: string;
};

export default function ActivityLog({ staff }: { staff: StaffMember[] }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", page.toString());
    if (staffFilter && staffFilter !== "all") params.set("staff", staffFilter);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);

    const res = await fetch(`/api/logs?${params.toString()}`);
    const data = await res.json();

    setLogs(data.logs ?? []);
    setTotalPages(data.totalPages ?? 1);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, staffFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset to page 1 when staff filter changes
  useEffect(() => {
    setPage(1);
  }, [staffFilter, dateFrom, dateTo]);

  function clearFilters() {
    setStaffFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  const hasFilters = staffFilter !== "all" || dateFrom !== "" || dateTo !== "";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <Select value={staffFilter} onValueChange={setStaffFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Staff" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Staff</SelectItem>
            {staff.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
            placeholder="From"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
            placeholder="To"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}

        <p className="text-sm text-muted-foreground self-center ml-auto">
          {total} event{total !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No activity yet</p>
              <p className="text-sm mt-1">
                Check-ins and resets will appear here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Party Size</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {log.action === "checkin" ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Check-In
                        </Badge>
                      ) : (
                        <Badge className="text-amber-600 border-amber-300 gap-1">
                          <RotateCcw className="h-3 w-3" />
                          Reset
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.guestName}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {log.inviteCode}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <Badge variant="secondary">{log.partySize}</Badge>
                    </TableCell>
                    <TableCell>
                      {log.performedByName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.createdAt), "dd MMM, HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
