import type { AnalysisRun, Case, CaseFile, OrchestrationPlan, PlanStep, SimEvent, StageKey, StageStatus } from "./types";
import { MODELS, MODEL_BY_ID, modelsForCategory, CATEGORY_LABEL } from "@/data/models";
import { DICT } from "./i18n";

/** Everything here is a SIMULATION driven by timers. No model is loaded or executed. */

export const STAGES: { key: StageKey; label: string }[] = [
  { key: "init", label: "Case initialization" },
  { key: "inventory", label: "File inventory" },
  { key: "validation", label: "File validation" },
  { key: "classify", label: "Modality classification" },
  { key: "select", label: "Relevant-model selection" },
  { key: "resources", label: "Resource allocation" },
  { key: "execute", label: "Model execution" },
  { key: "history", label: "Patient-history retrieval" },
  { key: "evidence", label: "Evidence association" },
  { key: "consistency", label: "Cross-result consistency check" },
  { key: "assemble", label: "Screening-report assembly" },
  { key: "safety", label: "Final safety review" },
  { key: "ready", label: "Report ready" },
];

export const BUDGETS = [2048, 1024, 512, 384];

export function includedFiles(files: CaseFile[]) {
  return files.filter((f) => !f.excluded && (f.status === "ready" || (f.status === "needs_review" && f.category !== "unknown")));
}

export function buildPlan(c: Pick<Case, "id" | "files">, budgetMb: number): OrchestrationPlan {
  const files = includedFiles(c.files);
  const excludedFiles = c.files
    .filter((f) => !files.includes(f))
    .map((f) => ({ fileId: f.id, name: f.name, reason: f.excluded ? "Excluded by you (e.g. retake requested)" : f.status === "needs_review" ? "Category unknown — needs review" : `File ${f.status}` }));
  const steps: PlanStep[] = [];
  const imageFile = files.find((f) => ["xray", "mri", "ct", "skin_photo"].includes(f.category));
  if (imageFile) steps.push({ order: 0, modelId: "biomedclip_encoder", input: imageFile.name, fileId: imageFile.id, reason: "Shared image encoder — always first for image files", ruleKind: "fixed_rule" });
  const prio: Record<string, number> = { xray: 0, ecg: 1, lab_report: 2, mri: 3, ct: 4, skin_photo: 5, prescription: 6, clinical_note: 7 };
  const sorted = [...files].sort((a, b) => (prio[a.category] ?? 9) - (prio[b.category] ?? 9));
  for (const f of sorted) {
    for (const m of modelsForCategory(f.category)) {
      const ruleKind = m === "ecg_resnet1d_int8" ? "router_demo" : "fixed_rule";
      const reason = m === "ecg_resnet1d_int8" ? "Router (simulated): needs_ecg_review = 0.93 — fixed demo value; ECG file present" : `Fixed rule: ${CATEGORY_LABEL[f.category]} file`;
      steps.push({ order: 0, modelId: m, input: f.name, fileId: f.id, reason, ruleKind });
      if (m === "brain_mri_head") steps.push({ order: 0, modelId: "brain_effnet_b0_int8", input: f.name, fileId: f.id, reason: "Cascade: tiny head result 'not sure' (simulated fixed outcome) → load confirmer", ruleKind: "cascade" });
    }
  }
  steps.forEach((s, i) => (s.order = i + 1));
  const used = new Set(steps.map((s) => s.modelId));
  const skipped = MODELS.filter((m) => !used.has(m.id)).map((m) => {
    let reason = `No ${m.modality} file in this case`;
    if (m.id === "brain_mri_head") reason += " · router (simulated): neuro_symptoms = 0.04, fixed demo value";
    if (m.id === "cxr_densenet121_int8") reason = "Standby light version — used only if the fp32 model does not fit the RAM budget";
    if (m.id === "brain_effnet_b0_int8") reason = "Cascade confirmer — only loaded if the brain head is unsure";
    if (m.id === "cxr_densenet121" || m.id === "tb_head") reason = "No chest X-ray in this case";
    return { modelId: m.id, reason };
  });
  const hasChest = files.some((f) => f.category === "xray");
  return {
    caseId: c.id,
    urgency: { level: hasChest ? "high" : "low", note: "Urgency level is a fixed demo value (simulated router), not computed from your files." },
    ramBudgetMb: budgetMb,
    steps,
    skipped,
    excludedFiles,
  };
}

const pm = (key: string) => DICT[key];

interface Opts { hasHistory: boolean; hasConflict: boolean; injectFailure: boolean; hasReview: boolean }

export function buildTimeline(plan: OrchestrationPlan, files: CaseFile[], o: Opts): SimEvent[] {
  const ev: SimEvent[] = [];
  let t = 0;
  const start = (stage: StageKey, message: string, patientMessage?: SimEvent["patientMessage"]) => ev.push({ at: t, type: "stage_start", stage, message, patientMessage });
  const log = (stage: StageKey, message: string, extra: Partial<SimEvent> = {}) => ev.push({ at: t, type: "log", stage, message, ...extra });
  const end = (stage: StageKey, status: StageStatus = "completed", message = "") => ev.push({ at: t, type: "stage_end", stage, status, message: message || `${STAGES.find((s) => s.key === stage)!.label}: ${status}` });
  const inc = includedFiles(files);

  start("init", "Creating case record (simulated)"); t += 1200; log("init", `Case ${plan.caseId} initialised`); t += 300; end("init");
  start("inventory", `Listing ${files.length} file(s)`); t += 800;
  files.forEach((f) => { log("inventory", `${f.name} — ${CATEGORY_LABEL[f.category]}`); t += 250; }); end("inventory");
  const needsReview = files.some((f) => f.status === "needs_review" && !f.excluded);
  start("validation", "Checking format, body area and quality (simulated)"); t += 1500;
  files.forEach((f) => log("validation", `${f.name}: ${f.excluded ? "excluded — retake requested" : f.status}`)); t += 1000; end("validation", needsReview ? "needs_review" : "completed");
  start("classify", "Matching files to modality categories (rule-based demo, shared-encoder concept)"); t += 2400; end("classify", inc.some((f) => f.category === "unknown") ? "needs_review" : "completed");
  start("select", "Selecting models: fixed rules → router (simulated) → no LLM planner needed", pm("progress.xray")); t += 1200;
  plan.steps.forEach((s) => { log("select", `RUN ${MODEL_BY_ID[s.modelId].name} ← ${s.input}: ${s.reason}`); t += 350; });
  plan.skipped.filter((s) => !s.reason.startsWith("Standby")).forEach((s) => { log("select", `SKIP ${MODEL_BY_ID[s.modelId].name}: ${s.reason}`); t += 120; });
  end("select");
  start("resources", `Budget ${plan.ramBudgetMb} MB (simulated). Strategy: shared encoder, int8, LRU, cache, cascade`); t += 1800; end("resources");

  start("execute", "Running models one after another within the budget (simulated)", pm("progress.xray"));
  const loaded: string[] = [];
  const ram = () => loaded.reduce((a, id) => a + MODEL_BY_ID[id].ramMb, 0);
  const cache = new Set(inc.filter((f) => f.sample && f.docId && ["d_lab_0610", "d_lab_0312"].includes(f.docId)).map((f) => `${f.id}:lab_rules`));
  let failedNow = false;
  for (let i = 0; i < plan.steps.length && !failedNow; i++) {
    const s = plan.steps[i];
    let id = s.modelId;
    const m0 = MODEL_BY_ID[id];
    if (cache.has(`${s.fileId}:${id}`)) {
      ev.push({ at: t, type: "cache_hit", stage: "execute", modelId: id, message: `CACHE HIT ${m0.name} for ${s.input} (key = file hash + model version) — not re-run`, ramMb: ram(), loaded: [...loaded] }); t += 600; continue;
    }
    if (!loaded.includes(id)) {
      const keep = new Set(plan.steps.slice(i + 1).map((x) => x.modelId).concat(["biomedclip_encoder", id]));
      let need = MODEL_BY_ID[id].ramMb;
      const evict = () => { for (const l of [...loaded]) { if (ram() + need <= plan.ramBudgetMb) break; if (keep.has(l)) continue; loaded.splice(loaded.indexOf(l), 1); ev.push({ at: t, type: "model_unload", stage: "execute", modelId: l, message: `UNLOAD ${MODEL_BY_ID[l].name} (least recently used, not needed again)`, ramMb: ram(), loaded: [...loaded] }); t += 400; } };
      evict();
      if (ram() + need > plan.ramBudgetMb && m0.lightId) {
        ev.push({ at: t, type: "light_switch", stage: "execute", modelId: m0.lightId, message: `Not enough RAM for ${m0.name} (${m0.ramMb} MB) → switching to light version ${MODEL_BY_ID[m0.lightId].name}`, ramMb: ram(), loaded: [...loaded] }); t += 500;
        id = m0.lightId; need = MODEL_BY_ID[id].ramMb; evict();
      }
      loaded.push(id);
      ev.push({ at: t, type: "model_load", stage: "execute", modelId: id, message: `LOAD ${MODEL_BY_ID[id].name} (~${MODEL_BY_ID[id].ramMb} MB, illustrative)`, ramMb: ram(), loaded: [...loaded] }); t += 900;
    } else {
      ev.push({ at: t, type: "log", stage: "execute", modelId: id, message: `${MODEL_BY_ID[id].name} already loaded — reusing`, ramMb: ram(), loaded: [...loaded] }); t += 200;
    }
    const nxt = plan.steps[i + 1];
    if (nxt && !loaded.includes(nxt.modelId) && ram() + MODEL_BY_ID[nxt.modelId].ramMb <= plan.ramBudgetMb && !cache.has(`${nxt.fileId}:${nxt.modelId}`))
      ev.push({ at: t, type: "prefetch", stage: "execute", modelId: nxt.modelId, message: `PREFETCH ${MODEL_BY_ID[nxt.modelId].name} in background (free RAM available)`, ramMb: ram(), loaded: [...loaded] });
    const pmsg = s.modelId.includes("ecg") ? pm("progress.ecg") : s.modelId === "lab_rules" ? pm("progress.lab") : pm("progress.xray");
    ev.push({ at: t, type: "model_run", stage: "execute", modelId: id, message: `RUN ${MODEL_BY_ID[id].name} on ${s.input}`, patientMessage: pmsg, ramMb: ram(), loaded: [...loaded] }); t += 2200;
    if (o.injectFailure && i === 1) { ev.push({ at: t, type: "fail", stage: "execute", modelId: id, message: `FAILED ${MODEL_BY_ID[id].name}: simulated timeout (injected for the demo). Retry is available.`, ramMb: ram(), loaded: [...loaded] }); failedNow = true; break; }
    ev.push({ at: t, type: "model_done", stage: "execute", modelId: id, message: s.modelId === "tb_head" ? `DONE ${MODEL_BY_ID[id].name}: low risk → TB specialist not loaded (cascade)` : `DONE ${MODEL_BY_ID[id].name} (illustrative output)`, ramMb: ram(), loaded: [...loaded] }); t += 300;
  }
  if (failedNow) return ev;
  loaded.filter((l) => l !== "biomedclip_encoder").forEach((l) => { loaded.splice(loaded.indexOf(l), 1); ev.push({ at: t, type: "model_unload", stage: "execute", modelId: l, message: `UNLOAD ${MODEL_BY_ID[l].name} (plan finished)`, ramMb: ram(), loaded: [...loaded] }); t += 250; });
  end("execute");

  start("history", o.hasHistory ? "Retrieving this patient's past records (patient-scoped search, simulated)" : "No earlier records for this patient", pm("progress.history"));
  if (o.hasHistory) { t += 1500; log("history", "Exact facts: HbA1c series, medicines (facts table, simulated)"); t += 1200; log("history", "Text pieces from visit notes (hybrid search, simulated)"); t += 1200; end("history"); } else { t += 400; end("history", "skipped", "History skipped — no earlier records"); }
  start("evidence", "Linking each finding to its source document and page"); t += 3000; end("evidence");
  start("consistency", "Comparing results across files"); t += 2600; end("consistency", o.hasConflict ? "needs_review" : "completed", o.hasConflict ? "Some results disagree or are inconclusive — shown in the report" : undefined);
  start("assemble", "Writing the report from selected sources only", pm("progress.write")); t += 3000; end("assemble");
  start("safety", "Source Check removes unsupported lines; disclaimer and urgent alert verified (simulated)"); t += 2400; end("safety");
  start("ready", "Report ready"); t += 400; end("ready");
  return ev;
}

export function runDuration(run: Pick<AnalysisRun, "events">) {
  return run.events.length ? run.events[run.events.length - 1].at : 0;
}

export interface SimState {
  stages: Record<StageKey, { status: StageStatus; startAt?: number; endAt?: number }>;
  current?: StageKey;
  logs: SimEvent[];
  loaded: string[];
  ramMb: number;
  ramSeries: { t: number; ram: number }[];
  modelStatus: Record<string, "queued" | "loading" | "running" | "done" | "unloaded" | "cached" | "failed">;
  failed?: SimEvent;
  done: boolean;
  progress: number;
  patientMessage?: SimEvent["patientMessage"];
}

export function deriveState(run: AnalysisRun): SimState {
  const stages = Object.fromEntries(STAGES.map((s) => [s.key, { status: "waiting" as StageStatus }])) as SimState["stages"];
  const applied = run.events.filter((e) => e.at <= run.elapsedMs);
  const st: SimState = { stages, logs: applied, loaded: [], ramMb: 0, ramSeries: [{ t: 0, ram: 0 }], modelStatus: {}, done: false, progress: 0 };
  run.plan.steps.forEach((s) => (st.modelStatus[s.modelId] ??= "queued"));
  for (const e of applied) {
    if (e.type === "stage_start") { stages[e.stage] = { status: "in_progress", startAt: e.at }; st.current = e.stage; if (e.patientMessage) st.patientMessage = e.patientMessage; }
    if (e.type === "stage_end") { stages[e.stage] = { ...stages[e.stage], status: e.status ?? "completed", endAt: e.at }; }
    if (e.patientMessage) st.patientMessage = e.patientMessage;
    if (e.type === "model_load" && e.modelId) st.modelStatus[e.modelId] = "loading";
    if (e.type === "model_run" && e.modelId) st.modelStatus[e.modelId] = "running";
    if (e.type === "model_done" && e.modelId) st.modelStatus[e.modelId] = "done";
    if (e.type === "cache_hit" && e.modelId) st.modelStatus[e.modelId] = "cached";
    if (e.type === "model_unload" && e.modelId) st.modelStatus[e.modelId] = "unloaded";
    if (e.type === "fail") { st.failed = e; if (e.modelId) st.modelStatus[e.modelId] = "failed"; stages[e.stage] = { ...stages[e.stage], status: "failed" }; }
    if (e.loaded) st.loaded = e.loaded;
    if (e.ramMb !== undefined) { st.ramMb = e.ramMb; st.ramSeries.push({ t: Math.round(e.at / 100) / 10, ram: e.ramMb }); }
  }
  const total = runDuration(run) || 1;
  st.done = !st.failed && run.elapsedMs >= total && applied.length === run.events.length;
  st.progress = st.done ? 100 : Math.min(99, Math.round((run.elapsedMs / total) * 100));
  return st;
}
