"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, Users } from "lucide-react";
import { format } from "date-fns";
import {
  incrementSessionStats,
  decrementSessionStats,
} from "@/components/gate-session-stats";
import { useEffect } from "react";

type ResultStatus = "success" | "already_checked_in" | "invalid";

type Props = {
  result: {
    status: ResultStatus;
    guest?: {
      name: string;
      partySize: number;
      checkedInAt: string;
      notes?: string;
    };
  };
  onReset: () => void;
};

export default function CheckinResult({ result, onReset }: Props) {
  const { status, guest } = result;

  const config = {
    success: {
      icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
      bg: "bg-green-50 border-green-200",
      title: "Admit Guest",
      titleColor: "text-green-700",
    },
    already_checked_in: {
      icon: <AlertCircle className="h-16 w-16 text-amber-500" />,
      bg: "bg-amber-50 border-amber-200",
      title: "Already Checked In",
      titleColor: "text-amber-700",
    },
    invalid: {
      icon: <XCircle className="h-16 w-16 text-red-500" />,
      bg: "bg-red-50 border-red-200",
      title: "Invalid Code",
      titleColor: "text-red-700",
    },
  }[status];

  const partyLabel =
    guest?.partySize === 1
      ? "1 person"
      : guest?.partySize === 2
        ? "2 people (+1)"
        : `${guest?.partySize} people (family)`;

  useEffect(() => {
    if (status === "success" && guest?.partySize) {
      incrementSessionStats(guest.partySize);
    }
  }, [status, guest?.partySize]);

  return (
    <div className="space-y-6 pt-4">
      <Card className={`border-2 ${config.bg}`}>
        <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-4">
          {config.icon}

          <div className="space-y-1">
            <h2 className={`text-2xl font-bold ${config.titleColor}`}>
              {config.title}
            </h2>

            {guest && (
              <>
                <p className="text-xl font-semibold mt-2">{guest.name}</p>

                <div className="flex items-center justify-center gap-2 text-muted-foreground mt-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{partyLabel}</span>
                </div>

                {guest.notes && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    Note: {guest.notes}
                  </p>
                )}

                {status === "already_checked_in" && guest.checkedInAt && (
                  <p className="text-sm text-amber-600 mt-2">
                    Checked in at{" "}
                    {format(new Date(guest.checkedInAt), "HH:mm, dd MMM")}
                  </p>
                )}
              </>
            )}

            {status === "invalid" && (
              <p className="text-sm text-muted-foreground mt-2">
                This code does not match any guest. Check and try again.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={onReset}>
        Scan Next Guest
      </Button>
    </div>
  );
}
