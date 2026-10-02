"use client";
import * as React from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FilesIcon, FolderOpenIcon, BellIcon, ChartLineUpIcon, PlusIcon, MagnifyingGlassIcon, WarningIcon, FlaskIcon, ArrowRightIcon, GitDiffIcon } from "@phosphor-icons/react";
import { useStore, getPatientForSession, addDays } from "@/store";
import type { Case, Patient, Report, Visit } from "@/lib/types";
import { Badge, Button, Card, EmptyState, Input, LinkButtonClass, PageHead, Select, Sheet, SimBadge, StatCard, Tabs, UrgentAlert, ErrorState, Skeleton, toast, Chip } from "@/components/ui";
import { buildLabSeries, DOC_BY_ID } from "@/data/docs";
import { SourceDocView } from "./docs";
import { AnalysisPanel } from "./analysis";
import { PatientReport, DoctorReport } from "./report-view";
import { cn, dayKey, formatDate, pct } from "@/lib/utils";
import { t, tl } from "@/lib/i18n";
import { dueOn } from "./care";
import { useHydratedFlag } from "./hooks";

export function usePatient() { return useStore(getPatientForSession); }
export function usePatientDocs(pid?: string) {
  const base = useStore((s) => (pid ? s.patientDocs[pid] : undefined)) ?? [];
  const cases = useStore((s) => s.cases);
  return React.useMemo(() => {
    const fromCases = cases.filter((c) => c.patientId === pid && c.status === "completed").flatMap((c) => c.files.filter((f) => !f.excluded && f.docId).map((f) => f.docId!));
    return Array.from(new Set([...base, ...fromCases]));
  }, [base, cases, pid]);
}

export const statusTone = (s: Case["status"]) => (s === "completed" ? "mint" : s === "running" ? "purple" : s === "failed" ? "pink" : s === "cancelled" ? "ink" : s === "paused" ? "sun" : "sky") as "mint";

/* ---------------- Dashboard ---------------- */
export function PatientDashboard() {
  const lang = useStore((s) => s.lang); const p = usePatient();
  const cases = useStore((s) => s.cases).filter((c) => c.patientId === p?.id); const reports = useStore((s) => s.reports);
  const reminders = useStore((s) => s.reminders).filter((r) => r.patientId === p?.id); const visits = useStore((s) => s.visits).filter((v) => v.patientId === p?.id);
  const carePlans = useStore((s) => s.carePlans).filter((c) => c.patientId === p?.id && c.active); const loadDemo = useStore((s) => s.loadDemoInto);
  const docs = usePatientDocs(p?.id); const toggle = useStore((s) => s.toggleReminderDone);
  const hydrated = useHydratedFlag();
  if (!hydrated || !p) return <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div>;
  const today = dayKey();
  const todays = reminders.flatMap((r) => (dueOn(r, today) ? [r] : []));
  const overdue = reminders.filter((r) => r.repeat === "once" && r.startDate < today && !r.completions[r.startDate]);
  const myReports = reports.filter((r) => cases.some((c) => c.id === r.caseId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const latest = myReports[0]; const urgent = myReports.find((r) => r.urgent);
  const series = buildLabSeries(docs).filter((s) => s.test === "HbA1c");
  const empty = !visits.length && !cases.length;
  const pending = todays.filter((r) => !r.completions[today]).length + overdue.length + cases.filter((c) => c.status === "failed" || c.status === "draft").length;
  return (
    <div className="space-y-6">
      <PageHead kicker={t(lang, "dash.welcome")} title={`${t(lang, "dash.welcome")}, ${p.name.split(" ")[0]}`} sub={`${p.code}${p.age ? ` · ${p.age} y` : ""}${p.city ? ` · ${p.city}` : ""}${p.fictional ? " · fictional demo patient" : ""}`}
        actions={<><Link href="/patient/upload" className={LinkButtonClass("primary")}><FilesIcon size={18} aria-hidden />{t(lang, "dash.uploadCta")}</Link><Link href="/patient/upload" className={LinkButtonClass("outline")}><PlusIcon size={18} aria-hidden />{t(lang, "dash.newCase")}</Link></>} />
      {urgent && urgent.urgent && <UrgentAlert title={tl(lang, urgent.urgent.title)} reason={tl(lang, urgent.urgent.reason)} call108={urgent.urgent.call108} callText={t(lang, "report.urgentCall")} />}
      {empty && <EmptyState icon={FolderOpenIcon} title="Welcome — your space is empty" body="Upload your first files, or load the fictional demo patient (Ramesh) to see history, medicines and reminders." action={<><Link href="/patient/upload" className={LinkButtonClass("primary")}>Upload files</Link><Button variant="outline" onClick={() => { loadDemo(p.id); toast("Demo patient loaded", "success"); }}><FlaskIcon size={16} aria-hidden />Load Demo Patient</Button></>} />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t(lang, "dash.documents")} value={docs.length + cases.reduce((a, c) => a + (c.status !== "completed" ? c.files.length : 0), 0)} icon={FilesIcon} tone="mint" hint="Seeded records + case files" />
        <StatCard label="Cases" value={cases.length} icon={FolderOpenIcon} tone="sky" hint={`${cases.filter((c) => c.status === "completed").length} completed`} />
        <StatCard label={t(lang, "dash.pending")} value={pending} icon={WarningIcon} tone="coral" hint="Reminders due, failed or draft cases" />
        <StatCard label={t(lang, "dash.reminders")} value={todays.length} icon={BellIcon} tone="sun" hint={`${todays.filter((r) => r.completions[today]).length} done today`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <Card className="p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">{t(lang, "dash.latestReport")}</h2><Link className="text-sm font-semibold text-purple-deep underline" href="/patient/cases">All cases</Link></div>
            {latest ? <div className="mt-3"><p className="text-sm font-semibold">Case {latest.caseId} · {formatDate(latest.createdAt)}</p><p className="mt-1 text-sm text-muted">{tl(lang, latest.summary)}</p><Link href={`/patient/reports/${latest.id}`} className={LinkButtonClass("soft", "sm", "mt-3")}>Open report <ArrowRightIcon size={14} aria-hidden /></Link></div> : <p className="mt-2 text-sm text-muted">No report yet. Upload files to create one.</p>}</Card>
          <Card className="p-5"><h2 className="text-lg font-bold">{t(lang, "dash.prevVisit")}</h2>{visits[0] ? <VisitSummary v={visits[0]} compact /> : <p className="mt-2 text-sm text-muted">No earlier visits recorded yet.</p>}</Card>
          <Card className="p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">{t(lang, "dash.labTrends")}</h2><SimBadge>Sample data</SimBadge></div>{series[0] ? <LabChart s={series[0]} h={150} /> : <p className="mt-2 text-sm text-muted">No lab values yet.</p>}</Card>
        </div>
        <div className="space-y-6">
          <Card className="p-5"><h2 className="text-lg font-bold">{t(lang, "dash.reminders")}</h2>
            {todays.length === 0 && overdue.length === 0 ? <p className="mt-2 text-sm text-muted">Nothing due today.</p> : <ul className="mt-3 space-y-2">{[...overdue, ...todays].map((r) => { const day = r.repeat === "once" ? r.startDate : today; return <li key={r.id} className="flex items-center justify-between gap-2 rounded-xl bg-canvas px-3 py-2 text-sm"><span><b>{r.time}</b> {r.title}{day < today && <Badge tone="coral" className="ml-1">Missed</Badge>}</span><Button size="sm" variant={r.completions[day] ? "success" : "secondary"} aria-pressed={!!r.completions[day]} onClick={() => toggle(r.id, day)}>{r.completions[day] ? "✓" : t(lang, "care.done")}</Button></li>; })}</ul>}
            <Link href="/patient/care-plan" className={LinkButtonClass("soft", "sm", "mt-3")}>{t(lang, "nav.carePlan")}</Link></Card>
          <Card className="p-5"><h2 className="text-lg font-bold">Active care plan</h2>{carePlans[0] ? <><p className="mt-1 text-sm font-semibold">{carePlans[0].title}</p><p className="text-xs text-muted">{carePlans[0].items.length} instructions · {carePlans[0].doctor}</p></> : <p className="mt-2 text-sm text-muted">No active plan. Record the doctor’s advice to create one.</p>}<Link href="/patient/instructions" className={LinkButtonClass("outline", "sm", "mt-3")}>Doctor’s instructions</Link></Card>
          <Card variant="soft" tone="lavender" className="p-5"><h2 className="text-base font-bold">Explore</h2><div className="mt-2 flex flex-wrap gap-2"><Link className={LinkButtonClass("secondary", "sm")} href="/patient/history">History</Link><Link className={LinkButtonClass("secondary", "sm")} href="/patient/prescriptions">Medicines</Link><Link className={LinkButtonClass("secondary", "sm")} href="/patient/settings">Settings</Link></div></Card>
        </div>
      </div>
    </div>
  );
}

export function VisitSummary({ v, compact }: { v: Visit; compact?: boolean }) {
  const [src, setSrc] = React.useState<Visit["sources"][number]>();
  const rows: [string, string][] = [["Medicines given", v.medicinesGiven.join("; ")], ["Did the patient take them", v.tookThem], ["Result", v.result], ["Changed since then", v.changedSince], ["Still pending", v.pending]];
  return (
    <div className="mt-3 text-sm"><p className="font-semibold">Visit on {formatDate(v.date)} · {v.doctor} · {v.reason}</p>
      <dl className="mt-2 space-y-1.5">{rows.slice(0, compact ? 3 : 5).map(([k, val]) => <div key={k} className="flex gap-2"><dt className="w-36 shrink-0 text-muted">{k}</dt><dd className="font-medium">{val}</dd></div>)}</dl>
      <div className="mt-3 flex flex-wrap gap-1.5">{v.sources.map((s) => <button key={s.label} onClick={() => setSrc(s)} className="rounded-full border border-mint-deep/40 bg-mint-soft px-2.5 py-0.5 text-[11px] font-bold text-mint-deep hover:-translate-y-0.5 hover:shadow-pop">RECORD · {s.label}</button>)}</div>
      <Sheet open={!!src} onOpenChange={(o) => !o && setSrc(undefined)} title={src?.label ?? ""} wide>{src && DOC_BY_ID[src.docId] && <SourceDocView doc={DOC_BY_ID[src.docId]} lineId={src.lineId} />}</Sheet>
    </div>
  );
}

export function LabChart({ s, h = 180 }: { s: ReturnType<typeof buildLabSeries>[number]; h?: number }) {
  const data = s.values.map((v) => ({ date: formatDate(v.date), value: v.value }));
  const [min, max] = [Math.min(...s.values.map((v) => v.value), s.low ?? Infinity), Math.max(...s.values.map((v) => v.value), s.high ?? 0)];
  return (
    <figure><div style={{ height: h }} className="mt-2"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ left: -15, right: 8, top: 8 }}>
      <defs><linearGradient id={`g-${s.test}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7b5cf0" stopOpacity={0.35} /><stop offset="100%" stopColor="#7b5cf0" stopOpacity={0} /></linearGradient></defs>
      <CartesianGrid stroke="#eef1f6" vertical={false} /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis domain={[Math.floor(min * 0.9), Math.ceil(max * 1.1)]} tick={{ fontSize: 10 }} />
      {s.low !== undefined && s.high !== undefined && <ReferenceArea y1={s.low} y2={s.high} fill="#d0e8ba" fillOpacity={0.5} />}
      <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #e3e7ef", boxShadow: "0 8px 24px -12px rgba(28,27,43,.25)", fontSize: 12 }} cursor={{ fill: "#f5f1e8" }} />
      <Area type="monotone" dataKey="value" stroke="#7b5cf0" strokeWidth={2} fill={`url(#g-${s.test})`} dot={{ r: 4, fill: "#1c1b2b" }} /></AreaChart></ResponsiveContainer></div>
      <figcaption className="text-xs text-muted">{s.test} ({s.unit}) · shaded band = {s.rangeLabel} · {s.values.map((v) => v.value).join(" → ")}</figcaption></figure>
  );
}

/* ---------------- Cases ---------------- */
export function PatientCases() {
  const p = usePatient(); const cases = useStore((s) => s.cases).filter((c) => c.patientId === p?.id);
  const remove = useStore((s) => s.removeCase);
  const [q, setQ] = React.useState(""); const [f, setF] = React.useState("all");
  const list = cases.filter((c) => (f === "all" || c.status === f) && (c.title + c.id).toLowerCase().includes(q.toLowerCase()));
  return (
    <div><PageHead title="My cases" sub="Every upload becomes a case. Open one to see its analysis and report." actions={<Link href="/patient/upload" className={LinkButtonClass("primary")}><PlusIcon size={18} aria-hidden />New case</Link>} />
      <div className="mb-4 flex flex-wrap gap-2"><div className="relative min-w-52 flex-1"><MagnifyingGlassIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden /><Input aria-label="Search cases" placeholder="Search cases…" className="rounded-full pl-10" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Select aria-label="Filter by status" className="w-auto" value={f} onChange={(e) => setF(e.target.value)}>{["all", "completed", "running", "paused", "failed", "cancelled", "draft"].map((s) => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}</Select></div>
      {list.length === 0 ? <EmptyState icon={FolderOpenIcon} title="No cases found" body="Create a case by uploading files." action={<Link href="/patient/upload" className={LinkButtonClass("primary")}>Upload files</Link>} /> :
        <div className="grid gap-4 md:grid-cols-2">{list.map((c) => <Card key={c.id} className="p-5"><div className="flex items-start justify-between gap-2"><div><p className="font-display text-sm font-bold">{c.title}</p><p className="font-mono text-xs text-muted">{c.id} · {formatDate(c.createdAt)} · {c.files.length} file(s)</p></div><Badge tone={statusTone(c.status)}>{c.status}</Badge></div>
          <div className="mt-3 flex flex-wrap gap-2"><Link href={`/patient/cases/${c.id}`} className={LinkButtonClass("soft", "sm")}>Open case</Link>{c.reportId && <Link href={`/patient/reports/${c.reportId}`} className={LinkButtonClass("outline", "sm")}>Report</Link>}{!c.seeded && <Button size="sm" variant="ghost" onClick={() => { remove(c.id); toast("Case removed", "info"); }}>Delete</Button>}</div></Card>)}</div>}
    </div>
  );
}

export function PatientCaseDetail({ id }: { id: string }) {
  const c = useStore((s) => s.cases.find((x) => x.id === id)); const hydrated = useHydratedFlag();
  const p = usePatient();
  if (!hydrated) return <Skeleton className="h-64" />;
  if (!c || c.patientId !== p?.id) return <ErrorState title="Case not found" body="It may have been deleted or the demo was reset." />;
  return (
    <div><PageHead kicker={c.id} title={c.title} sub={`Created ${formatDate(c.createdAt)} · ${c.files.length} file(s)`} actions={<>{c.reportId && <Link href={`/patient/reports/${c.reportId}`} className={LinkButtonClass("primary")}>Open report</Link>}<Link href="/patient/cases" className={LinkButtonClass("secondary")}>All cases</Link></>} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <AnalysisPanel c={c} />
        <div className="space-y-4"><Card className="p-5"><h2 className="text-base font-bold">Files in this case</h2>{c.files.length === 0 ? <p className="mt-2 text-sm text-muted">Seeded case — no uploaded files.</p> : <ul className="mt-3 space-y-2 text-sm">{c.files.map((f) => <li key={f.id} className="rounded-xl bg-canvas p-2"><p className="truncate font-semibold">{f.name}</p><p className="text-xs text-muted">{f.category} · {f.status}{f.excluded ? " · excluded" : ""}</p></li>)}</ul>}</Card>
          <Card className="p-5"><h2 className="text-base font-bold">Simple answers</h2><p className="mt-1 text-sm text-muted">{c.intake.coughDuration ? `Cough: ${c.intake.coughDuration}. ` : ""}{c.intake.breathless ? `Breathless: ${c.intake.breathless}. ` : ""}{c.intake.chestPain ? `Chest pain: ${c.intake.chestPain}.` : ""}{!c.intake.coughDuration && !c.intake.breathless && !c.intake.chestPain ? "None given." : ""}</p></Card></div></div></div>
  );
}

export function PatientReportPage({ id, doctor }: { id: string; doctor?: boolean }) {
  const r = useStore((s) => s.reports.find((x) => x.id === id)); const hydrated = useHydratedFlag(); const p = usePatient();
  if (!hydrated) return <Skeleton className="h-64" />;
  if (!r || r.patientId !== p?.id) return <ErrorState title="Report not found" body="The report may not exist yet, or the demo was reset." />;
  return doctor ? <DoctorReport report={r} backHref={`/patient/cases/${r.caseId}`} patientView={`/patient/reports/${r.id}`} /> : <PatientReport report={r} />;
}

/* ---------------- History / memory ---------------- */
export function PatientHistory({ forPatient }: { forPatient?: Patient }) {
  const me = usePatient(); const p = forPatient ?? me; const lang = useStore((s) => s.lang);
  const visits = useStore((s) => s.visits).filter((v) => v.patientId === p?.id); const cases = useStore((s) => s.cases).filter((c) => c.patientId === p?.id);
  const docs = usePatientDocs(p?.id); const reports = useStore((s) => s.reports);
  const [tab, setTab] = React.useState<"timeline" | "labs" | "compare">("timeline"); const [q, setQ] = React.useState(""); const [kind, setKind] = React.useState("all"); const [doc, setDoc] = React.useState<string>();
  const [metric, setMetric] = React.useState("HbA1c");
  const series = buildLabSeries(docs);
  if (!p) return null;
  const items = [...docs.map((id) => DOC_BY_ID[id]).filter(Boolean).map((d) => ({ key: d.id, date: d.date, title: d.title, kind: d.kind, sub: d.issuer, docId: d.id })), ...visits.map((v) => ({ key: v.id, date: v.date, title: `Visit — ${v.reason}`, kind: "visit", sub: v.doctor, docId: undefined as string | undefined }))].filter((i) => (kind === "all" || i.kind === kind) && (i.title + i.sub).toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date));
  const prevCase = cases.find((c) => c.status === "completed" && c.createdAt < "2026-09-30" && reports.some((r) => r.caseId === c.id)); const curCase = cases.filter((c) => c.status === "completed" && !c.seeded)[0];
  const cur = reports.find((r) => r.caseId === curCase?.id); const prev = reports.find((r) => r.caseId === prevCase?.id);
  const s = series.find((x) => x.test === metric);
  return (
    <div><PageHead title={forPatient ? `${p.name} — history` : t(lang, "nav.history")} sub="Patient memory: earlier records the system can retrieve for a new case. All fictional demo data." />
      <Tabs label="History views" value={tab} onChange={setTab} tabs={[{ key: "timeline", label: "Timeline" }, { key: "labs", label: "Lab trends" }, { key: "compare", label: "Compare cases" }]} />
      {tab === "timeline" && <div className="mt-4 space-y-4">
        {visits[0] && <Card variant="sticker" className="p-5"><h2 className="text-lg font-bold">{t(lang, "dash.prevVisit")}</h2><VisitSummary v={visits[0]} /></Card>}
        <div className="flex flex-wrap gap-2"><Input aria-label="Search records" placeholder="Search records…" className="max-w-xs rounded-full" value={q} onChange={(e) => setQ(e.target.value)} />{["all", "lab_report", "prescription", "visit_note", "visit", "xray", "ecg"].map((k) => <Chip key={k} size="sm" selected={kind === k} onClick={() => setKind(k)}>{k.replace("_", " ")}</Chip>)}</div>
        {items.length === 0 ? <EmptyState icon={FolderOpenIcon} title="No records match" body="Try clearing the filters, or load the demo patient from the dashboard." /> : <ol className="relative space-y-3 border-l-2 border-ink pl-5">{items.map((i) => <li key={i.key} className="relative"><span className="absolute -left-[27px] top-3 h-3 w-3 rounded-full border-2 border-ink bg-sun" aria-hidden /><Card variant="bento" className="p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-bold">{i.title}</p><p className="text-xs text-muted">{formatDate(i.date)} · {i.sub}</p></div>{i.docId && <Button size="sm" variant="soft" onClick={() => setDoc(i.docId)}>Open source</Button>}</div></Card></li>)}</ol>}</div>}
      {tab === "labs" && <div className="mt-4"><div className="mb-3 flex flex-wrap gap-2">{series.map((x) => <Chip key={x.test} size="sm" selected={metric === x.test} onClick={() => setMetric(x.test)}>{x.test}</Chip>)}</div>{s ? <Card className="p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">{s.test}</h2><SimBadge>Illustrative ranges</SimBadge></div><LabChart s={s} h={260} /><div className="mt-3 flex flex-wrap gap-2">{s.values.map((v) => <button key={v.docId} onClick={() => setDoc(v.docId)} className="rounded-full border border-mint-deep/40 bg-mint-soft px-2.5 py-0.5 text-[11px] font-bold text-mint-deep">RECORD · {formatDate(v.date)}: {v.value}</button>)}</div></Card> : <EmptyState icon={ChartLineUpIcon} title="No lab values yet" body="Lab values appear after lab reports are in your records." />}</div>}
      {tab === "compare" && <div className="mt-4 grid gap-4 md:grid-cols-2">{[["Earlier case", prev, prevCase], ["Current case", cur, curCase]].map(([label, r, c]) => <Card key={label as string} className="p-5"><h2 className="flex items-center gap-2 text-lg font-bold"><GitDiffIcon size={18} aria-hidden />{label as string}</h2>{r && c ? <><p className="text-xs text-muted">{(c as Case).title} · {formatDate((c as Case).createdAt)}</p><ul className="mt-3 space-y-2 text-sm">{(r as Report).findings.filter((f) => f.source !== "guideline").slice(0, 5).map((f) => <li key={f.id} className="rounded-xl bg-canvas p-2">{f.doctorText}{f.confidence !== undefined && <span className="tabular ml-1 text-xs text-muted">({pct(f.confidence)}, illustrative)</span>}</li>)}</ul></> : <p className="mt-2 text-sm text-muted">{label === "Current case" ? "Complete a new analysis (Upload → sample files) to compare it with the earlier case." : "No earlier completed case."}</p>}</Card>)}</div>}
      <Sheet open={!!doc} onOpenChange={(o) => !o && setDoc(undefined)} wide title="Source document">{doc && DOC_BY_ID[doc] && <SourceDocView doc={DOC_BY_ID[doc]} />}</Sheet>
    </div>
  );
}
void addDays; void WarningIcon;
