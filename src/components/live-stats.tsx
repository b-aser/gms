"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, Clock, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

type Stats = {
  totalInvites: number;
  totalAttendees: number;
  checkedInInvites: number;
  checkedInAttendees: number;
  pendingInvites: number;
  pendingAttendees: number;
};

function StatCard({
  title,
  value,
  sub,
  icon,
  highlight,
}: {
  title: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  highlight?: "green" | "amber";
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              highlight === "green"
                ? "text-green-500"
                : highlight === "amber"
                  ? "text-amber-500"
                  : "text-muted-foreground",
            )}
          >
            {icon}
          </span>
          <span className="text-2xl font-bold">{value}</span>
        </div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function LiveStats({ initial }: { initial: Stats }) {
  const [stats, setStats] = useState<Stats>(initial);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [live, setLive] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch {
      // silently fail - keep showing last known stats
    }
  }, []);

  useEffect(() => {
    // Start live after first interval
    const timeout = setTimeout(() => setLive(true), 15_000);
    const interval = setInterval(fetchStats, 15_000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchStats]);

  const checkinPercent =
    stats.totalAttendees > 0
      ? Math.round((stats.checkedInAttendees / stats.totalAttendees) * 100)
      : 0;

  return (
    <div className="space-y-3">
      {/* Live Indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Overview</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              live ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
            }`}
          />
          {live
            ? `Live · updated ${lastUpdated.toLocaleTimeString()}`
            : "Connecting..."}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Invites"
          value={stats.totalInvites}
          sub={`${stats.totalAttendees} attendees`}
          icon={<Ticket className="h-4 w-4" />}
        />
        <StatCard
          title="Checked In"
          value={stats.checkedInInvites}
          sub={`${stats.checkedInAttendees} attendees · ${checkinPercent}%`}
          icon={<CheckCircle className="h-4 w-4" />}
          highlight="green"
        />
        <StatCard
          title="Pending"
          value={stats.pendingInvites}
          sub={`${stats.pendingAttendees} attendees`}
          icon={<Clock className="h-4 w-4" />}
          highlight="amber"
        />
        <StatCard
          title="Total Attendees"
          value={stats.totalAttendees}
          sub={`across ${stats.totalInvites} invites`}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Progress Bar */}
      {stats.totalAttendees > 0 && (
        <div className="space-y-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{width: `${checkinPercent}%`}}
                />
            </div>
            <p className="text-xs text-muted-foreground text-right">
                {checkinPercent}% checked in
            </p>
        </div>
      )}
    </div>
  );
}
