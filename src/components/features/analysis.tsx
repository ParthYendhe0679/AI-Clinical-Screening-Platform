"use client";
import * as React from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircleIcon, CircleNotchIcon, ClockIcon, WarningIcon, XCircleIcon, MinusCircleIcon, PlayIcon, PauseIcon, StopIcon, ArrowClockwiseIcon, ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { useStore } from "@/store";
import type { Case, StageStatus } from "@/lib/types";
import { BUDGETS, STAGES, deriveState, runDuration } from "@/lib/sim";
import { Badge, Button, Card, ProgressBar, Select, SimBadge, Tabs, LinkButtonClass, Checkbox, toast } from "@/components/ui";
import { MODELS, MODEL_BY_ID, CONDITIONS, CATEGORY_LABEL } from "@/data/models";
import { cn, formatDuration } from "@/lib/utils";
import { t, tl } from "@/lib/i18n";

const ST: Record<StageStatus, [string, string, React.ElementType]> = {
  waiting: ["Waiting", "bg-ink/5 text-muted", ClockIcon],
  in_progress: ["In progress", "bg-lavender-soft text-purple-deep", CircleNotchIcon],
  completed: ["Completed", "bg-success-soft text-success", CheckCircleIcon],
  needs_review: ["Needs review", "bg-warning-soft text-warning", WarningIcon],
  skipped: ["Skipped", "bg-ink/5 text-ink-soft", MinusCircleIcon],
  failed: ["Failed", "bg-danger-soft text-danger", XCircleIcon],
};
export function StageBadge({ s }: { s: StageStatus }) { const [l, c, I] = ST[s]; return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", c)}><I size={12} weight="fill" className={s === "in_progress" ? "animate-spin" : ""} aria-hidden />{l}</span>; }

export function AnalysisPanel({ c, patientLang = true }: { c: Case; patientLang?: boolean }) {
  const lang = useStore((s) => (patientLang ? s.lang : "en"));
  const { startRun, pauseRun, resumeRun, cancelRun, retryRun, budgetMb, setBudget } = useStore();
  const [tab, setTab] = React.useState<"timeline" | "plan" | "models" | "log">("timeline");
  const [fast, setFast] = React.useState(false); const [fail, setFail] = React.useState(false); const [bud, setBud] = React.useState(budgetMb);
  const run = c.run;
  if (!run) return (
    <Card className="p-6"><h2 className="text-lg font-bold">Analysis not started</h2><p className="mt-1 text-sm text-muted">Start the simulated analysis. No backend, no real AI — a timer-driven walkthrough of the pipeline.</p>
      <Button className="mt-4" onClick={() => startRun(c.id)}><PlayIcon size={18} weight="fill" aria-hidden />Start analysis</Button></Card>);
  const st = deriveState(run);
  const dur = runDuration(run) || 1;
  const plan = run.plan;
  const running = run.status === "running";
  const chart = st.ramSeries;
  return (
    <div className="space-y-4">
      <Card variant="sticker" className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold">{run.status === "completed" ? "Report ready" : run.status === "failed" ? "A step failed" : run.status === "cancelled" ? "Analysis cancelled" : run.status === "paused" ? "Paused" : t(lang, "progress.title")}</h2><SimBadge>Simulated pipeline</SimBadge></div>
            <p className="mt-1 text-sm text-muted" aria-live="polite">{running && st.patientMessage ? tl(lang, st.patientMessage) : `Elapsed ${formatDuration(run.elapsedMs)} of about ${formatDuration(dur)}${run.speed === "fast" ? " (fast ×4)" : ""}`}</p></div>
          <div className="flex flex-wrap gap-2">
            {run.status === "running" && <Button variant="secondary" size="sm" onClick={() => pauseRun(c.id)}><PauseIcon size={16} weight="fill" aria-hidden />Pause</Button>}
            {run.status === "paused" && <Button size="sm" onClick={() => resumeRun(c.id)}><PlayIcon size={16} weight="fill" aria-hidden />Resume</Button>}
            {["running", "paused"].includes(run.status) && <Button variant="danger" size="sm" onClick={() => { cancelRun(c.id); toast("Analysis cancelled", "warning"); }}><StopIcon size={16} weight="fill" aria-hidden />Cancel</Button>}
            {run.status === "failed" && <Button size="sm" onClick={() => { retryRun(c.id); toast("Retrying failed step", "info"); }}><ArrowClockwiseIcon size={16} weight="bold" aria-hidden />Retry failed step</Button>}
            {c.reportId && <Link href={`/patient/reports/${c.reportId}`} className={LinkButtonClass("primary", "sm")}>Open report</Link>}
          </div>
        </div>
        <div className="mt-4"><ProgressBar value={st.progress} label="Analysis progress" tone={run.status === "failed" ? "coral" : run.status === "completed" ? "mint" : "purple"} /></div>
        {run.status === "failed" && st.failed && <p role="alert" className="mt-3 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-danger">{st.failed.message}</p>}
        {run.status === "cancelled" && <p className="mt-3 rounded-xl bg-sun-soft p-3 text-sm">Cancelled. Use “Re-run” below to start again from a clean state.</p>}
      </Card>

      <Tabs label="Analysis views" value={tab} onChange={setTab} tabs={[{ key: "timeline", label: "Timeline" }, { key: "plan", label: "Model plan" }, { key: "models", label: "Resources" }, { key: "log", label: "Log" }]} />

      {tab === "timeline" && <Card variant="bento" className="p-4"><ol className="space-y-2">{STAGES.map((s) => { const x = st.stages[s.key]; return (
        <li key={s.key} className={cn("flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2", x.status === "in_progress" && "bg-lavender-soft")}><span className="text-sm font-semibold">{s.label}</span><span className="flex items-center gap-3"><span className="tabular font-mono text-[11px] text-muted">{x.startAt !== undefined ? `+${formatDuration(x.startAt)}` : ""}{x.endAt !== undefined && x.startAt !== undefined ? ` · ${((x.endAt - x.startAt) / 1000).toFixed(1)}s` : ""}</span><StageBadge s={x.status} /></span></li>); })}</ol></Card>}

      {tab === "plan" && <div className="space-y-4">
        <Card variant="bento" className="p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-base font-bold">Selected models, in order</h3><SimBadge /></div>
          <p className="mt-1 text-xs text-muted">Urgency (fixed demo value): {plan.urgency.level} — {plan.urgency.note}</p>
          <ol className="mt-3 space-y-2">{plan.steps.map((s) => <li key={s.order} className="rounded-xl bg-canvas p-3 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><b>{s.order}. {MODEL_BY_ID[s.modelId].name}</b><Badge tone={s.ruleKind === "fixed_rule" ? "sky" : s.ruleKind === "router_demo" ? "lavender" : "sun"}>{s.ruleKind.replace("_", " ")}</Badge></div><p className="text-xs text-muted">Input: {s.input}</p><p className="text-xs">Why: {s.reason}</p></li>)}</ol></Card>
        <Card variant="bento" className="p-4"><h3 className="text-base font-bold">Skipped models — and why</h3><ul className="mt-3 space-y-1.5 text-sm">{plan.skipped.map((s) => <li key={s.modelId} className="flex flex-wrap justify-between gap-2 rounded-xl bg-canvas px-3 py-2"><b>{MODEL_BY_ID[s.modelId].name}</b><span className="text-xs text-muted">{s.reason}</span></li>)}</ul>
          {plan.excludedFiles.length > 0 && <><h4 className="mt-4 text-sm font-bold">Files not analysed</h4><ul className="mt-1 text-xs text-muted">{plan.excludedFiles.map((e) => <li key={e.fileId}>{e.name} — {e.reason}</li>)}</ul></>}</Card></div>}

      {tab === "models" && <Card variant="bento" className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-base font-bold">Simulated RAM use vs budget ({run.budgetMb} MB)</h3><SimBadge>Illustrative sizes</SimBadge></div>
        <div className="mt-3 h-52 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{ left: -10, right: 8, top: 8 }}>
          <defs><linearGradient id="ram" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7b5cf0" stopOpacity={0.35} /><stop offset="100%" stopColor="#7b5cf0" stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid stroke="#eef1f6" vertical={false} /><XAxis dataKey="t" tick={{ fontSize: 11 }} unit="s" /><YAxis tick={{ fontSize: 11 }} unit="MB" domain={[0, Math.max(run.budgetMb, 100)]} />
          <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #e3e7ef", boxShadow: "0 8px 24px -12px rgba(28,27,43,.25)", fontSize: 12 }} cursor={{ fill: "#f5f1e8" }} />
          <ReferenceLine y={run.budgetMb} stroke="#c93535" strokeDasharray="4 4" label={{ value: "budget", fontSize: 10, fill: "#c93535" }} />
          <Area type="stepAfter" dataKey="ram" stroke="#7b5cf0" strokeWidth={2} fill="url(#ram)" /></AreaChart></ResponsiveContainer></div>
        <p className="tabular mt-2 text-sm">In memory now: <b>{st.ramMb} MB</b> · loaded: {st.loaded.length ? st.loaded.map((l) => MODEL_BY_ID[l].name.split(" (")[0]).join(", ") : "none"} · cache hits: {run.events.filter((e) => e.type === "cache_hit" && e.at <= run.elapsedMs).length}</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">{Object.entries(st.modelStatus).map(([id, s]) => <li key={id} className="flex items-center justify-between rounded-xl bg-canvas px-3 py-2 text-xs"><span className="font-semibold">{MODEL_BY_ID[id].name.split(" (")[0]}</span><Badge tone={s === "running" ? "purple" : s === "done" ? "mint" : s === "cached" ? "sky" : s === "failed" ? "pink" : "ink"}>{s}</Badge></li>)}</ul></Card>}

      {tab === "log" && <Card variant="bento" className="p-4"><h3 className="text-base font-bold">Execution log (simulated)</h3><ol className="mt-3 max-h-80 space-y-1 overflow-y-auto font-mono text-[11px]" tabIndex={0} aria-label="Execution log">{st.logs.map((e, i) => <li key={i} className="flex gap-2"><span className="tabular shrink-0 text-muted">{formatDuration(e.at)}</span><span className={cn(e.type === "fail" && "font-bold text-danger", e.type === "cache_hit" && "text-sky-deep", e.type === "light_switch" && "text-sun-deep")}>{e.message}</span></li>)}</ol></Card>}

      {run.status !== "running" && run.status !== "paused" && (
        <Card variant="flat" className="p-4"><h3 className="text-sm font-bold">Re-run with controlled settings</h3>
          <div className="mt-3 flex flex-wrap items-end gap-4"><label className="text-xs font-semibold">RAM budget (simulated)<Select className="mt-1 h-10" value={bud} onChange={(e) => { setBud(Number(e.target.value)); setBudget(Number(e.target.value)); }}>{BUDGETS.map((b) => <option key={b} value={b}>{b} MB</option>)}</Select></label>
            <Checkbox id="fast" checked={fast} onChange={setFast} label="Fast (×4)" /><Checkbox id="fail" checked={fail} onChange={setFail} label="Inject a failure (to test retry)" />
            <Button variant="outline" onClick={() => { startRun(c.id, { speed: fast ? "fast" : "normal", injectFailure: fail, budgetMb: bud }); toast("Analysis restarted", "info"); }}><ArrowCounterClockwiseIcon size={16} weight="bold" aria-hidden />Re-run</Button></div>
          <p className="mt-2 text-xs text-muted">Try 384 MB: the loader switches the chest model to its int8 light version and unloads least-recently-used models.</p></Card>)}
    </div>
  );
}

/** Model catalog / orchestration inspection (project doc §12–14). */
export function ModelCatalogView() {
  const cases = useStore((s) => s.cases);
  const latest = cases.find((c) => c.run);
  const selected = new Set(latest?.run?.plan.steps.map((s) => s.modelId));
  const skip = new Map(latest?.run?.plan.skipped.map((s) => [s.modelId, s.reason]));
  return (
    <div className="space-y-6">
      <Card variant="bento" className="p-5"><h2 className="text-lg font-bold">Seven conditions across six body areas</h2><p className="mt-1 text-sm text-muted">Transcribed from the project document. Selection status below reflects the most recent simulated case{latest ? ` (${latest.id})` : ""}. Nothing here runs a real model.</p>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr className="bg-canvas text-left text-[11px] uppercase tracking-wider text-muted"><th className="px-3 py-2">#</th><th className="px-3 py-2">Area</th><th className="px-3 py-2">Screens for</th><th className="px-3 py-2">Input</th><th className="px-3 py-2">Model plan</th></tr></thead><tbody>{CONDITIONS.map((c) => <tr key={c.n} className="border-t border-line align-top"><td className="px-3 py-2">{c.n}</td><td className="px-3 py-2 font-semibold">{c.areaLabel}</td><td className="px-3 py-2">{c.screen}</td><td className="px-3 py-2">{c.input}</td><td className="px-3 py-2 text-muted">{c.plan}</td></tr>)}</tbody></table></div></Card>
      <div className="grid gap-3 md:grid-cols-2">{MODELS.map((m) => <Card key={m.id} variant="bento" className="p-4"><div className="flex flex-wrap items-start justify-between gap-2"><p className="text-sm font-bold">{m.name}</p><SimBadge>{m.resource} · ~{m.ramMb} MB</SimBadge></div>
        <p className="mt-1 text-xs text-muted">{m.modality} · {m.bodyArea} · v{m.version}</p><p className="mt-2 text-sm">{m.task}</p><p className="mt-1 text-xs">Requires: {m.inputs.map((i) => CATEGORY_LABEL[i]).join(", ")}{m.encoder ? ` · shared encoder` : ""}{m.lightId ? ` · light: ${m.lightId}` : ""}</p>
        {m.caveat && <p className="mt-1 text-xs text-sun-deep">Limit: {m.caveat}</p>}
        <p className="mt-2 text-xs font-semibold">{latest?.run ? (selected.has(m.id) ? <span className="text-success">Selected for case {latest.id}</span> : <span className="text-muted">Skipped: {skip.get(m.id) ?? "not needed"}</span>) : "No case analysed yet"}</p></Card>)}</div>
    </div>
  );
}
