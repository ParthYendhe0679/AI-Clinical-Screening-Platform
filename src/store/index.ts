"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Account, AppNotification, CarePlan, Case, CaseFile, Doctor, IntakeAnswers, Lang, Patient, Prescription, RecordingMeta, Reminder, ReviewStatus, Report, Role, Session, Visit } from "@/lib/types";
import { ACCOUNTS, DOCTORS, PATIENTS, RAMESH_RX, RAMESH_STANDING_RX, RAMESH_VISIT, otherCases, ramesReminders, ramessCarePlan } from "@/data/seed";
import { HISTORY_DOC_IDS } from "@/data/docs";
import { buildPlan, buildTimeline, runDuration, BUDGETS } from "@/lib/sim";
import { buildReport } from "@/lib/report";
import { addDays, dayKey, demoHash, uid } from "@/lib/utils";
import { releaseAllRuntime, releaseRuntime } from "@/lib/files";

interface Data {
  accounts: Account[]; session: Session | null; patients: Patient[]; doctors: Doctor[];
  cases: Case[]; reports: Report[]; visits: Visit[]; prescriptions: Prescription[];
  carePlans: CarePlan[]; reminders: Reminder[]; recordings: RecordingMeta[]; notifications: AppNotification[];
  patientDocs: Record<string, string[]>; acks: string[]; lang: Lang; budgetMb: number;
}

function seedData(): Data {
  const today = dayKey();
  const o = otherCases();
  return {
    accounts: ACCOUNTS, session: null, patients: PATIENTS, doctors: DOCTORS,
    cases: o.cases, reports: o.reports,
    visits: [{ ...RAMESH_VISIT, patientId: "p_ramesh" }],
    prescriptions: [{ ...RAMESH_RX, patientId: "p_ramesh" }, { ...RAMESH_STANDING_RX, patientId: "p_ramesh" }],
    carePlans: [ramessCarePlan("p_ramesh", today)], reminders: ramesReminders("p_ramesh", today), recordings: [], notifications: [],
    patientDocs: { p_ramesh: HISTORY_DOC_IDS }, acks: [], lang: "en", budgetMb: 1024,
  };
}

interface Actions {
  login: (email: string, password: string, role?: Role) => { ok: boolean; error?: string; role?: Role };
  demoLogin: (role: Role) => void;
  register: (p: { name: string; email: string; password: string; role: Role }) => { ok: boolean; error?: string };
  logout: () => void;
  resetDemo: () => void;
  loadDemoInto: (patientId: string) => void;
  setLang: (l: Lang) => void;
  setBudget: (mb: number) => void;
  createCase: (patientId: string, files: CaseFile[], intake: IntakeAnswers, title?: string) => string;
  patchCase: (id: string, fn: (c: Case) => Case) => void;
  removeCase: (id: string) => void;
  startRun: (caseId: string, opts?: { speed?: "normal" | "fast"; injectFailure?: boolean; budgetMb?: number }) => void;
  tick: (dtMs: number) => void;
  pauseRun: (id: string) => void; resumeRun: (id: string) => void; cancelRun: (id: string) => void; retryRun: (id: string) => void;
  setReview: (id: string, status: ReviewStatus, followUpDate?: string, by?: string) => void;
  addNote: (id: string, author: string, text: string) => void;
  toggleReminderDone: (id: string, day: string) => void;
  upsertReminder: (r: Reminder) => void; deleteReminder: (id: string) => void;
  addCarePlan: (cp: CarePlan, rem: Reminder[]) => void;
  addRecording: (m: RecordingMeta) => void; deleteRecording: (id: string) => void;
  addPrescription: (rx: Prescription) => void;
  ack: (key: string) => void;
  notify: (n: Omit<AppNotification, "id" | "at" | "read">) => void;
  readAll: (role: Role) => void;
}

export type Store = Data & Actions;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...seedData(),
      login: (email, password, role) => {
        const a = get().accounts.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
        if (!a || a.passwordHash !== demoHash(password)) return { ok: false, error: "Email or password is incorrect." };
        if (role && a.role !== role) return { ok: false, error: `This account is a ${a.role} account. Switch the role selector to “${a.role}”.` };
        set({ session: { accountId: a.id, role: a.role, startedAt: new Date().toISOString() } });
        return { ok: true, role: a.role };
      },
      demoLogin: (role) => {
        if (get().accounts.length < 2 || !get().accounts.some((a) => a.id === "a_pat")) set({ ...seedData() });
        set({ session: { accountId: role === "patient" ? "a_pat" : "a_doc", role, startedAt: new Date().toISOString() } });
      },
      register: ({ name, email, password, role }) => {
        if (get().accounts.some((a) => a.email.toLowerCase() === email.trim().toLowerCase())) return { ok: false, error: "An account with this email already exists." };
        const id = uid("a");
        if (role === "patient") {
          const pid = uid("p");
          const patient: Patient = { id: pid, code: `PT-${Math.floor(3000 + Math.random() * 6000)}`, name, language: "en", conditions: [], allergies: [], sharedWithDoctor: true, fictional: false };
          set((s) => ({ patients: [...s.patients, patient], patientDocs: { ...s.patientDocs, [pid]: [] }, accounts: [...s.accounts, { id, email: email.trim(), passwordHash: demoHash(password), name, role, patientId: pid, demo: false, createdAt: new Date().toISOString() }] }));
        } else {
          const did = uid("dr");
          set((s) => ({ doctors: [...s.doctors, { id: did, name: name.startsWith("Dr") ? name : `Dr. ${name}`, specialty: "General medicine", clinic: "Demo clinic" }], accounts: [...s.accounts, { id, email: email.trim(), passwordHash: demoHash(password), name, role, doctorId: did, demo: false, createdAt: new Date().toISOString() }] }));
        }
        set({ session: { accountId: id, role, startedAt: new Date().toISOString() } });
        return { ok: true };
      },
      logout: () => { releaseAllRuntime(); set({ session: null }); },
      resetDemo: () => { releaseAllRuntime(); set({ ...seedData() }); },
      loadDemoInto: (pid) => {
        const today = dayKey();
        set((s) => ({
          patients: s.patients.map((p) => (p.id === pid ? { ...p, name: p.fictional ? p.name : p.name, age: 58, sex: "M", city: "Kalyan", language: "mr", conditions: ["Type 2 diabetes"], allergies: ["amoxicillin"] } : p)),
          visits: [...s.visits.filter((v) => v.patientId !== pid), { ...RAMESH_VISIT, id: `v_${pid}`, patientId: pid }],
          prescriptions: [...s.prescriptions.filter((r) => r.patientId !== pid), { ...RAMESH_RX, id: `rx_a_${pid}`, patientId: pid }, { ...RAMESH_STANDING_RX, id: `rx_b_${pid}`, patientId: pid }],
          carePlans: [...s.carePlans.filter((c) => c.patientId !== pid), { ...ramessCarePlan(pid, today), id: `cp_${pid}` }],
          reminders: [...s.reminders.filter((r) => r.patientId !== pid), ...ramesReminders(pid, today).map((r) => ({ ...r, id: `${r.id}_${pid}`, carePlanId: `cp_${pid}` }))],
          patientDocs: { ...s.patientDocs, [pid]: HISTORY_DOC_IDS },
        }));
      },
      setLang: (lang) => set({ lang }),
      setBudget: (budgetMb) => set({ budgetMb }),
      createCase: (patientId, files, intake, title) => {
        const id = `c_${Math.floor(1000 + Math.random() * 8999)}`;
        const now = new Date().toISOString();
        const c: Case = { id, patientId, title: title ?? "New screening case", createdAt: now, updatedAt: now, status: "draft", files, intake, review: { status: "awaiting", notes: [] } };
        set((s) => ({ cases: [c, ...s.cases] }));
        return id;
      },
      patchCase: (id, fn) => set((s) => ({ cases: s.cases.map((c) => (c.id === id ? { ...fn(c), updatedAt: new Date().toISOString() } : c)) })),
      removeCase: (id) => { get().cases.find((c) => c.id === id)?.files.forEach((f) => releaseRuntime(f.id)); set((s) => ({ cases: s.cases.filter((c) => c.id !== id), reports: s.reports.filter((r) => r.caseId !== id) })); },
      startRun: (caseId, opts = {}) => {
        const s = get(); const c = s.cases.find((x) => x.id === caseId); if (!c) return;
        const budgetMb = opts.budgetMb ?? s.budgetMb;
        const plan = buildPlan(c, budgetMb);
        const hasHistory = (s.patientDocs[c.patientId]?.length ?? 0) > 0;
        const probeConflict = plan.steps.some((x) => x.modelId === "ecg_resnet1d_int8") && plan.steps.some((x) => x.modelId === "cxr_densenet121");
        const events = buildTimeline(plan, c.files, { hasHistory, hasConflict: probeConflict, injectFailure: !!opts.injectFailure, hasReview: false });
        s.patchCase(caseId, (cc) => ({ ...cc, status: "running", reportId: undefined, run: { runId: uid("run"), startedAt: new Date().toISOString(), budgetMb, speed: opts.speed ?? "normal", injectFailure: !!opts.injectFailure, status: "running", elapsedMs: 0, events, plan, failures: [], cacheHits: 0 } }));
        set((st) => ({ reports: st.reports.filter((r) => r.caseId !== caseId) }));
      },
      tick: (dt) => {
        const s = get();
        const running = s.cases.filter((c) => c.run?.status === "running");
        if (!running.length) return;
        for (const c of running) {
          const run = c.run!; const mult = run.speed === "fast" ? 4 : 1;
          const elapsed = run.elapsedMs + dt * mult;
          const fail = run.events.find((e) => e.type === "fail");
          if (fail && elapsed >= fail.at) {
            s.patchCase(c.id, (cc) => ({ ...cc, status: "failed", run: { ...cc.run!, elapsedMs: fail.at, status: "failed", failures: [...cc.run!.failures, { stage: fail.stage, message: fail.message, at: new Date().toISOString() }] } }));
            continue;
          }
          if (elapsed >= runDuration(run)) {
            const now = new Date().toISOString();
            const done: Case = { ...c, status: "completed", run: { ...run, elapsedMs: runDuration(run), status: "completed", finishedAt: now, cacheHits: run.events.filter((e) => e.type === "cache_hit").length } };
            const rep = buildReport(done, now);
            set((st) => ({
              cases: st.cases.map((x) => (x.id === c.id ? { ...done, reportId: rep.id, updatedAt: now } : x)),
              reports: [...st.reports.filter((r) => r.id !== rep.id), rep],
              notifications: [{ id: uid("n"), at: now, role: "patient" as const, patientId: c.patientId, title: "Your screening report is ready", body: `${c.title} — open the report.`, href: `/patient/reports/${rep.id}`, read: false }, { id: uid("n"), at: now, role: "doctor" as const, title: "New case ready for review", body: `${c.title} (${c.id})`, href: `/doctor/cases/${c.id}`, read: false }, ...st.notifications].slice(0, 40),
            }));
            continue;
          }
          set((st) => ({ cases: st.cases.map((x) => (x.id === c.id && x.run ? { ...x, run: { ...x.run, elapsedMs: elapsed } } : x)) }));
        }
      },
      pauseRun: (id) => get().patchCase(id, (c) => (c.run?.status === "running" ? { ...c, status: "paused", run: { ...c.run, status: "paused" } } : c)),
      resumeRun: (id) => get().patchCase(id, (c) => (c.run?.status === "paused" ? { ...c, status: "running", run: { ...c.run, status: "running" } } : c)),
      cancelRun: (id) => get().patchCase(id, (c) => (c.run && ["running", "paused", "failed"].includes(c.run.status) ? { ...c, status: "cancelled", run: { ...c.run, status: "cancelled" } } : c)),
      retryRun: (id) => {
        const s = get(); const c = s.cases.find((x) => x.id === id); if (!c?.run || c.run.status !== "failed") return;
        const hasHistory = (s.patientDocs[c.patientId]?.length ?? 0) > 0;
        const events = buildTimeline(c.run.plan, c.files, { hasHistory, hasConflict: true, injectFailure: false, hasReview: false });
        s.patchCase(id, (cc) => ({ ...cc, status: "running", run: { ...cc.run!, events, injectFailure: false, status: "running" } }));
      },
      setReview: (id, status, followUpDate, by) => get().patchCase(id, (c) => ({ ...c, review: { ...c.review, status, followUpDate: followUpDate ?? c.review.followUpDate, reviewedBy: status === "reviewed" ? by ?? c.review.reviewedBy : c.review.reviewedBy } })),
      addNote: (id, author, text) => get().patchCase(id, (c) => ({ ...c, review: { ...c.review, notes: [...c.review.notes, { id: uid("note"), at: new Date().toISOString(), author, text }] } })),
      toggleReminderDone: (id, day) => set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, completions: { ...r.completions, [day]: !r.completions[day] } } : r)) })),
      upsertReminder: (r) => set((s) => ({ reminders: s.reminders.some((x) => x.id === r.id) ? s.reminders.map((x) => (x.id === r.id ? r : x)) : [...s.reminders, r] })),
      deleteReminder: (id) => set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
      addCarePlan: (cp, rem) => set((s) => ({ carePlans: [cp, ...s.carePlans], reminders: [...s.reminders, ...rem], notifications: [{ id: uid("n"), at: new Date().toISOString(), role: "patient", patientId: cp.patientId, title: "New care plan from your doctor", body: cp.title, href: "/patient/care-plan", read: false }, ...s.notifications] })),
      addRecording: (m) => set((s) => ({ recordings: [m, ...s.recordings] })),
      deleteRecording: (id) => set((s) => ({ recordings: s.recordings.filter((r) => r.id !== id) })),
      addPrescription: (rx) => set((s) => ({ prescriptions: [rx, ...s.prescriptions] })),
      ack: (key) => set((s) => ({ acks: s.acks.includes(key) ? s.acks : [...s.acks, key] })),
      notify: (n) => set((s) => ({ notifications: [{ ...n, id: uid("n"), at: new Date().toISOString(), read: false }, ...s.notifications].slice(0, 40) })),
      readAll: (role) => set((s) => ({ notifications: s.notifications.map((n) => (n.role === role ? { ...n, read: true } : n)) })),
    }),
    {
      name: "el04-demo-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => {
        const { login, demoLogin, register, logout, resetDemo, loadDemoInto, setLang, setBudget, createCase, patchCase, removeCase, startRun, tick, pauseRun, resumeRun, cancelRun, retryRun, setReview, addNote, toggleReminderDone, upsertReminder, deleteReminder, addCarePlan, addRecording, deleteRecording, addPrescription, ack, notify, readAll, ...data } = s;
        void [login, demoLogin, register, logout, resetDemo, loadDemoInto, setLang, setBudget, createCase, patchCase, removeCase, startRun, tick, pauseRun, resumeRun, cancelRun, retryRun, setReview, addNote, toggleReminderDone, upsertReminder, deleteReminder, addCarePlan, addRecording, deleteRecording, addPrescription, ack, notify, readAll];
        return data;
      },
    },
  ),
);

export { BUDGETS };
export const getAccount = (s: Data) => s.accounts.find((a) => a.id === s.session?.accountId);
export const getPatientForSession = (s: Data) => s.patients.find((p) => p.id === getAccount(s)?.patientId);
export const getDoctorForSession = (s: Data) => s.doctors.find((d) => d.id === getAccount(s)?.doctorId);
export { addDays };
