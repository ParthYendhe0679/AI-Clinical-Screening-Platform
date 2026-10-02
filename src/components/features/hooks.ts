"use client";
import * as React from "react";
import { useStore } from "@/store";

/** True once persisted demo state has been loaded from localStorage. */
export function useHydratedFlag() {
  const [h, setH] = React.useState(() => useStore.persist.hasHydrated());
  React.useEffect(() => {
    if (useStore.persist.hasHydrated()) setH(true);
    return useStore.persist.onFinishHydration(() => setH(true));
  }, []);
  return h;
}
