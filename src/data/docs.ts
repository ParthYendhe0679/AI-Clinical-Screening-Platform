import type { Guideline, LabSeries, SourceDoc } from "@/lib/types";

/**
 * All documents below are FICTIONAL demo records written for the prototype patient
 * "Ramesh Patil" (project document §8). They are not real patient data.
 * Lab "reference ranges" are generic illustrative ranges, not clinical guidance.
 */
export const SOURCE_DOCS: SourceDoc[] = [
  {
    id: "d_lab_0312",
    patientId: "p_ramesh",
    title: "Blood report — 12 Mar 2026",
    kind: "lab_report",
    date: "2026-03-12",
    issuer: "Sunrise Diagnostics, Kalyan (fictional)",
    page: 1,
    header: ["Patient: R. Patil, 58 M", "Sample: venous blood", "FICTIONAL DEMO REPORT"],
    table: {
      columns: ["Test", "Result", "Unit", "Illustrative range"],
      rows: [
        { id: "l1", text: "HbA1c", cells: ["HbA1c", "7.2", "%", "4.0 – 5.6"], flag: "H" },
        { id: "l2", text: "Fasting glucose", cells: ["Fasting glucose", "142", "mg/dL", "70 – 99"], flag: "H" },
        { id: "l3", text: "Hemoglobin", cells: ["Hemoglobin", "13.4", "g/dL", "13.0 – 17.0"] },
        { id: "l4", text: "Creatinine", cells: ["Creatinine", "0.9", "mg/dL", "0.7 – 1.3"] },
        { id: "l5", text: "WBC", cells: ["WBC", "7.6", "×10³/µL", "4.0 – 11.0"] },
      ],
    },
    lines: [],
  },
  {
    id: "d_lab_0610",
    patientId: "p_ramesh",
    title: "Blood report — 10 Jun 2026",
    kind: "lab_report",
    date: "2026-06-10",
    issuer: "Sunrise Diagnostics, Kalyan (fictional)",
    page: 1,
    header: ["Patient: R. Patil, 58 M", "Sample: venous blood", "FICTIONAL DEMO REPORT"],
    table: {
      columns: ["Test", "Result", "Unit", "Illustrative range"],
      rows: [
        { id: "l1", text: "HbA1c", cells: ["HbA1c", "7.8", "%", "4.0 – 5.6"], flag: "H" },
        { id: "l2", text: "Fasting glucose", cells: ["Fasting glucose", "156", "mg/dL", "70 – 99"], flag: "H" },
        { id: "l3", text: "Hemoglobin", cells: ["Hemoglobin", "13.1", "g/dL", "13.0 – 17.0"] },
        { id: "l4", text: "Creatinine", cells: ["Creatinine", "1.0", "mg/dL", "0.7 – 1.3"] },
        { id: "l5", text: "WBC", cells: ["WBC", "8.0", "×10³/µL", "4.0 – 11.0"] },
      ],
    },
    lines: [],
  },
  {
    id: "d_lab_0930",
    patientId: "p_ramesh",
    title: "Blood report — 30 Sep 2026 (new, uploaded today)",
    kind: "lab_report",
    date: "2026-09-30",
    issuer: "Sunrise Diagnostics, Kalyan (fictional)",
    page: 1,
    header: ["Patient: R. Patil, 58 M", "Sample: venous blood", "FICTIONAL DEMO REPORT"],
    table: {
      columns: ["Test", "Result", "Unit", "Illustrative range"],
      rows: [
        { id: "l1", text: "HbA1c", cells: ["HbA1c", "8.4", "%", "4.0 – 5.6"], flag: "H" },
        { id: "l2", text: "Fasting glucose", cells: ["Fasting glucose", "171", "mg/dL", "70 – 99"], flag: "H" },
        { id: "l3", text: "Hemoglobin", cells: ["Hemoglobin", "12.9", "g/dL", "13.0 – 17.0"], flag: "L" },
        { id: "l4", text: "Creatinine", cells: ["Creatinine", "1.0", "mg/dL", "0.7 – 1.3"] },
        { id: "l5", text: "WBC", cells: ["WBC", "7.9", "×10³/µL", "4.0 – 11.0"] },
        { id: "l6", text: "CRP", cells: ["CRP", "38", "mg/L", "< 5"], flag: "H" },
      ],
    },
    lines: [],
  },
  {
    id: "d_rx_0909",
    patientId: "p_ramesh",
    title: "Prescription — 9 Sep 2026",
    kind: "prescription",
    date: "2026-09-09",
    issuer: "Dr. Anita Mehta, Mehta Clinic, Kalyan (fictional)",
    page: 1,
    header: ["Patient: R. Patil, 58 M", "Complaint: cough, mild fever", "FICTIONAL DEMO PRESCRIPTION"],
    lines: [
      { id: "m1", text: "1. Azithral 500 — 1 tablet once daily after food × 3 days" },
      { id: "m2", text: "2. Dolo 650 — 1 tablet if fever" },
      { id: "m3", text: "Advice: sputum test; avoid cold and oily food; review after 15 days" },
    ],
  },
  {
    id: "d_note_0909",
    patientId: "p_ramesh",
    title: "Visit note — 9 Sep 2026",
    kind: "visit_note",
    date: "2026-09-09",
    issuer: "Dr. Anita Mehta, Mehta Clinic, Kalyan (fictional)",
    page: 1,
    header: ["FICTIONAL DEMO NOTE"],
    lines: [
      { id: "n1", text: "Cough × 1 week with mild fever. Known type 2 diabetes." },
      { id: "n2", text: "Advised sputum test. Antibiotic course given for 3 days." },
      { id: "n3", text: "Follow-up review after 15 days." },
    ],
  },
  {
    id: "d_note_followup",
    patientId: "p_ramesh",
    title: "Follow-up note — 30 Sep 2026",
    kind: "visit_note",
    date: "2026-09-30",
    issuer: "Patient / caregiver entry (fictional)",
    page: 1,
    header: ["FICTIONAL DEMO NOTE"],
    lines: [
      { id: "f1", text: "Cough did not improve after the antibiotic course. Sputum test advised on 9 Sep was not done yet." },
      { id: "f2", text: "New: breathlessness and some chest discomfort for the last few days." },
    ],
  },
  {
    id: "d_xray_0930",
    patientId: "p_ramesh",
    title: "Chest X-ray — 30 Sep 2026",
    kind: "xray",
    date: "2026-09-30",
    issuer: "Local lab (fictional sample image)",
    page: 1,
    header: ["FICTIONAL DEMO IMAGE — not a real scan"],
    lines: [{ id: "x1", text: "Region of interest: lower zone, right lung (illustrative overlay)" }],
  },
  {
    id: "d_ecg_0930",
    patientId: "p_ramesh",
    title: "12-lead ECG — 30 Sep 2026",
    kind: "ecg",
    date: "2026-09-30",
    issuer: "Local lab (fictional sample signal)",
    page: 1,
    header: ["FICTIONAL DEMO SIGNAL — not a real recording"],
    lines: [{ id: "e1", text: "Region of interest: ST segment, leads V4–V6 (illustrative overlay)" }],
  },
  {
    id: "d_rx_0930",
    patientId: "p_ramesh",
    title: "New prescription — 30 Sep 2026",
    kind: "prescription",
    date: "2026-09-30",
    issuer: "Dr. Anita Mehta, Mehta Clinic, Kalyan (fictional)",
    page: 1,
    header: ["Patient: R. Patil, 58 M", "FICTIONAL DEMO PRESCRIPTION"],
    lines: [
      { id: "p1", text: "1. Crocin 650 — 1 tablet if fever" },
      { id: "p2", text: "2. Pan 40 — 1 tablet before breakfast" },
      { id: "p3", text: "Advice: chest review; repeat blood test after 2 weeks" },
    ],
  },
];

export const DOC_BY_ID: Record<string, SourceDoc> = Object.fromEntries(SOURCE_DOCS.map((d) => [d.id, d]));

/** Documents that ship as part of the demo patient's older memory (not tied to today's upload). */
export const HISTORY_DOC_IDS = ["d_lab_0312", "d_lab_0610", "d_rx_0909", "d_note_0909"];
/** Documents created by today's demo case (sample files). */
export const TODAY_DOC_IDS = ["d_xray_0930", "d_ecg_0930", "d_lab_0930", "d_lab_0610", "d_lab_0312"];

/**
 * GUIDELINES — IMPORTANT: the project document names ICMR / WHO / MedlinePlus as the intended
 * knowledge base, but no verified guideline text is bundled with this prototype. These entries
 * are paraphrased placeholders and are flagged illustrative everywhere they are shown.
 */
export const GUIDELINES: Guideline[] = [
  {
    id: "g_dm_lung",
    sourceName: "Illustrative demo guideline (stand-in for an ICMR-style standard workflow)",
    text: "For people with diabetes, a lung infection should be checked by a doctor promptly.",
    illustrative: true,
    note: "Placeholder text written for the prototype. Not a quotation from ICMR, WHO or any real guideline.",
  },
  {
    id: "g_cough_tb",
    sourceName: "Illustrative demo guideline (stand-in for an NTEP/WHO-style TB screening note)",
    text: "A cough lasting more than two weeks should be followed by a doctor-ordered sputum test, even if a chest X-ray looks reassuring.",
    illustrative: true,
    note: "Placeholder text written for the prototype. Not a quotation from any real guideline.",
  },
];
export const GUIDELINE_BY_ID: Record<string, Guideline> = Object.fromEntries(GUIDELINES.map((g) => [g.id, g]));

/** Lab series are derived from the table rows of the seeded lab reports. */
export function buildLabSeries(docIds: string[]): LabSeries[] {
  const tests: { key: string; unit: string; low?: number; high?: number; rangeLabel: string }[] = [
    { key: "HbA1c", unit: "%", low: 4.0, high: 5.6, rangeLabel: "4.0 – 5.6 % (illustrative)" },
    { key: "Fasting glucose", unit: "mg/dL", low: 70, high: 99, rangeLabel: "70 – 99 mg/dL (illustrative)" },
    { key: "Hemoglobin", unit: "g/dL", low: 13, high: 17, rangeLabel: "13.0 – 17.0 g/dL (illustrative)" },
    { key: "Creatinine", unit: "mg/dL", low: 0.7, high: 1.3, rangeLabel: "0.7 – 1.3 mg/dL (illustrative)" },
    { key: "WBC", unit: "×10³/µL", low: 4, high: 11, rangeLabel: "4.0 – 11.0 ×10³/µL (illustrative)" },
    { key: "CRP", unit: "mg/L", high: 5, rangeLabel: "< 5 mg/L (illustrative)" },
  ];
  const docs = docIds
    .map((id) => DOC_BY_ID[id])
    .filter((d): d is SourceDoc => !!d && d.kind === "lab_report" && !!d.table)
    .sort((a, b) => a.date.localeCompare(b.date));
  const out: LabSeries[] = [];
  for (const t of tests) {
    const values = docs
      .map((d) => {
        const row = d.table!.rows.find((r) => r.cells?.[0] === t.key);
        if (!row?.cells) return null;
        const value = Number(row.cells[1]);
        if (!Number.isFinite(value)) return null;
        return { date: d.date, value, docId: d.id, lineId: row.id };
      })
      .filter((v): v is NonNullable<typeof v> => !!v);
    if (values.length) out.push({ test: t.key, unit: t.unit, low: t.low, high: t.high, rangeLabel: t.rangeLabel, values });
  }
  return out;
}
