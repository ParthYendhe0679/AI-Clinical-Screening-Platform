import type { Account, CarePlan, Case, Doctor, Patient, Prescription, Reminder, Report, Visit } from "@/lib/types";
import { addDays, dayKey, demoHash } from "@/lib/utils";
import { simpleReport } from "@/lib/report";

export const DEMO_PASSWORD = "Demo@1234";
export const DEMO_PATIENT_EMAIL = "ramesh.demo@el04.test";
export const DEMO_DOCTOR_EMAIL = "dr.mehta@el04.test";

export const ACCOUNTS: Account[] = [
  { id: "a_pat", email: DEMO_PATIENT_EMAIL, passwordHash: demoHash(DEMO_PASSWORD), name: "Priya Patil (for Ramesh)", role: "patient", patientId: "p_ramesh", demo: true, createdAt: "2026-09-01T09:00:00" },
  { id: "a_doc", email: DEMO_DOCTOR_EMAIL, passwordHash: demoHash(DEMO_PASSWORD), name: "Dr. Anita Mehta", role: "doctor", doctorId: "dr_mehta", demo: true, createdAt: "2026-09-01T09:00:00" },
];

export const DOCTORS: Doctor[] = [{ id: "dr_mehta", name: "Dr. Anita Mehta", specialty: "General medicine", clinic: "Mehta Clinic, Kalyan (fictional)" }];

export const PATIENTS: Patient[] = [
  { id: "p_ramesh", code: "PT-1042", name: "Ramesh Patil", age: 58, sex: "M", city: "Kalyan", language: "mr", conditions: ["Type 2 diabetes"], allergies: ["amoxicillin"], caregiver: "Priya Patil (daughter)", sharedWithDoctor: true, fictional: true },
  { id: "p_sunita", code: "PT-2018", name: "Sunita Kulkarni", age: 34, sex: "F", city: "Thane", language: "mr", conditions: [], allergies: [], sharedWithDoctor: true, fictional: true },
  { id: "p_anil", code: "PT-2031", name: "Anil Deshmukh", age: 61, sex: "M", city: "Dombivli", language: "hi", conditions: ["Hypertension"], allergies: [], sharedWithDoctor: true, fictional: true },
  { id: "p_meera", code: "PT-2044", name: "Meera Joshi", age: 47, sex: "F", city: "Pune", language: "en", conditions: [], allergies: [], sharedWithDoctor: true, fictional: true },
];

export const RAMESH_VISIT: Omit<Visit, "patientId"> = {
  id: "v_0909", date: "2026-09-09", doctor: "Dr. Anita Mehta", reason: "Cough and mild fever",
  medicinesGiven: ["Azithral 500 (azithromycin) for 3 days", "Dolo 650 (paracetamol) if fever"],
  tookThem: "Yes, all doses (from reminder ticks)", result: "The cough did not improve.",
  changedSince: "HbA1c went up from 7.2 to 8.4 (once today's blood report is uploaded)", pending: "Sputum test advised but not done yet",
  sources: [{ label: "Prescription 9 Sep", docId: "d_rx_0909", lineId: "m1" }, { label: "Visit note 9 Sep", docId: "d_note_0909", lineId: "n2" }, { label: "Blood report 12 Mar", docId: "d_lab_0312", lineId: "l1" }],
};

export const RAMESH_RX: Omit<Prescription, "patientId"> = {
  id: "rx_0909", date: "2026-09-09", doctor: "Dr. Anita Mehta", docId: "d_rx_0909",
  items: [
    { id: "i1", brand: "Azithral 500", salt: "azithromycin", strength: "500 mg", instructions: "1 tablet once daily after food × 3 days (as written)", days: 3, active: false },
    { id: "i2", brand: "Dolo 650", salt: "paracetamol", strength: "650 mg", instructions: "1 tablet if fever (as written)", active: true },
  ],
  outcome: "Cough did not improve after the azithromycin course",
};

export const RAMESH_STANDING_RX: Omit<Prescription, "patientId"> = {
  id: "rx_0312", date: "2026-03-12", doctor: "Dr. Anita Mehta", note: "Long-term medicine from an earlier visit (fictional)",
  items: [{ id: "i1", brand: "Glycomet 500", salt: "metformin", strength: "500 mg", instructions: "As written on the prescription", active: true }],
};

export function ramessCarePlan(patientId: string, now: string): CarePlan {
  return {
    id: "cp_0909", patientId, createdAt: "2026-09-09T11:00:00", title: "Care plan — visit of 9 Sep", doctor: "Dr. Anita Mehta", origin: "seeded", active: true,
    items: [
      { id: "ci1", category: "medicine", text: { en: "Take Azithral 500 once a day after food for 3 days (completed).", hi: "Azithral 500 दिन में एक बार खाने के बाद 3 दिन लें (पूरा हुआ)।", mr: "Azithral 500 दिवसातून एकदा जेवणानंतर 3 दिवस घ्या (पूर्ण झाले)." }, doctorQuote: "Take Azithral after food, once a day for three days.", segment: { start: 2, end: 7 } },
      { id: "ci2", category: "test", text: { en: "Get a sputum test done.", hi: "बलगम की जाँच कराएँ।", mr: "थुंकीची तपासणी करून घ्या." }, doctorQuote: "Please get a sputum test done at the lab.", segment: { start: 8, end: 12 } },
      { id: "ci3", category: "diet", text: { en: "Avoid cold and oily food.", hi: "ठंडा और तैलीय खाना न खाएँ।", mr: "थंड आणि तेलकट अन्न टाळा." }, doctorQuote: "Avoid cold things and oily food.", segment: { start: 13, end: 17 } },
      { id: "ci4", category: "follow_up", text: { en: "Come back for review after 15 days.", hi: "15 दिन बाद दोबारा दिखाने आएँ।", mr: "15 दिवसांनी पुन्हा तपासणीसाठी या." }, doctorQuote: "Come back after fifteen days.", segment: { start: 18, end: 21 } },
      { id: "ci5", category: "danger_sign", text: { en: "If the fever goes above 102, come at once.", hi: "बुख़ार 102 से ऊपर जाए तो तुरंत आएँ।", mr: "ताप 102 च्या वर गेल्यास लगेच या." }, doctorQuote: "If the fever goes above one hundred two, come at once.", segment: { start: 22, end: 27 } },
    ],
  };
}

export function ramesReminders(patientId: string, today: string): Reminder[] {
  const d = (n: number) => addDays(today, n);
  return [
    { id: "rm1", patientId, carePlanId: "cp_0909", careItemId: "ci1", title: "Azithral 500 after food (course)", category: "medicine", time: "09:00", startDate: "2026-09-09", endDate: "2026-09-11", repeat: "daily", completions: { "2026-09-09": true, "2026-09-10": true, "2026-09-11": true }, createdBy: "seed" },
    { id: "rm2", patientId, carePlanId: "cp_0909", careItemId: "ci2", title: "Sputum test at the lab", category: "test", time: "10:00", startDate: today, repeat: "once", completions: {}, createdBy: "seed" },
    { id: "rm3", patientId, carePlanId: "cp_0909", careItemId: "ci3", title: "Avoid cold and oily food", category: "diet", time: "13:00", startDate: d(-2), endDate: d(5), repeat: "daily", completions: { [d(-2)]: true, [d(-1)]: true }, createdBy: "seed" },
    { id: "rm4", patientId, carePlanId: "cp_0909", careItemId: "ci4", title: "Follow-up review with the doctor", category: "follow_up", time: "17:00", startDate: "2026-09-24", repeat: "once", completions: {}, createdBy: "seed" },
  ];
}

export function otherCases(): { cases: Case[]; reports: Report[] } {
  const mk = (id: string, pid: string, title: string, review: Case["review"], when: string): Case => ({ id, patientId: pid, title, createdAt: when, updatedAt: when, status: "completed", files: [], intake: {}, reportId: `r_${id}`, review, seeded: true });
  const cases = [
    mk("c_2018", "p_sunita", "Skin photo screening", { status: "awaiting", notes: [] }, "2026-09-28T10:00:00"),
    mk("c_2031", "p_anil", "Brain MRI + blood report", { status: "in_review", notes: [{ id: "n1", at: "2026-09-29T12:00:00", author: "Dr. Anita Mehta", text: "Reviewing creatinine trend with MRI report." }] }, "2026-09-27T10:00:00"),
    mk("c_2044", "p_meera", "ECG + chest X-ray", { status: "reviewed", notes: [{ id: "n2", at: "2026-09-26T16:00:00", author: "Dr. Anita Mehta", text: "No concerns; routine follow-up." }], reviewedBy: "Dr. Anita Mehta" }, "2026-09-25T10:00:00"),
    mk("c_0909", "p_ramesh", "Visit 1 — cough and fever (prescription)", { status: "reviewed", notes: [], reviewedBy: "Dr. Anita Mehta" }, "2026-09-09T11:30:00"),
  ];
  const reports = [
    simpleReport("r_c_2018", "c_2018", "p_sunita", "2026-09-28T10:05:00", "medium", { en: "A skin lesion pattern needs a doctor's look. The AI is not very sure." }, [{ text: "The AI sees a pattern on the skin photo that a doctor should look at. It is only 62 percent sure.", doctor: "Skin lesion model: lesion type undetermined, score 0.62 (illustrative demo value). Dataset skews to light skin tones.", modelId: "skin_effnet_b0", conf: 0.62, risk: "not_sure", domain: "skin" }]),
    simpleReport("r_c_2031", "c_2031", "p_anil", "2026-09-27T10:05:00", "low", { en: "No tumor pattern seen on the demo MRI output; one kidney-function value needs follow-up." }, [{ text: "The brain MRI check did not show a tumor pattern. The AI is 90 percent sure.", doctor: "Brain MRI head: no_tumor 0.90 (illustrative).", modelId: "brain_mri_head", conf: 0.9, risk: "normal", domain: "brain" }, { text: "Your creatinine value is slightly above the illustrative range.", doctor: "Creatinine 1.4 mg/dL (illustrative range 0.7–1.3).", modelId: "lab_rules", conf: 0.88, risk: "show_doctor", domain: "kidney" }]),
    simpleReport("r_c_2044", "c_2044", "p_meera", "2026-09-25T10:05:00", "low", { en: "Heart test and chest X-ray both look normal in the demo output." }, [{ text: "Your heart test looks normal. The AI is 91 percent sure.", doctor: "ECG: normal 0.91 (illustrative).", modelId: "ecg_resnet1d_int8", conf: 0.91, risk: "normal", domain: "heart" }, { text: "Your chest X-ray looks normal.", doctor: "CXR: no focal finding (illustrative).", modelId: "cxr_densenet121", conf: 0.88, risk: "normal", domain: "lungs" }]),
    simpleReport("r_c_0909", "c_0909", "p_ramesh", "2026-09-09T11:35:00", "low", { en: "Your prescription from 9 September was read and added to your records." }, [{ text: "Prescription read: Azithral 500 (azithromycin) and Dolo 650 (paracetamol). Added to Patient Memory.", doctor: "Document reader: 2 medicines extracted from prescription dated 9 Sep (illustrative).", modelId: "doc_reader", conf: 0.93, risk: "normal", domain: "history" }]),
  ];
  return { cases, reports };
}

export const todayKey = () => dayKey();
