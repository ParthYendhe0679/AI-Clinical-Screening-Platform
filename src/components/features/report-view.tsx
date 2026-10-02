"use client";
import * as React from "react";
import Link from "next/link";
import { PrinterIcon, SpeakerHighIcon, StopIcon, StethoscopeIcon, ArrowLeftIcon, WarningIcon, CheckCircleIcon, QuestionIcon, ProhibitIcon } from "@phosphor-icons/react";
import type { ConsistencyItem, EvidenceRef, Finding, Lang, Report, SourceKind } from "@/lib/types";
import { Badge, Button, Card, Disclaimer, LinkButtonClass, Sheet, SimBadge, UrgentAlert, toast } from "@/components/ui";
import { t, tl, isFallback, DICT } from "@/lib/i18n";
import { cn, formatDate, pct } from "@/lib/utils";
import { MODEL_BY_ID } from "@/data/models";
import { DOC_BY_ID, GUIDELINE_BY_ID } from "@/data/docs";
import { SourceDocView, XraySample, EcgSample } from "./docs";
import { speak, stopSpeech, voiceStatus } from "@/lib/speech";
import { useStore } from "@/store";

export const SRC: Record<SourceKind, { label: string; cls: string }> = {
  model: { label: "MODEL", cls: "bg-sky-soft text-sky-deep border-sky-deep/40" },
  record: { label: "RECORD", cls: "bg-mint-soft text-mint-deep border-mint-deep/40" },
  guideline: { label: "GUIDELINE", cls: "bg-lavender-soft text-purple-deep border-purple-deep/40" },
  summary: { label: "AI SUMMARY", cls: "bg-ink/10 text-ink-soft border-ink/30" },
};
export const SourceTag = ({ kind, onClick }: { kind: SourceKind; onClick?: () => void }) => (
  <button type="button" onClick={onClick} aria-label={`${SRC[kind].label} source — open evidence`} className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-extrabold tracking-wider transition hover:-translate-y-0.5 hover:shadow-pop", SRC[kind].cls)}>{SRC[kind].label}</button>
);

const RISK_STYLE = { normal: ["mint", CheckCircleIcon], show_doctor: ["sun", StethoscopeIcon], see_soon: ["coral", WarningIcon], not_sure: ["ink", QuestionIcon] } as const;
export function RiskBadge({ risk, lang }: { risk?: Finding["risk"]; lang: Lang }) {
  if (!risk) return null; const [tone, Icon] = RISK_STYLE[risk];
  return <Badge tone={tone as "mint"} icon={<Icon size={12} weight="fill" aria-hidden />}>{t(lang, `risk.${risk}`)}</Badge>;
}
const KSTAT: Record<ConsistencyItem["status"], [string, string]> = { consistent: ["Consistent in demo data", "mint"], conflicting: ["Conflicting evidence", "coral"], insufficient: ["Insufficient information", "sun"], review: ["Requires professional review", "pink"] };
export const ConsistencyBadge = ({ s }: { s: ConsistencyItem["status"] }) => <Badge tone={KSTAT[s][1] as "mint"}>{KSTAT[s][0]}</Badge>;
const DOMAIN_LABEL: Record<string, string> = { lungs: "Lungs", heart: "Heart", brain: "Brain", skin: "Skin", kidney: "Kidney", blood: "Blood / labs", history: "History & summary" };

/* ---------------- Evidence inspector ---------------- */
export function EvidenceInspector({ finding, report, open, onOpenChange }: { finding?: Finding; report: Report; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!finding) return null;
  const related = report.consistency.filter((k) => k.between.includes(finding.id));
  return (
    <Sheet open={open} onOpenChange={onOpenChange} wide title="Evidence inspector" description="Where this line came from. All model values are fixed illustrative demo data.">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2"><SourceTag kind={finding.source} /><RiskBadge risk={finding.risk} lang="en" />{finding.date && <Badge>{formatDate(finding.date)}</Badge>}</div>
        <p className="rounded-2xl bg-white p-4 text-sm font-medium shadow-clay-sm">{finding.doctorText}</p>
        {finding.evidence.map((e, i) => <EvidenceItem key={i} e={e} f={finding} report={report} />)}
        {finding.uncertainty && <div className="rounded-2xl border-2 border-dashed border-sun-deep/50 bg-sun-soft p-3 text-sm"><b>Uncertainty:</b> {finding.uncertainty}</div>}
        {finding.missing && <div className="rounded-2xl bg-pink-soft p-3 text-sm"><b>Missing:</b> {finding.missing}</div>}
        {related.map((k) => <div key={k.id} className="rounded-2xl bg-white p-3 text-sm shadow-clay-sm"><ConsistencyBadge s={k.status} /><p className="mt-1 font-semibold">{k.title}</p><p className="text-muted">{k.doctorText}</p></div>)}
        {finding.source === "summary" && <p className="text-xs text-muted">An AI summary is always linked to at least one MODEL, RECORD or GUIDELINE source (project rule). Unsupported lines are removed by the Source Check.</p>}
      </div>
    </Sheet>
  );
}
function EvidenceItem({ e, f, report }: { e: EvidenceRef; f: Finding; report: Report }) {
  if (e.kind === "model_output") {
    const m = MODEL_BY_ID[e.modelId];
    return <div className="rounded-2xl border-2 border-ink bg-white p-4 shadow-pop"><div className="flex items-center justify-between gap-2"><p className="text-sm font-bold">Model output</p><SimBadge /></div>
      <p className="mt-1 text-sm">{m ? `${m.name} · v${m.version}` : "Template (no model output)"}</p>
      {f.confidence !== undefined && <p className="tabular text-sm">Confidence: <b>{pct(f.confidence)}</b> <span className="text-muted">(fixed illustrative demo value)</span></p>}
      {m?.trainedOn && <p className="text-xs text-muted">Trained on (per project doc): {m.trainedOn}</p>}
      {m?.caveat && <p className="mt-1 text-xs text-sun-deep">Known limit: {m.caveat}</p>}</div>;
  }
  if (e.kind === "document") { const d = DOC_BY_ID[e.docId]; return d ? <SourceDocView doc={d} lineId={e.lineId} /> : null; }
  if (e.kind === "guideline") { const g = GUIDELINE_BY_ID[e.guidelineId]; return g ? <div className="rounded-2xl border-2 border-dashed border-purple-deep/40 bg-lavender-soft p-4 text-sm"><Badge tone="sun">Illustrative demo evidence</Badge><p className="mt-2 font-semibold">{g.text}</p><p className="mt-1 text-xs text-muted">{g.sourceName}. {g.note}</p></div> : null; }
  const ref = report.findings.find((x) => x.id === e.findingId);
  return ref ? <div className="rounded-2xl bg-white p-3 text-sm shadow-clay-sm"><SourceTag kind={ref.source} /><p className="mt-1">{ref.doctorText}</p></div> : null;
}

/* ---------------- Narration ---------------- */
export function narrationText(r: Report, lang: Lang) {
  const parts = [t(lang, "disclaimer.title"), r.urgent ? tl(lang, r.urgent.title) : "", r.urgent?.call108 ? t(lang, "report.urgentCall") : "", tl(lang, r.nextStep), ...r.findings.filter((f) => f.source !== "guideline").map((f) => tl(lang, f.patientText))];
  return parts.filter(Boolean).join(" ");
}
export function ListenButton({ text, lang, label }: { text: string; lang: Lang; label?: string }) {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => () => stopSpeech(), []);
  const vs = voiceStatus(lang);
  return (
    <div className="inline-flex flex-col gap-1">
      <Button variant={on ? "danger" : "purple"} onClick={async () => { if (on) { stopSpeech(); setOn(false); return; } if (!vs.supported) { toast("No speech support", "warning", vs.message); return; } if (!vs.hasVoice) toast("Voice note", "warning", vs.message); setOn(true); const r = await speak(text, lang, { onEnd: () => setOn(false) }); if (!r.ok) { toast("Narration failed", "error", r.reason); } setOn(false); }}>
        {on ? <><StopIcon size={18} weight="fill" aria-hidden />{t(lang, "common.stop")}</> : <><SpeakerHighIcon size={18} weight="bold" aria-hidden />{label ?? t(lang, "report.listen")}</>}
      </Button>
    </div>
  );
}

/* ---------------- Patient report ---------------- */
export function PatientReport({ report }: { report: Report }) {
  const lang = useStore((s) => s.lang);
  const [sel, setSel] = React.useState<Finding>();
  const patient = useStore((s) => s.patients.find((p) => p.id === report.patientId));
  const groups = Object.keys(DOMAIN_LABEL).map((d) => ({ d, items: report.findings.filter((f) => f.domain === d && f.source !== "summary") })).filter((g) => g.items.length);
  const summary = report.findings.find((f) => f.source === "summary");
  const fb = report.findings.some((f) => isFallback(lang, f.patientText));
  return (
    <div className="space-y-5 print-plain">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-extrabold sm:text-3xl">{t(lang, "report.title")}</h1><p className="text-sm text-muted">Case {report.caseId} · {patient?.name} ({patient?.code}) · {formatDate(report.createdAt)} · Report ready</p></div>
        <div className="no-print flex flex-wrap gap-2"><ListenButton text={narrationText(report, lang)} lang={lang} /><Link href={`/patient/reports/${report.id}/doctor`} className={LinkButtonClass("primary")}><StethoscopeIcon size={18} aria-hidden />{t(lang, "report.showDoctor")}</Link><Button variant="outline" onClick={() => window.print()}><PrinterIcon size={18} aria-hidden />{t(lang, "report.pdf")}</Button></div></div>
      <div className="flex flex-wrap items-center gap-2"><SimBadge>Demo · simulated results</SimBadge>{report.mode === "template" && <Badge tone="coral">Template: your own files were not analysed</Badge>}</div>
      <Disclaimer lang={lang} />
      {report.urgent && <UrgentAlert title={tl(lang, report.urgent.title)} reason={tl(lang, report.urgent.reason)} call108={report.urgent.call108} callText={t(lang, "report.urgentCall")} />}
      {fb && <p className="rounded-xl bg-sky-soft p-3 text-xs font-medium text-sky-deep">Some lines in this report only exist in English; they are shown in English.</p>}
      <Card className="p-5"><h2 className="text-lg font-bold">{t(lang, "report.next")}</h2><p className="mt-1 text-base font-semibold">{tl(lang, report.nextStep)}</p>{summary && <p className="mt-3 flex items-start gap-2 text-sm text-ink-soft"><SourceTag kind="summary" onClick={() => setSel(summary)} />{tl(lang, summary.patientText)}</p>}</Card>
      <section aria-labelledby="found"><h2 id="found" className="mb-3 text-lg font-bold">{t(lang, "report.found")}</h2>
        <div className="space-y-4">{groups.map((g) => (
          <Card key={g.d} variant="bento" className="p-5"><h3 className="text-base font-bold">{DOMAIN_LABEL[g.d]}</h3>
            <ul className="mt-3 space-y-3">{g.items.map((f) => (
              <li key={f.id} className="flex flex-col gap-1.5 border-t border-line pt-3 first:border-0 first:pt-0"><div className="flex flex-wrap items-center gap-2"><SourceTag kind={f.source} onClick={() => setSel(f)} /><RiskBadge risk={f.risk} lang={lang} />{f.confidence !== undefined && f.source === "model" && <span className="tabular text-xs font-semibold text-muted">{t(lang, "report.sure", { n: Math.round(f.confidence * 100) })} · <em>illustrative</em></span>}</div>
                <p className="text-[15px] leading-relaxed">{tl(lang, f.patientText)}</p>
                <button className="no-print w-fit text-xs font-semibold text-purple-deep underline" onClick={() => setSel(f)}>See evidence</button></li>))}</ul></Card>))}</div></section>
      <Card className="p-5"><h2 className="text-lg font-bold">{t(lang, "report.agree")}</h2>
        <ul className="mt-3 space-y-3">{report.consistency.map((k) => <li key={k.id} className="rounded-2xl bg-canvas p-3"><ConsistencyBadge s={k.status} /><p className="mt-1 text-sm">{tl(lang, k.patientText)}</p></li>)}</ul></Card>
      {report.uncertainties.length > 0 && report.mode === "scenario" && <Card className="p-5"><h2 className="text-lg font-bold">{t(lang, "report.notSure")}</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{report.uncertainties.map((u) => <li key={u.id}>{tl(lang, u.patientText)}</li>)}</ul></Card>}
      <div className="no-print flex flex-wrap gap-2"><Link href={`/patient/cases/${report.caseId}`} className={LinkButtonClass("secondary")}><ArrowLeftIcon size={16} aria-hidden />Return to case</Link><Link href="/patient/history" className={LinkButtonClass("soft")}>{t(lang, "dash.prevVisit")}</Link><Link href="/patient/upload" className={LinkButtonClass("outline")}>Start another case</Link></div>
      <Disclaimer lang={lang} />
      <EvidenceInspector finding={sel} report={report} open={!!sel} onOpenChange={(o) => !o && setSel(undefined)} />
    </div>
  );
}

/* ---------------- Doctor report ---------------- */
export function DoctorReport({ report, backHref, patientView }: { report: Report; backHref: string; patientView?: string }) {
  const [sel, setSel] = React.useState<Finding>();
  const patient = useStore((s) => s.patients.find((p) => p.id === report.patientId));
  const c = useStore((s) => s.cases.find((x) => x.id === report.caseId));
  return (
    <div className="space-y-5 print-plain">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-extrabold sm:text-3xl">Detailed report — for the doctor</h1><p className="text-sm text-muted">Case {report.caseId} · {patient?.name}, {patient?.age}{patient?.sex} ({patient?.code}) · generated {formatDate(report.createdAt)}</p></div>
        <div className="no-print flex flex-wrap gap-2">{patientView && <Link href={patientView} className={LinkButtonClass("secondary")}><ArrowLeftIcon size={16} aria-hidden />Patient-friendly view</Link>}<Link href={backHref} className={LinkButtonClass("soft")}>Back to case</Link><Button variant="primary" onClick={() => window.print()}><PrinterIcon size={18} aria-hidden />Print / save as PDF</Button></div></div>
      <div className="flex flex-wrap gap-2"><SimBadge>Illustrative demo values · no real model ran</SimBadge>{report.mode === "template" && <Badge tone="coral">Template report</Badge>}<Badge tone="ink">Urgency (demo): {report.urgency}</Badge></div>
      <Disclaimer />
      {report.urgent && <UrgentAlert title={report.urgent.title.en} reason={report.urgent.reason.en} call108={report.urgent.call108} />}
      <Card variant="bento" className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="bg-canvas text-left text-[11px] uppercase tracking-wider text-muted"><th className="px-4 py-3">Source</th><th className="px-4 py-3">Finding</th><th className="px-4 py-3">Model / version</th><th className="px-4 py-3">Conf.*</th><th className="px-4 py-3">Date</th></tr></thead>
        <tbody>{report.findings.map((f) => <tr key={f.id} className="cursor-pointer border-t border-line align-top hover:bg-canvas/60" onClick={() => setSel(f)}><td className="px-4 py-3"><SourceTag kind={f.source} onClick={() => setSel(f)} /></td><td className="px-4 py-3">{f.doctorText}{f.uncertainty && <p className="mt-1 text-xs text-sun-deep">Uncertainty: {f.uncertainty}</p>}</td><td className="px-4 py-3 text-xs">{f.modelId && MODEL_BY_ID[f.modelId] ? `${f.modelId} v${MODEL_BY_ID[f.modelId].version}` : "—"}</td><td className="tabular px-4 py-3">{pct(f.confidence)}</td><td className="px-4 py-3 text-xs">{formatDate(f.date)}</td></tr>)}</tbody></table></div>
        <p className="border-t border-line px-4 py-2 text-[11px] text-muted">*Fixed illustrative demo values, not measured or calibrated performance.</p></Card>
      <Card className="p-5"><h2 className="text-lg font-bold">Cross-result consistency</h2><ul className="mt-3 space-y-2">{report.consistency.map((k) => <li key={k.id} className="rounded-2xl bg-canvas p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><ConsistencyBadge s={k.status} /><b>{k.title}</b></div><p className="mt-1 text-muted">{k.doctorText}</p></li>)}</ul></Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="bento" className="p-5"><h2 className="flex items-center gap-2 text-base font-bold"><ProhibitIcon size={18} aria-hidden />Removed by Source Check (simulated)</h2>{report.removedBySourceCheck.length ? <ul className="mt-2 space-y-2 text-sm">{report.removedBySourceCheck.map((x, i) => <li key={i} className="rounded-xl bg-pink-soft p-2"><s>{x.text}</s><p className="text-xs text-muted">{x.reason}</p></li>)}</ul> : <p className="mt-2 text-sm text-muted">Nothing removed (template report).</p>}</Card>
        <Card variant="bento" className="p-5"><h2 className="text-base font-bold">Missing data & uncertainty</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{report.missingData.map((m) => <li key={m}>{m}</li>)}{report.uncertainties.map((u) => <li key={u.id}>{u.doctorText}</li>)}</ul></Card>
      </div>
      <Card variant="bento" className="p-5"><h2 className="text-base font-bold">Models used</h2><ul className="mt-2 flex flex-wrap gap-2">{report.modelsRun.map((m) => <li key={m.modelId} className="rounded-full bg-canvas px-3 py-1 text-xs font-semibold">{m.modelId} · v{m.version}{m.cached ? " · cache hit" : ""}</li>)}</ul></Card>
      {c && c.files.length > 0 && <Card variant="bento" className="p-5"><h2 className="text-base font-bold">Source files in this case</h2><ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2">{c.files.map((f) => <li key={f.id} className="rounded-xl bg-canvas p-2">{f.name}<span className="block text-xs text-muted">{f.category} · {f.status}{f.excluded ? " · excluded" : ""}</span></li>)}</ul></Card>}
      <div className="grid gap-4 md:grid-cols-2 print-break-avoid">{report.findings.some((f) => f.id === "f_cxr") && <div><p className="mb-1 text-xs font-bold">Chest X-ray (fictional) with illustrative region of interest</p><XraySample highlight /></div>}{report.findings.some((f) => f.id === "f_ecg") && <div><p className="mb-1 text-xs font-bold">ECG (fictional) with illustrative region</p><EcgSample highlight /></div>}</div>
      <Disclaimer />
      <EvidenceInspector finding={sel} report={report} open={!!sel} onOpenChange={(o) => !o && setSel(undefined)} />
    </div>
  );
}
void DICT;
