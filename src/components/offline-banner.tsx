"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { WifiOff, Wifi } from "lucide-react";

const PROBE_INTERVAL_MS = 20_000;
const PROBE_TIMEOUT_MS = 5_000;

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

async function probeServer(): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    await fetch("/api/checkin/recent", {
      method: "HEAD",
      cache: "no-store",
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default function OfflineBanner() {
  const browserOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getServerSnapshot
  );
  const [serverReachable, setServerReachable] = useState(true);
  const [showRestored, setShowRestored] = useState(false);
  const wasOfflineRef = useRef(false);
  const restoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOnline = browserOnline && serverReachable;

  useEffect(() => {
    if (!browserOnline) {
      setServerReachable(false);
      return;
    }

    let cancelled = false;

    async function check() {
      const ok = await probeServer();
      if (!cancelled) setServerReachable(ok);
    }

    void check();
    const id = setInterval(() => void check(), PROBE_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [browserOnline]);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      setShowRestored(false);
      if (restoreTimeoutRef.current) {
        clearTimeout(restoreTimeoutRef.current);
        restoreTimeoutRef.current = null;
      }
      return;
    }

    if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setShowRestored(true);
      restoreTimeoutRef.current = setTimeout(() => {
        setShowRestored(false);
        restoreTimeoutRef.current = null;
      }, 4000);
    }

    return () => {
      if (restoreTimeoutRef.current) {
        clearTimeout(restoreTimeoutRef.current);
        restoreTimeoutRef.current = null;
      }
    };
  }, [isOnline]);

  if (!isOnline) {
    return (
      <div
        role="alert"
        className="sticky top-16 z-40 bg-destructive text-destructive-foreground px-4 py-3"
      >
        <div className="container mx-auto max-w-lg flex items-center gap-3">
          <WifiOff className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">You are offline</p>
            <p className="text-xs opacity-90 mt-0.5">
              Check-ins cannot be processed until connection is restored. Do
              not scan or enter codes until this banner disappears.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div
        role="status"
        className="sticky top-16 z-40 bg-green-600 text-white px-4 py-3"
      >
        <div className="container mx-auto max-w-lg flex items-center gap-3">
          <Wifi className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Connection restored</p>
            <p className="text-xs opacity-90 mt-0.5">
              You are back online. Check-ins can be processed normally.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
