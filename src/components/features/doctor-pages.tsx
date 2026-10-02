"use client";
import * as React from "react";
import Link from "next/link";
import { ClipboardTextIcon, UsersIcon, WarningIcon, CheckCircleIcon, MagnifyingGlassIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useStore, getDoctorForSession } from "@/store";
import type { Case, ReviewStatus } from "@/lib/types";
import { Badge, Button, Card, EmptyState, ErrorState, Input, LinkButtonClass, PageHead, Select, Skeleton, StatCard, Textarea, Field, toast, Tabs, SimBadge, Chip, Disclaimer } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useHydratedFlag } from "./hooks";
import { DoctorReport, ConsistencyBadge } from "./report-view";
import { PatientHistory } from "./patient-pages";
import { PrescriptionsPage } from "./rx-settings";
import { VoiceRecorder } from "./care";
import { FilePreview } from "./docs";
import { AnalysisPanel, ModelCatalogView } from "./analysis";

const RV: Record<ReviewStatus, [string, "sun" | "sky" | "mint" | "coral" | "pink"]> = { awaiting: ["Awaiting review", "sun"], in_review: ["In review", "sky"], reviewed: ["Reviewed", "mint"], follow_up: ["Follow-up needed", "coral"], needs_file: ["Needs new file", "pink"] };
export const ReviewBadge = ({ s }: { s: ReviewStatus }) => <Badge tone={RV[s][1]}>{RV[s][0]}</Badge>;

function useDoctorData() {
  const cases = useStore((s) => s.cases).filter((c) => c.status === "completed" || c.status === "running"); const patients = useStore((s) => s.patients); const reports = useStore((s) => s.reports);
  return { cases, patients, reports };
}

export function DoctorDashboard() {
  const d = useStore(getDoctorForSession); const h = useHydratedFlag(); const { cases, patients, reports } = useDoctorData();
  if (!h) return <Skeleton className="h-64" />;
  const awaiting = cases.filter((c) => c.review.status === "awaiting"); const urgent = cases.filter((c) => reports.find((r) => r.caseId === c.id)?.urgent && c.review.status !== "reviewed");
  return (
    <div className="space-y-6"><PageHead kicker="Doctor workspace" title={`Good day, ${d?.name ?? "Doctor"}`} sub="Cases shared by patients appear here. All patients and results are fictional or simulated." actions={<Link href="/doctor/review" className={LinkButtonClass("primary")}>Open review queue</Link>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Patients" value={patients.filter((p) => p.sharedWithDoctor).length} icon={UsersIcon} tone="sky" /><StatCard label="Cases" value={cases.length} icon={ClipboardTextIcon} tone="lavender" /><StatCard label="Awaiting review" value={awaiting.length} icon={WarningIcon} tone="sun" /><StatCard label="Reviewed" value={cases.filter((c) => c.review.status === "reviewed").length} icon={CheckCircleIcon} tone="mint" /></div>
      {urgent.length > 0 && <Card variant="sticker" className="border-danger p-5"><h2 className="font-display text-base font-bold text-danger">Urgent alerts (fixed demo scenario)</h2><ul className="mt-2 space-y-2">{urgent.map((c) => <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 text-sm"><span><b>{patients.find((p) => p.id === c.patientId)?.name}</b> — {c.title}</span><Link className={LinkButtonClass("danger", "sm")} href={`/doctor/cases/${c.id}`}>Open</Link></li>)}</ul></Card>}
      <Card variant="bento" className="p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Recent cases</h2><Link className="text-sm font-semibold text-purple-deep underline" href="/doctor/patients">All patients</Link></div><CaseTable cases={cases.slice(0, 6)} /></Card>
    </div>
  );
}

function CaseTable({ cases }: { cases: Case[] }) {
  const patients = useStore((s) => s.patients);
  if (!cases.length) return <EmptyState icon={ClipboardTextIcon} title="No cases match" />;
  return (
    <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="bg-canvas text-left text-[11px] font-bold uppercase tracking-wider text-muted"><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Case</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Analysis</th><th className="px-4 py-3">Review</th><th className="px-4 py-3"><span className="sr-only">Open</span></th></tr></thead>
      <tbody>{cases.map((c) => { const p = patients.find((x) => x.id === c.patientId); return <tr key={c.id} className="border-t border-line hover:bg-canvas/60"><td className="px-4 py-3 font-semibold">{p?.name}<span className="block text-xs font-normal text-muted">{p?.code}</span></td><td className="px-4 py-3">{c.title}<span className="block font-mono text-xs text-muted">{c.id}</span></td><td className="px-4 py-3">{formatDate(c.createdAt)}</td><td className="px-4 py-3"><Badge tone={c.status === "completed" ? "mint" : "purple"}>{c.status}</Badge></td><td className="px-4 py-3"><ReviewBadge s={c.review.status} /></td><td className="px-4 py-3"><Link href={`/doctor/cases/${c.id}`} className={LinkButtonClass("soft", "sm")}>Open <ArrowRightIcon size={12} aria-hidden /></Link></td></tr>; })}</tbody></table></div>
  );
}

export function DoctorPatients() {
  const h = useHydratedFlag(); const { cases, patients } = useDoctorData(); const [q, setQ] = React.useState(""); const [f, setF] = React.useState<"all" | ReviewStatus>("all");
  if (!h) return <Skeleton className="h-64" />;
  const list = cases.filter((c) => { const p = patients.find((x) => x.id === c.patientId); return (f === "all" || c.review.status === f) && `${p?.name} ${p?.code} ${c.title} ${c.id}`.toLowerCase().includes(q.toLowerCase()); });
  return (
    <div><PageHead title="Patients & cases" sub="Search and filter the demo case list." />
      <div className="mb-4 flex flex-wrap gap-2"><div className="relative min-w-52 flex-1"><MagnifyingGlassIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden /><Input aria-label="Search patients and cases" placeholder="Search name, code, case…" className="rounded-full pl-10" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Select aria-label="Filter review status" className="w-auto" value={f} onChange={(e) => setF(e.target.value as typeof f)}><option value="all">All review states</option>{(Object.keys(RV) as ReviewStatus[]).map((s) => <option key={s} value={s}>{RV[s][0]}</option>)}</Select></div>
      <Card variant="bento" className="overflow-hidden p-0"><CaseTable cases={list} /></Card></div>
  );
}

export function DoctorReview() {
  const h = useHydratedFlag(); const { cases, patients, reports } = useDoctorData(); const setReview = useStore((s) => s.setReview);
  const d = useStore(getDoctorForSession); const [tab, setTab] = React.useState<"queue" | "done">("queue");
  if (!h) return <Skeleton className="h-64" />;
  const queue = cases.filter((c) => c.review.status !== "reviewed"); const done = cases.filter((c) => c.review.status === "reviewed");
  const list = tab === "queue" ? queue : done;
  return (
    <div><PageHead title="Review queue" sub="Mark cases as reviewed or flag follow-up. Reviews are demo status only." />
      <Tabs label="Queue" value={tab} onChange={setTab} tabs={[{ key: "queue", label: "To review", count: queue.length }, { key: "done", label: "Reviewed", count: done.length }]} />
      <div className="mt-4 grid gap-4 md:grid-cols-2">{list.length === 0 ? <EmptyState icon={CheckCircleIcon} title="Nothing here" /> : list.map((c) => { const p = patients.find((x) => x.id === c.patientId); const r = reports.find((x) => x.caseId === c.id); return (
        <Card key={c.id} className="p-5"><div className="flex items-start justify-between gap-2"><div><p className="font-display text-sm font-bold">{p?.name}</p><p className="text-xs text-muted">{c.title} · {c.id}</p></div><ReviewBadge s={c.review.status} /></div>
          {r?.urgent && <p className="mt-2 rounded-lg bg-danger-soft px-2 py-1 text-xs font-bold text-danger">Urgent flag (fixed demo scenario)</p>}
          <p className="mt-2 text-sm text-muted">{r?.summary.en}</p>
          <div className="mt-3 flex flex-wrap gap-2"><Link href={`/doctor/cases/${c.id}`} className={LinkButtonClass("soft", "sm")}>Open case</Link>{c.review.status !== "in_review" && c.review.status !== "reviewed" && <Button size="sm" variant="secondary" onClick={() => { setReview(c.id, "in_review"); toast("Marked in review", "info"); }}>Start review</Button>}{c.review.status !== "reviewed" && <Button size="sm" variant="success" onClick={() => { setReview(c.id, "reviewed", undefined, d?.name); toast("Case marked reviewed", "success"); }}>Mark reviewed</Button>}</div></Card>); })}</div></div>
  );
}

export function DoctorCasePage({ id }: { id: string }) {
  const h = useHydratedFlag(); const c = useStore((s) => s.cases.find((x) => x.id === id)); const patient = useStore((s) => s.patients.find((p) => p.id === c?.patientId)); const report = useStore((s) => s.reports.find((r) => r.caseId === id));
  const { setReview, addNote } = useStore(); const d = useStore(getDoctorForSession);
  const [tab, setTab] = React.useState<"overview" | "history" | "meds" | "analysis">("overview"); const [note, setNote] = React.useState(""); const [fu, setFu] = React.useState("");
  if (!h) return <Skeleton className="h-64" />;
  if (!c || !patient) return <ErrorState title="Case not found" body="It may have been removed or the demo was reset." />;
  return (
    <div><PageHead kicker={c.id} title={`${patient.name} — ${c.title}`} sub={`${patient.code} · ${patient.age ?? "?"}${patient.sex ?? ""} · ${patient.city ?? ""} · ${patient.conditions.join(", ") || "no listed conditions"}${patient.allergies.length ? ` · allergy: ${patient.allergies.join(", ")}` : ""}`} actions={<>{report && <Link href={`/doctor/reports/${report.id}`} className={LinkButtonClass("primary")}>Detailed report</Link>}<Link href="/doctor/patients" className={LinkButtonClass("secondary")}>All cases</Link></>} />
      <div className="mb-4 flex flex-wrap items-center gap-2"><ReviewBadge s={c.review.status} />{c.review.followUpDate && <Badge tone="coral">Follow-up {formatDate(c.review.followUpDate)}</Badge>}{report?.urgent && <Badge tone="pink" icon={<WarningIcon size={12} weight="fill" aria-hidden />}>Urgent flag (demo scenario)</Badge>}<SimBadge>Simulated findings</SimBadge></div>
      <Tabs label="Case views" value={tab} onChange={setTab} tabs={[{ key: "overview", label: "Overview" }, { key: "history", label: "History" }, { key: "meds", label: "Medicines" }, { key: "analysis", label: "Analysis" }]} />
      <div className="mt-4">
        {tab === "overview" && <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]"><div className="space-y-4">
          {report ? <Card className="p-5"><h2 className="text-lg font-bold">Findings</h2><ul className="mt-3 space-y-2">{report.findings.filter((f) => f.source !== "guideline").map((f) => <li key={f.id} className="rounded-xl bg-canvas p-3 text-sm"><p>{f.doctorText}</p>{f.confidence !== undefined && <p className="tabular text-xs text-muted">conf. {Math.round(f.confidence * 100)}% (illustrative) · {f.modelId}</p>}</li>)}</ul>
            <h3 className="mt-4 text-base font-bold">Evidence conflicts</h3><ul className="mt-2 space-y-2">{report.consistency.map((k) => <li key={k.id} className="rounded-xl bg-white p-3 text-sm shadow-clay-sm"><ConsistencyBadge s={k.status} /> <b>{k.title}</b><p className="text-muted">{k.doctorText}</p></li>)}</ul></Card> : <EmptyState icon={ClipboardTextIcon} title="No report yet" body="The analysis has not finished." />}
          {c.files.length > 0 && <Card className="p-5"><h2 className="text-base font-bold">Uploaded documents</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{c.files.map((f) => <div key={f.id}><p className="mb-1 truncate text-xs font-bold">{f.name}</p><FilePreview file={f} className="max-h-48" /></div>)}</div></Card>}</div>
          <div className="space-y-4"><Card className="p-5"><h2 className="text-base font-bold">Review</h2><div className="mt-3 space-y-3"><Field label="Status" htmlFor="rvs"><Select id="rvs" value={c.review.status} onChange={(e) => { setReview(c.id, e.target.value as ReviewStatus, undefined, d?.name); toast("Review status updated", "success"); }}>{(Object.keys(RV) as ReviewStatus[]).map((s) => <option key={s} value={s}>{RV[s][0]}</option>)}</Select></Field>
            <Field label="Follow-up date" htmlFor="fu"><div className="flex gap-2"><Input id="fu" type="date" value={fu || c.review.followUpDate || ""} onChange={(e) => setFu(e.target.value)} /><Button variant="secondary" onClick={() => { if (!fu) return; setReview(c.id, "follow_up", fu); toast("Follow-up set", "success"); }}>Set</Button></div></Field>
            <Field label="Add a note" htmlFor="note"><Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} className="min-h-20" /></Field><Button size="sm" disabled={note.trim().length < 2} onClick={() => { addNote(c.id, d?.name ?? "Doctor", note.trim()); setNote(""); toast("Note added", "success"); }}>Add note</Button>
            <ul className="space-y-2">{c.review.notes.map((n) => <li key={n.id} className="rounded-xl bg-canvas p-2 text-sm"><p>{n.text}</p><p className="text-[11px] text-muted">{n.author} · {formatDateTime(n.at)}</p></li>)}</ul></div></Card>
            <Disclaimer compact /></div></div>}
        {tab === "history" && <PatientHistory forPatient={patient} />}
        {tab === "meds" && <PrescriptionsPage forPatient={patient} />}
        {tab === "analysis" && (c.run ? <AnalysisPanel c={c} patientLang={false} /> : <EmptyState icon={ClipboardTextIcon} title="No simulated analysis for this seeded case" />)}
      </div></div>
  );
}

export function DoctorReportPage({ id }: { id: string }) {
  const h = useHydratedFlag(); const r = useStore((s) => s.reports.find((x) => x.id === id));
  if (!h) return <Skeleton className="h-64" />;
  if (!r) return <ErrorState title="Report not found" />;
  return <DoctorReport report={r} backHref={`/doctor/cases/${r.caseId}`} />;
}

export function DoctorInstructions() {
  const h = useHydratedFlag(); const patients = useStore((s) => s.patients).filter((p) => p.sharedWithDoctor);
  if (!h) return <Skeleton className="h-64" />;
  return <div><PageHead title="Record instructions" sub="Create a care plan and reminders for a patient. Simulated transcript; the doctor’s permission is required." /><VoiceRecorder role="doctor" patientIds={patients.map((p) => ({ id: p.id, name: p.name }))} /></div>;
}
export const SystemPage = () => <div><PageHead title="System view" sub="Model catalog and orchestration inspection. Simulated — for the team and judges." /><ModelCatalogView /></div>;
void Chip;
