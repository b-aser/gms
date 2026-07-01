"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart2, Loader2 } from "lucide-react";

type Bucket = {
  time: string;
  label: string;
  invites: number;
  attendees: number;
};

const chartConfig = {
  attendees: {
    label: "Attendees",
    color: "hsl(var(--primary))",
  },
  invites: {
    label: "Invites",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig;

export default function CheckinChart() {
  const [data, setData] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/stats/timeline");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Check-in Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Check-in Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <BarChart2 className="h-10 w-10 opacity-20" />
          <p className="text-sm font-medium">No check-ins yet</p>
          <p className="text-xs">
            Chart will appear once guests start checking in
          </p>
        </CardContent>
      </Card>
    );
  }

  const peak = data.reduce(
    (max, b) => (b.attendees > max.attendees ? b : max),
    data[0]
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Check-in Timeline
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              Peak:{" "}
              <span className="font-semibold text-foreground">
                {peak.label}
              </span>{" "}
              ({peak.attendees} attendees)
            </span>
            <span className="opacity-50">Updates every 30s</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            barCategoryGap="30%"
            barGap={2}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend
              iconType="square"
              iconSize={10}
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            />
            <Bar
              dataKey="attendees"
              fill="var(--color-attendees)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="invites"
              fill="var(--color-invites)"
              radius={[4, 4, 0, 0]}
              opacity={0.5}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
