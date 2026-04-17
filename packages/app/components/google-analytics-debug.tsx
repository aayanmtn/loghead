"use client";

import { useEffect } from "react";

export function GoogleAnalyticsDebug() {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      // Set debug_mode to true for all events
      (window as any).gtag("config", process.env.NEXT_PUBLIC_GA_ID, {
        debug_mode: true,
      });
      console.log("GA4 Debug Mode Enabled");
    }
  }, []);

  return null;
}
