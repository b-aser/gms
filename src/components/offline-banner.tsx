"use client";

import { Wifi } from "lucide-react";
import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showRestored, setShowRestored] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Avoid SSR mismatches
    setMounted(true);
    setIsOnline(navigator.onLine);

    function handleOffline() {
      setIsOnline(false);
      setShowRestored(false);
    }

    function handleOnline() {
      setIsOnline(true);
      setShowRestored(true);
      setTimeout(() => setShowRestored(false), 3000);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!mounted) return null;

  if (!isOnline) {
    return (
      <div className="bg-green-600 text-white px-4 py-3">
        <div className="container mx-auto max-w-lg flex items-center gap-3">
          <Wifi className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">You're offline</p>
            <p className="text-xs opacity-90 mt-0.5">
              Check-ins cannot be processed until connection is restored. Do not
              scan or enter codes until this banner disappears.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div className="bg-green-600 text-white px-4 py-3">
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
