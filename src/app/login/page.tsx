import { Suspense } from "react";
import { AuthShell, LoginForm } from "@/components/layout/auth";
export default function Page() { return <AuthShell><Suspense><LoginForm /></Suspense></AuthShell>; }
