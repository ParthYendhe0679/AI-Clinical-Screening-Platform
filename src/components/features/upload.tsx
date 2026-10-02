"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { UploadSimpleIcon, TrashIcon, ArrowsClockwiseIcon, CheckCircleIcon, WarningIcon, XCircleIcon, InfoIcon, FlaskIcon, EyeIcon } from "@phosphor-icons/react";
import { useStore, getPatientForSession } from "@/store";
import { ACCEPT, analyzeFile, applyUserCategory, createSampleFiles, releaseRuntime, releaseAllRuntime } from "@/lib/files";
import type { CaseFile, FileCategory, FileCheck, IntakeAnswers } from "@/lib/types";
import { Badge, Button, Card, Checkbox, EmptyState, Field, PageHead, ProgressBar, Select, Sheet, SimBadge, Textarea, Input, toast, ConfirmDialog } from "@/components/ui";
import { CATEGORY_LABEL } from "@/data/models";
import { cn, formatBytes } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { FilePreview } from "./docs";
import { speak } from "@/lib/speech";
import { SpeakerHighIcon } from "@phosphor-icons/react";

const STATUS: Record<CaseFile["status"], [string, "mint" | "sun" | "pink" | "coral"]> = { ready: ["Ready", "mint"], needs_review: ["Needs review", "sun"], invalid: ["Invalid", "pink"], unsupported: ["Unsupported", "coral"] };
const CHECK_ICON: Record<FileCheck["status"], React.ReactNode> = { pass: <CheckCircleIcon size={16} weight="fill" className="text-success" aria-label="pass" />, warn: <WarningIcon size={16} weight="fill" className="text-warning" aria-label="warning" />, fail: <XCircleIcon size={16} weight="fill" className="text-danger" aria-label="fail" />, info: <InfoIcon size={16} weight="fill" className="text-info" aria-label="info" /> };
const CATS = (Object.keys(CATEGORY_LABEL) as FileCategory[]).filter((c) => c !== "unknown");

export function UploadFlow() {
  const router = useRouter();
  const lang = useStore((s) => s.lang); const patient = useStore(getPatientForSession);
  const createCase = useStore((s) => s.createCase); const startRun = useStore((s) => s.startRun);
  const [files, setFiles] = React.useState<CaseFile[]>([]);
  const [progress, setProgress] = React.useState<Record<string, number>>({});
  const [drag, setDrag] = React.useState(false); const [consent, setConsent] = React.useState(false);
  const [open, setOpen] = React.useState<CaseFile>(); const [confirmClear, setConfirmClear] = React.useState(false);
  const [intake, setIntake] = React.useState<IntakeAnswers>({}); const [title, setTitle] = React.useState("New screening case");
  const inputRef = React.useRef<HTMLInputElement>(null); const replaceRef = React.useRef<HTMLInputElement>(null); const replaceId = React.useRef<string>("");
  const filesRef = React.useRef(files); filesRef.current = files;
  const keep = React.useRef(false);
  React.useEffect(() => () => { if (!keep.current) filesRef.current.forEach((f) => releaseRuntime(f.id)); }, []);

  const simulateProgress = (id: string) => { let p = 0; const iv = setInterval(() => { p += 20 + Math.random() * 25; if (p >= 100) { p = 100; clearInterval(iv); } setProgress((x) => ({ ...x, [id]: p })); }, 140); };
  const add = async (list: FileList | File[]) => {
    const arr = Array.from(list); if (!arr.length) return;
    const res: CaseFile[] = [];
    for (const f of arr) { try { const cf = await analyzeFile(f); res.push(cf); simulateProgress(cf.id); } catch { toast(`Could not read ${f.name}`, "error"); } }
    setFiles((x) => [...x, ...res]);
    const bad = res.filter((r) => r.status === "invalid" || r.status === "unsupported").length;
    toast(`${res.length} file(s) checked`, bad ? "warning" : "success", bad ? `${bad} could not be accepted — see details.` : "Files stay in your browser.");
  };
  const remove = (id: string) => { releaseRuntime(id); setFiles((x) => x.filter((f) => f.id !== id)); };
  const patch = (id: string, fn: (f: CaseFile) => CaseFile) => setFiles((x) => x.map((f) => (f.id === id ? fn(f) : f)));
  const usable = files.filter((f) => !f.excluded && (f.status === "ready" || (f.status === "needs_review" && f.category !== "unknown")));
  const hasUsable = usable.length > 0;

  const create = () => {
    if (!patient) return;
    keep.current = true;
    const id = createCase(patient.id, files, intake, title.trim() || "New screening case");
    startRun(id);
    toast("Case created", "success", "Analysis started (simulated).");
    router.push(`/patient/cases/${id}`);
  };

  return (
    <div>
      <PageHead kicker="Step 1 of 4" title={t(lang, "upload.title")} sub={t(lang, "upload.help")} actions={<Button variant="soft" onClick={() => speak(t(lang, "upload.help"), lang).then((r) => !r.ok && toast("Voice unavailable", "warning", r.reason))}><SpeakerHighIcon size={18} aria-hidden />{t(lang, "common.listen")}</Button>} />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <div role="group" aria-label="File drop zone" onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); void add(e.dataTransfer.files); }}
            className={cn("rounded-[28px] border-2 border-dashed border-ink p-8 text-center transition", drag ? "bg-lavender shadow-pop-lg" : "bg-white shadow-pop")}>
            <UploadSimpleIcon size={36} weight="duotone" className="mx-auto text-purple-deep" aria-hidden />
            <p className="mt-2 font-display text-base font-bold">{t(lang, "upload.drop")}</p>
            <p className="mt-1 text-xs text-muted">Images, PDF, DICOM, ECG data (CSV/text), audio · up to 25 MB each · stays in your browser</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button onClick={() => inputRef.current?.click()}>{t(lang, "upload.choose")}</Button>
              <Button variant="outline" onClick={() => { setFiles((x) => [...x, ...createSampleFiles("ramesh")]); toast("Sample files loaded", "info", "Fictional demo files for Ramesh Patil."); }}><FlaskIcon size={18} aria-hidden />{t(lang, "upload.sample")}</Button>
              <Button variant="secondary" onClick={() => { setFiles((x) => [...x, ...createSampleFiles("blurry")]); toast("Blurry sample added", "warning", "Demonstrates the retake prompt."); }}>Add blurry sample</Button>
            </div>
            <input ref={inputRef} type="file" multiple accept={ACCEPT} className="sr-only" aria-label="Choose medical files" onChange={(e) => { if (e.target.files) void add(e.target.files); e.target.value = ""; }} />
            <input ref={replaceRef} type="file" accept={ACCEPT} className="sr-only" aria-label="Choose replacement file" onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; const cf = await analyzeFile(f); simulateProgress(cf.id); setFiles((x) => x.map((o) => { if (o.id === replaceId.current) { releaseRuntime(o.id); return cf; } return o; })); toast("File replaced", "success"); }} />
          </div>

          {files.length === 0 ? <EmptyState icon={UploadSimpleIcon} title="No files yet" body="Add files above, or load the sample files to see the full demo scenario." /> : (
            <ul className="space-y-3" aria-label="Upload queue">
              {files.map((f) => { const [lbl, tone] = STATUS[f.status]; const pr = f.sample ? 100 : progress[f.id] ?? 100; return (
                <li key={f.id}><Card variant="bento" className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-bold">{f.name}</p><p className="text-xs text-muted">{formatBytes(f.size)} · {f.detectedFormat}</p></div><div className="flex flex-wrap gap-1.5"><Badge tone={tone}>{lbl}</Badge>{f.excluded && <Badge tone="ink">Excluded</Badge>}{f.sample && <Badge tone="sun">Sample</Badge>}</div></div>
                  <div className="mt-2"><ProgressBar value={pr} label={`Reading ${f.name}`} tone={pr < 100 ? "purple" : "mint"} /></div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-semibold" htmlFor={`cat-${f.id}`}>Category
                      <Select id={`cat-${f.id}`} className="h-9 w-auto text-xs" value={f.category} disabled={f.status === "invalid" || f.status === "unsupported"} onChange={(e) => patch(f.id, (o) => applyUserCategory(o, e.target.value as FileCategory))}>
                        {f.category === "unknown" && <option value="unknown">Needs review — choose…</option>}{CATS.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}</Select></label>
                    <Button size="sm" variant="soft" onClick={() => setOpen(f)}><EyeIcon size={14} aria-hidden />Details & preview</Button>
                    {(f.status === "needs_review" || f.excluded) && f.status !== "invalid" && f.status !== "unsupported" && <Button size="sm" variant="secondary" onClick={() => patch(f.id, (o) => ({ ...o, excluded: !o.excluded }))}>{f.excluded ? "Include anyway" : "Exclude"}</Button>}
                    {!f.sample && <Button size="sm" variant="secondary" onClick={() => { replaceId.current = f.id; replaceRef.current?.click(); }}><ArrowsClockwiseIcon size={14} aria-hidden />Replace</Button>}
                    <Button size="sm" variant="ghost" aria-label={`Remove ${f.name}`} onClick={() => { remove(f.id); toast("File removed", "info"); }}><TrashIcon size={14} aria-hidden />Remove</Button>
                  </div>
                  {f.checks.some((c) => c.status === "warn" || c.status === "fail") && <ul className="mt-2 space-y-1 text-xs">{f.checks.filter((c) => c.status === "warn" || c.status === "fail").map((c) => <li key={c.key} className="flex gap-1.5">{CHECK_ICON[c.status]}<span>{c.detail}</span></li>)}</ul>}
                </Card></li>); })}
            </ul>)}
          {files.length > 0 && <div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={() => setConfirmClear(true)}>{t(lang, "upload.clear")}</Button></div>}
        </div>

        <div className="space-y-4">
          <Card className="p-5"><h2 className="text-base font-bold">Case details</h2>
            <div className="mt-3 space-y-3"><Field label="Case name" htmlFor="ctitle"><Input id="ctitle" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
              <fieldset className="space-y-3"><legend className="text-sm font-semibold">Simple questions (optional)</legend>
                <Field label={t(lang, "upload.q1")} htmlFor="q1"><Input id="q1" value={intake.coughDuration ?? ""} placeholder="e.g. 3 weeks" onChange={(e) => setIntake({ ...intake, coughDuration: e.target.value })} /></Field>
                <Field label={t(lang, "upload.q2")} htmlFor="q2"><Select id="q2" value={intake.breathless ?? ""} onChange={(e) => setIntake({ ...intake, breathless: (e.target.value || undefined) as IntakeAnswers["breathless"] })}><option value="">Choose…</option><option value="yes">Yes</option><option value="no">No</option><option value="unsure">Not sure</option></Select></Field>
                <Field label={t(lang, "upload.q3")} htmlFor="q3"><Select id="q3" value={intake.chestPain ?? ""} onChange={(e) => setIntake({ ...intake, chestPain: (e.target.value || undefined) as IntakeAnswers["chestPain"] })}><option value="">Choose…</option><option value="yes">Yes</option><option value="no">No</option><option value="unsure">Not sure</option></Select></Field>
                <p className="text-xs text-muted">Typed or tapped answers. Voice answers are not recorded or transcribed in this prototype.</p></fieldset></div></Card>
          <Card className="p-5"><h2 className="text-base font-bold">File check summary</h2>
            <p className="mt-1 text-sm text-muted">{files.length} file(s) · {usable.length} will be analysed · {files.length - usable.length} held back</p>
            <p className="mt-2 flex items-center gap-2 text-xs"><SimBadge />Quality and category checks are rule-based demonstrations, not medical image AI.</p>
            <div className="mt-4 space-y-3"><Checkbox id="consent" checked={consent} onChange={setConsent} label={t(lang, "upload.consent")} />
              <Button size="lg" className="w-full" disabled={!hasUsable || !consent} onClick={create}>{t(lang, "upload.analyze")}</Button>
              {!hasUsable && files.length > 0 && <p role="alert" className="text-xs font-semibold text-warning">No file is ready yet — choose a category for files marked “needs review”, or include/replace them.</p>}</div></Card>
        </div>
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(undefined)} wide title={open?.name ?? "File"} description={open ? `${formatBytes(open.size)} · ${open.detectedFormat}` : undefined}>
        {open && <div className="space-y-4"><FilePreview file={files.find((f) => f.id === open.id) ?? open} />
          <ul className="space-y-2">{(files.find((f) => f.id === open.id) ?? open).checks.map((c) => <li key={c.key} className="flex gap-2 rounded-2xl bg-white p-3 text-sm shadow-clay-sm">{CHECK_ICON[c.status]}<div><p className="font-semibold">{c.label}</p><p className="text-xs text-muted">{c.detail}</p></div></li>)}</ul>
          {open.sha256 && <p className="break-all font-mono text-[10px] text-muted">SHA-256 (computed locally): {open.sha256}</p>}</div>}
      </Sheet>
      <ConfirmDialog open={confirmClear} onOpenChange={setConfirmClear} danger title="Clear all files?" body="Removes every file from this queue and releases its in-memory preview." confirmLabel="Clear all" onConfirm={() => { releaseAllRuntime(); setFiles([]); toast("Queue cleared", "info"); }} />
    </div>
  );
}
