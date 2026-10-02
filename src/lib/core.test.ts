import { describe, expect, it } from "vitest";
import { sniffBytes, createSampleFiles } from "./files";
import { buildPlan, buildTimeline, deriveState, runDuration } from "./sim";
import { checkRx } from "@/components/features/rx-settings";
import { PATIENTS, RAMESH_RX, RAMESH_STANDING_RX } from "@/data/seed";
import { buildReport } from "./report";
import type { Case } from "./types";

const bytes = (...b: number[]) => new Uint8Array(b);

describe("file sniffing", () => {
  it("reads PNG/PDF from magic bytes, not names", () => {
    expect(sniffBytes(bytes(0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0)).format).toBe("PNG image");
    expect(sniffBytes(new TextEncoder().encode("%PDF-1.4 ....")).kind).toBe("pdf");
  });
  it("rejects executables and empty files", () => {
    expect(sniffBytes(bytes(0x4d, 0x5a, 0, 0)).kind).toBe("unsupported");
    expect(sniffBytes(new Uint8Array(0)).format).toBe("Empty file");
  });
});

describe("analysis simulation", () => {
  const files = createSampleFiles("ramesh");
  const base = { id: "c_t", files } as Pick<Case, "id" | "files">;
  it("selects chest/ECG/lab models and skips brain & skin with reasons", () => {
    const plan = buildPlan(base, 1024);
    const ids = plan.steps.map((s) => s.modelId);
    expect(ids).toContain("cxr_densenet121");
    expect(ids).toContain("ecg_resnet1d_int8");
    expect(ids).not.toContain("brain_mri_head");
    expect(plan.skipped.find((s) => s.modelId === "skin_effnet_b0")?.reason).toMatch(/No/);
  });
  it("switches to the light model under a tiny budget and never exceeds it", () => {
    const plan = buildPlan(base, 384);
    const ev = buildTimeline(plan, files, { hasHistory: true, hasConflict: true, injectFailure: false, hasReview: false });
    expect(ev.some((e) => e.type === "light_switch")).toBe(true);
    expect(Math.max(...ev.map((e) => e.ramMb ?? 0))).toBeLessThanOrEqual(384);
  });
  it("injected failure stops the timeline; completed run reaches 'ready'", () => {
    const plan = buildPlan(base, 1024);
    const bad = buildTimeline(plan, files, { hasHistory: true, hasConflict: true, injectFailure: true, hasReview: false });
    expect(bad.some((e) => e.type === "fail")).toBe(true);
    const ok = buildTimeline(plan, files, { hasHistory: true, hasConflict: true, injectFailure: false, hasReview: false });
    const run = { events: ok, elapsedMs: runDuration({ events: ok }), plan } as never;
    expect(deriveState(run).done).toBe(true);
  });
  it("builds a scenario report with the disclaimer-relevant urgent alert and conflicts", () => {
    const plan = buildPlan(base, 1024);
    const events = buildTimeline(plan, files, { hasHistory: true, hasConflict: true, injectFailure: false, hasReview: false });
    const c = { ...base, patientId: "p_ramesh", run: { events, plan } } as unknown as Case;
    const r = buildReport(c, "2026-09-30T10:00:00");
    expect(r.mode).toBe("scenario");
    expect(r.urgent?.call108).toBe(true);
    expect(r.consistency.some((k) => k.status === "conflicting")).toBe(true);
    expect(r.findings.every((f) => f.source !== "summary" || f.evidence.length > 0)).toBe(true);
  });
});

describe("duplicate ingredient warning", () => {
  it("flags Crocin 650 vs active Dolo 650 (paracetamol)", () => {
    const patient = PATIENTS[0];
    const others = [{ ...RAMESH_RX, patientId: patient.id }, { ...RAMESH_STANDING_RX, patientId: patient.id }];
    const w = checkRx([{ id: "x", brand: "Crocin 650", salt: "paracetamol", strength: "650 mg", instructions: "", active: true }], patient, others);
    expect(w.some((x) => x.kind === "duplicate" && /paracetamol/.test(x.text))).toBe(true);
  });
  it("flags the fictional amoxicillin allergy and a recently failed azithromycin", () => {
    const patient = PATIENTS[0];
    const others = [{ ...RAMESH_RX, patientId: patient.id }];
    const a = checkRx([{ id: "y", brand: "Augmentin 625", salt: "amoxicillin + clavulanic acid", strength: "", instructions: "", active: true }], patient, others);
    expect(a.some((x) => x.kind === "allergy")).toBe(true);
    const t = checkRx([{ id: "z", brand: "Azithral 500", salt: "azithromycin", strength: "", instructions: "", active: true }], patient, others);
    expect(t.some((x) => x.kind === "tried")).toBe(true);
  });
});
