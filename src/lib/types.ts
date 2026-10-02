// Domain types for the EL-04 frontend prototype.
// Everything here describes local demo state — there is no backend.

export type Role = "patient" | "doctor";
export type Lang = "en" | "hi" | "mr";

/** Localized text. English is required; Hindi/Marathi fall back to English with a visible notice. */
export interface L {
  en: string;
  hi?: string;
  mr?: string;
}

export interface Account {
  id: string;
  email: string;
  /** SHA-256 hex of the password. Frontend-only demo — NOT production security. */
  passwordHash: string;
  name: string;
  role: Role;
  patientId?: string;
  doctorId?: string;
  demo: boolean;
  createdAt: string;
}

export interface Session {
  accountId: string;
  role: Role;
  startedAt: string;
}

export interface Patient {
  id: string;
  code: string;
  name: string;
  age?: number;
  sex?: "M" | "F" | "Other";
  city?: string;
  language: Lang;
  conditions: string[];
  allergies: string[];
  caregiver?: string;
  sharedWithDoctor: boolean;
  fictional: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
}

/* ---------------------------- Files & intake ---------------------------- */

export type FileCategory =
  | "xray"
  | "mri"
  | "ct"
  | "skin_photo"
  | "ecg"
  | "lab_report"
  | "prescription"
  | "clinical_note"
  | "audio"
  | "unknown";

export type BodyArea = "lungs" | "heart" | "brain" | "skin" | "kidney" | "blood" | "general" | "unknown";

export type PreviewKind = "image" | "pdf" | "audio" | "signal" | "dicom" | "text" | "sample" | "none";

export type CheckStatus = "pass" | "warn" | "fail" | "info";

export interface FileCheck {
  key: "format" | "category" | "preview" | "quality" | "support" | "size";
  label: string;
  status: CheckStatus;
  detail: string;
}

export type FileStatus = "ready" | "needs_review" | "invalid" | "unsupported";

export interface CaseFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  /** Format read from the file's first bytes (magic number), e.g. "PNG image". */
  detectedFormat: string;
  category: FileCategory;
  categorySource: "sample" | "filename" | "format" | "user" | "none";
  bodyArea: BodyArea;
  previewKind: PreviewKind;
  sha256?: string;
  checks: FileCheck[];
  status: FileStatus;
  addedAt: string;
  /** Generated demo sample (fictional) rather than a user's own file. */
  sample?: boolean;
  /** Seeded source document this file corresponds to (demo scenario only). */
  docId?: string;
  /** Excluded by the user from analysis. */
  excluded?: boolean;
}

export interface IntakeAnswers {
  coughDuration?: string;
  breathless?: "yes" | "no" | "unsure";
  chestPain?: "yes" | "no" | "unsure";
  notes?: string;
}

/* ------------------------------ Analysis ------------------------------ */

export type StageKey =
  | "init"
  | "inventory"
  | "validation"
  | "classify"
  | "select"
  | "resources"
  | "execute"
  | "history"
  | "evidence"
  | "consistency"
  | "assemble"
  | "safety"
  | "ready";

export type StageStatus = "waiting" | "in_progress" | "completed" | "needs_review" | "skipped" | "failed";

export type SimEventType =
  | "stage_start"
  | "stage_end"
  | "log"
  | "model_load"
  | "model_unload"
  | "model_run"
  | "model_done"
  | "cache_hit"
  | "prefetch"
  | "light_switch"
  | "fail";

export interface SimEvent {
  at: number; // ms from run start (simulated clock)
  type: SimEventType;
  stage: StageKey;
  status?: StageStatus; // for stage_end
  modelId?: string;
  message: string;
  patientMessage?: L;
  ramMb?: number; // RAM in use after this event (simulated)
  loaded?: string[];
}

export interface PlanStep {
  order: number;
  modelId: string;
  input: string; // file name
  fileId: string;
  reason: string;
  ruleKind: "fixed_rule" | "router_demo" | "cascade";
}

export interface SkippedModel {
  modelId: string;
  reason: string;
}

export interface OrchestrationPlan {
  caseId: string;
  urgency: { level: UrgencyLevel; note: string };
  ramBudgetMb: number;
  steps: PlanStep[];
  skipped: SkippedModel[];
  excludedFiles: { fileId: string; name: string; reason: string }[];
}

export type RunStatus = "running" | "paused" | "failed" | "cancelled" | "completed";

export interface AnalysisRun {
  runId: string;
  startedAt: string;
  finishedAt?: string;
  budgetMb: number;
  speed: "normal" | "fast";
  injectFailure: boolean;
  status: RunStatus;
  elapsedMs: number;
  events: SimEvent[];
  plan: OrchestrationPlan;
  failures: { stage: StageKey; message: string; at: string }[];
  cacheHits: number;
}

/* ------------------------------- Cases ------------------------------- */

export type CaseStatus = "draft" | "running" | "paused" | "failed" | "cancelled" | "completed";
export type ReviewStatus = "awaiting" | "in_review" | "reviewed" | "follow_up" | "needs_file";

export interface ReviewNote {
  id: string;
  at: string;
  author: string;
  text: string;
}

export interface Case {
  id: string;
  patientId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: CaseStatus;
  files: CaseFile[];
  intake: IntakeAnswers;
  run?: AnalysisRun;
  reportId?: string;
  review: {
    status: ReviewStatus;
    notes: ReviewNote[];
    followUpDate?: string;
    reviewedBy?: string;
  };
  seeded?: boolean;
}

/* ------------------------------ Reports ------------------------------ */

export type SourceKind = "model" | "record" | "guideline" | "summary";
export type RiskLevel = "normal" | "show_doctor" | "see_soon" | "not_sure";
export type UrgencyLevel = "low" | "medium" | "high" | "emergency";
export type Domain = "lungs" | "heart" | "brain" | "skin" | "kidney" | "blood" | "history";

export type EvidenceRef =
  | { kind: "model_output"; modelId: string; fileId?: string; category?: FileCategory }
  | { kind: "document"; docId: string; lineId?: string }
  | { kind: "guideline"; guidelineId: string }
  | { kind: "finding"; findingId: string };

export interface Finding {
  id: string;
  domain: Domain;
  source: SourceKind;
  patientText: L;
  doctorText: string;
  modelId?: string;
  /** Fixed illustrative value from the demo dataset (0–1). Never computed from a real file. */
  confidence?: number;
  risk?: RiskLevel;
  date?: string;
  evidence: EvidenceRef[];
  uncertainty?: string;
  missing?: string;
}

export type ConsistencyStatus = "consistent" | "conflicting" | "insufficient" | "review";

export interface ConsistencyItem {
  id: string;
  title: string;
  status: ConsistencyStatus;
  between: string[]; // finding ids
  patientText: L;
  doctorText: string;
}

export interface RemovedSentence {
  text: string;
  reason: string;
}

export interface Report {
  id: string;
  caseId: string;
  patientId: string;
  createdAt: string;
  /** "scenario" = rich seeded demo dataset; "template" = structure-only output for user files. */
  mode: "scenario" | "template";
  urgency: UrgencyLevel;
  urgent?: { title: L; reason: L; call108: boolean };
  nextStep: L;
  summary: L;
  findings: Finding[];
  consistency: ConsistencyItem[];
  uncertainties: { id: string; patientText: L; doctorText: string }[];
  removedBySourceCheck: RemovedSentence[];
  labTests: string[];
  modelsRun: { modelId: string; version: string; cached: boolean }[];
  missingData: string[];
}

/* --------------------------- Patient memory --------------------------- */

export interface DocLine {
  id: string;
  text: string;
  /** Optional structured cells for table rows. */
  cells?: string[];
  flag?: "H" | "L";
}

export interface SourceDoc {
  id: string;
  patientId: string;
  title: string;
  kind: "lab_report" | "prescription" | "visit_note" | "care_plan" | "xray" | "ecg" | "scan_report" | "skin_photo" | "ct";
  date: string;
  issuer: string;
  page: number;
  header?: string[];
  table?: { columns: string[]; rows: DocLine[] };
  lines: DocLine[];
}

export interface Guideline {
  id: string;
  sourceName: string;
  text: string;
  /** Always true in this prototype: no verified guideline text is bundled. */
  illustrative: true;
  note: string;
}

export interface LabSeries {
  test: string;
  unit: string;
  low?: number;
  high?: number;
  rangeLabel: string;
  values: { date: string; value: number; docId: string; lineId: string }[];
}

export interface RxItem {
  id: string;
  brand: string;
  salt: string;
  strength: string;
  instructions: string; // as written on the record
  days?: number;
  active: boolean;
}

export interface Prescription {
  id: string;
  patientId: string;
  date: string;
  doctor: string;
  docId?: string;
  items: RxItem[];
  note?: string;
  outcome?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  date: string;
  doctor: string;
  reason: string;
  medicinesGiven: string[];
  tookThem: string;
  result: string;
  changedSince: string;
  pending: string;
  sources: { label: string; docId: string; lineId?: string }[];
}

/* ------------------------- Care plan & reminders ------------------------- */

export type CareCategory = "medicine" | "cream" | "diet" | "activity" | "test" | "follow_up" | "danger_sign";

export interface CareItem {
  id: string;
  category: CareCategory;
  text: L;
  doctorQuote: string;
  segment: { start: number; end: number };
}

export interface CarePlan {
  id: string;
  patientId: string;
  createdAt: string;
  title: string;
  doctor: string;
  origin: "seeded" | "doctor_recording";
  recordingId?: string;
  items: CareItem[];
  active: boolean;
}

export interface Reminder {
  id: string;
  patientId: string;
  carePlanId?: string;
  careItemId?: string;
  title: string;
  category: CareCategory;
  time: string; // HH:MM
  startDate: string; // YYYY-MM-DD
  endDate?: string; // inclusive; undefined = one-off on startDate
  repeat: "once" | "daily";
  completions: Record<string, boolean>; // YYYY-MM-DD -> done
  createdBy: "seed" | "user" | "doctor";
}

export interface RecordingMeta {
  id: string;
  patientId: string;
  createdAt: string;
  durationSec: number;
  by: Role;
  consent: boolean;
  /** Blob lives only in this tab's memory. */
  inMemory: boolean;
}

export interface AppNotification {
  id: string;
  at: string;
  role: Role;
  patientId?: string;
  title: string;
  body: string;
  href?: string;
  read: boolean;
}
