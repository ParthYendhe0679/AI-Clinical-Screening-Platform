"use client";
import { useRouter } from "next/navigation";
import { StethoscopeIcon, UserIcon, ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { useStore } from "@/store";
import { ArtTile, Button, Card } from "@/components/ui";
import { useHydrated } from "@/components/layout/shell";
import { DEMO_DOCTOR_EMAIL, DEMO_PASSWORD, DEMO_PATIENT_EMAIL } from "@/data/seed";

export function DemoEntry() {
  const hydrated = useHydrated(); const router = useRouter();
  const demoLogin = useStore((s) => s.demoLogin); const reset = useStore((s) => s.resetDemo);
  const enter = (r: "patient" | "doctor") => { demoLogin(r); router.push(`/${r}/dashboard`); };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Explore the demo</h1>
      <p className="text-sm text-muted">Pick a role. Both experiences share the same fictional demo data, so a case you analyse as the patient shows up for the doctor.</p>
      <Card variant="sticker" className="p-5"><div className="flex items-start gap-4"><ArtTile icon={UserIcon} tone="mint" /><div className="flex-1"><h2 className="text-lg font-bold">Patient Demo</h2><p className="text-sm text-muted">Ramesh Patil (fictional), helped by daughter Priya. Upload files, watch the analysis, read the report, hear it in Marathi.</p><Button className="mt-3" disabled={!hydrated} onClick={() => enter("patient")}>Enter as patient</Button></div></div></Card>
      <Card variant="sticker" className="p-5"><div className="flex items-start gap-4"><ArtTile icon={StethoscopeIcon} tone="sky" /><div className="flex-1"><h2 className="text-lg font-bold">Doctor Demo</h2><p className="text-sm text-muted">Dr. Anita Mehta (fictional). Review cases, inspect evidence, add notes, record instructions.</p><Button className="mt-3" variant="purple" disabled={!hydrated} onClick={() => enter("doctor")}>Enter as doctor</Button></div></div></Card>
      <div className="rounded-2xl bg-white p-4 text-xs shadow-clay-sm">
        <p className="font-bold">Demo credentials (for the login form)</p>
        <p className="mt-1 font-mono">{DEMO_PATIENT_EMAIL} · {DEMO_PASSWORD}</p><p className="font-mono">{DEMO_DOCTOR_EMAIL} · {DEMO_PASSWORD}</p>
        <Button className="mt-3" size="sm" variant="secondary" onClick={() => { reset(); }}><ArrowCounterClockwiseIcon size={14} aria-hidden />Reset demo to starting state</Button>
      </div>
    </div>
  );
}
