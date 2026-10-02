"use client";
import { useEffect } from "react";
import { useStore } from "@/store";

/** Global timer that advances any running simulated analysis, so it keeps going while you navigate. */
export function SimDriver() {
  useEffect(() => {
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = Math.min(now - last, 1000);
      last = now;
      if (useStore.persist.hasHydrated()) useStore.getState().tick(dt);
    }, 150);
    return () => clearInterval(id);
  }, []);
  return null;
}
