import { Suspense } from "react";
import { AuthShell } from "@/components/layout/auth";
import { DemoEntry } from "@/components/features/demo-entry";
export default function Page() { return <AuthShell><Suspense><DemoEntry /></Suspense></AuthShell>; }
