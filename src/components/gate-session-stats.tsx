"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle2 } from "lucide-react";

const SESSION_KEY = "gate_session_stats";

type SessionStats = {
    guestsCheckedIn: number;
    attendeesCheckedIn: number;
}

function loadStats(): SessionStats {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return {guestsCheckedIn: 0, attendeesCheckedIn: 0};
        return JSON.parse(raw);
    } catch {
        return {guestsCheckedIn: 0, attendeesCheckedIn: 0};
    }
}

function saveStats(stats: SessionStats) {
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(stats));
    } catch  {
        // sessionStorage unavailabe - fail silently
    }
}


export function incrementSessionStats(partySize:number) {
    const current = loadStats();
    const updated = {
        guestsCheckedIn: current.guestsCheckedIn + 1,
        attendeesCheckedIn: current.attendeesCheckedIn + partySize,
    };
    saveStats(updated);
    // Dispatch event so the component re-reads without a prop
    window.dispatchEvent(new Event("session-stats-updated"));
}

export function decrementSessionStats(partySize:number) {
    const current = loadStats();
    const updated = {
        guestsCheckedIn: current.guestsCheckedIn - 1,
        attendeesCheckedIn: current.attendeesCheckedIn - partySize,
    };
    saveStats(updated);
    window.dispatchEvent(new Event("session-stats-updated"));
}

export default function GateSessionStats() {
    const [stats,setStats] = useState<SessionStats>({
        guestsCheckedIn: 0,
        attendeesCheckedIn: 0,
    })
    const [mounted,setMounted] = useState(false);

    function refresh() {
        setStats(loadStats());
    }

    useEffect(()=>{
        setMounted(true);
        refresh();
        window.addEventListener("session-stats-updated",refresh);
        return ()=>window.removeEventListener("session-stats-updated",refresh);
    }, [])

    if (!mounted || stats.guestsCheckedIn === 0 ) return null;

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>This session</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-lg text-primary">
                                {stats.guestsCheckedIn}
                            </span>
                            <span className="text-muted-foreground">
                                invite{stats.guestsCheckedIn !== 1 ? "s" : ""}
                            </span>
                        </div>

                        <div className="h-4 w-px bg-border"/>

                        <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-bold text-lg text-primary">
                                {stats.attendeesCheckedIn}
                            </span>
                            <span className="text-muted-foreground">
                                attendee{stats.attendeesCheckedIn !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}