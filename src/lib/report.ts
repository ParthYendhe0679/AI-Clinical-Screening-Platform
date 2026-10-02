import type { Case, ConsistencyItem, Finding, L, Report, UrgencyLevel } from "./types";
import { MODEL_BY_ID, CATEGORY_LABEL } from "@/data/models";
import { includedFiles } from "./sim";

/** All confidences/outputs below are FIXED ILLUSTRATIVE demo values — never computed from any file. */

const has = (c: Case, docId: string) => includedFiles(c.files).some((f) => f.docId === docId);

export function buildReport(c: Case, now: string): Report {
  const files = includedFiles(c.files);
  const scenario = files.length > 0 && files.every((f) => f.sample && f.docId);
  const run = c.run!;
  const modelsRun = Array.from(new Set(run.plan.steps.map((s) => s.modelId))).map((id) => ({
    modelId: id, version: MODEL_BY_ID[id].version, cached: run.events.some((e) => e.type === "cache_hit" && e.modelId === id),
  }));
  const base = { id: `r_${c.id}`, caseId: c.id, patientId: c.patientId, createdAt: now, modelsRun };
  if (!scenario) return templateReport(c, base);

  const X = has(c, "d_xray_0930"), E = has(c, "d_ecg_0930"), B = has(c, "d_lab_0930");
  const f: Finding[] = [];
  if (X) {
    f.push({ id: "f_cxr", domain: "lungs", source: "model", modelId: "cxr_densenet121", confidence: 0.81, risk: "see_soon", date: "2026-09-30",
      patientText: { en: "Your chest X-ray shows signs that may mean an infection in the lower right lung. The AI is 81 percent sure.", hi: "आपके छाती के एक्स-रे में दाएँ फेफड़े के निचले हिस्से में संक्रमण के संकेत दिख सकते हैं। AI 81 प्रतिशत निश्चित है।", mr: "तुमच्या छातीच्या एक्स-रेमध्ये उजव्या फुफ्फुसाच्या खालच्या भागात संसर्गाची चिन्हे दिसू शकतात. AI 81 टक्के खात्रीशीर आहे." },
      doctorText: "CXR: right lower-zone opacity, pattern suggestive of consolidation / infection. Model score 0.81 (illustrative demo value).",
      evidence: [{ kind: "model_output", modelId: "cxr_densenet121", category: "xray" }, { kind: "document", docId: "d_xray_0930", lineId: "x1" }] });
    f.push({ id: "f_tb", domain: "lungs", source: "model", modelId: "tb_head", confidence: 0.86, risk: "normal", date: "2026-09-30",
      patientText: { en: "The X-ray does not show signs of TB. The AI is fairly sure.", hi: "एक्स-रे में टीबी के संकेत नहीं दिखते। AI काफ़ी हद तक निश्चित है।", mr: "एक्स-रेमध्ये टीबीची चिन्हे दिसत नाहीत. AI बऱ्यापैकी खात्रीशीर आहे." },
      doctorText: "TB head: low TB-risk score 0.14 (registry thresholds low 0.3 / high 0.7). Confidence in 'low risk' 0.86 (illustrative).",
      uncertainty: "A normal-looking X-ray does not rule TB out when a cough lasts weeks; the sputum test advised on 9 Sep is still pending.",
      evidence: [{ kind: "model_output", modelId: "tb_head", category: "xray" }, { kind: "document", docId: "d_xray_0930", lineId: "x1" }] });
    f.push({ id: "f_eff", domain: "lungs", source: "model", modelId: "cxr_densenet121", confidence: 0.55, risk: "not_sure", date: "2026-09-30",
      patientText: { en: "The AI is not sure whether there is a little fluid at the base of your lung (55 percent). A doctor may ask for a side-view X-ray.", hi: "AI निश्चित नहीं है कि फेफड़े के आधार पर थोड़ा तरल है या नहीं (55 प्रतिशत)। डॉक्टर साइड-व्यू एक्स-रे माँग सकते हैं।", mr: "फुफ्फुसाच्या तळाशी थोडे द्रव आहे की नाही याची AI ला खात्री नाही (55 टक्के). डॉक्टर बाजूचा एक्स-रे मागू शकतात." },
      doctorText: "Possible small effusion, model score 0.55 — in the 'not sure' band. Lateral view may help.",
      uncertainty: "Score is close to a coin flip; the model is not sure.", evidence: [{ kind: "model_output", modelId: "cxr_densenet121", category: "xray" }] });
    f.push({ id: "f_heart", domain: "heart", source: "model", modelId: "cxr_densenet121", confidence: 0.82, risk: "normal", date: "2026-09-30",
      patientText: { en: "Your heart does not look enlarged on the X-ray.", hi: "एक्स-रे पर आपका हृदय बड़ा नहीं दिखता।", mr: "एक्स-रेवर तुमचे हृदय मोठे दिसत नाही." },
      doctorText: "Cardiomegaly score 0.18 from the chest X-ray model → heart size within normal limits (illustrative).", evidence: [{ kind: "model_output", modelId: "cxr_densenet121", category: "xray" }] });
  }
  if (E) f.push({ id: "f_ecg", domain: "heart", source: "model", modelId: "ecg_resnet1d_int8", confidence: 0.74, risk: "show_doctor", date: "2026-09-30",
    patientText: { en: "Your heart test shows a small change that a doctor should look at.", hi: "आपके हृदय परीक्षण में एक छोटा बदलाव दिखता है जिसे डॉक्टर को देखना चाहिए।", mr: "तुमच्या हृदय तपासणीत एक छोटासा बदल दिसतो ज्याकडे डॉक्टरांनी पाहावे." },
    doctorText: "12-lead ECG: ST-T change, leads V4–V6. Model score 0.74 (illustrative). Not an MI diagnosis.",
    evidence: [{ kind: "model_output", modelId: "ecg_resnet1d_int8", category: "ecg" }, { kind: "document", docId: "d_ecg_0930", lineId: "e1" }] });
  if (B) {
    f.push({ id: "f_hba1c", domain: "blood", source: "record", risk: "show_doctor", date: "2026-09-30",
      patientText: { en: "Your sugar level (HbA1c) went up from 7.2 to 8.4 in 6 months.", hi: "आपका शुगर लेवल (HbA1c) 6 महीनों में 7.2 से बढ़कर 8.4 हो गया।", mr: "तुमची साखरेची पातळी (HbA1c) 6 महिन्यांत 7.2 वरून 8.4 झाली." },
      doctorText: "HbA1c 7.2 % (12 Mar) → 7.8 % (10 Jun) → 8.4 % (30 Sep). Rising trend.",
      evidence: [{ kind: "document", docId: "d_lab_0312", lineId: "l1" }, { kind: "document", docId: "d_lab_0610", lineId: "l1" }, { kind: "document", docId: "d_lab_0930", lineId: "l1" }] });
    f.push({ id: "f_crp", domain: "blood", source: "record", risk: "show_doctor", date: "2026-09-30",
      patientText: { en: "Your blood report shows a raised infection marker (CRP 38). Your white blood cell count is in the normal range.", hi: "आपकी ख़ून की रिपोर्ट में संक्रमण का मार्कर (CRP 38) बढ़ा है। आपकी श्वेत रक्त कोशिकाओं की गिनती सामान्य सीमा में है।", mr: "तुमच्या रक्त अहवालात संसर्गाचा मार्कर (CRP 38) वाढलेला आहे. पांढऱ्या पेशींची संख्या सामान्य मर्यादेत आहे." },
      doctorText: "CRP 38 mg/L (high; illustrative range < 5). WBC 7.9 ×10³/µL (within illustrative range).", evidence: [{ kind: "document", docId: "d_lab_0930", lineId: "l6" }, { kind: "document", docId: "d_lab_0930", lineId: "l5" }] });
  }
  f.push({ id: "f_prev", domain: "history", source: "record", date: "2026-09-09",
    patientText: { en: "Last visit on 9 September: Azithral 500 (azithromycin) was given for 3 days. The cough did not improve.", hi: "पिछली विज़िट 9 सितंबर: Azithral 500 (azithromycin) 3 दिन के लिए दी गई थी। खाँसी में सुधार नहीं हुआ।", mr: "मागील भेट 9 सप्टेंबर: Azithral 500 (azithromycin) 3 दिवसांसाठी दिले होते. खोकल्यात सुधारणा झाली नाही." },
    doctorText: "9 Sep: Azithral 500 (azithromycin) × 3 days + Dolo 650 PRN. No improvement of cough reported at follow-up.",
    evidence: [{ kind: "document", docId: "d_rx_0909", lineId: "m1" }, { kind: "document", docId: "d_note_followup", lineId: "f1" }] });
  if (X) f.push({ id: "f_g1", domain: "lungs", source: "guideline", patientText: { en: "For people with diabetes, a lung infection should be checked by a doctor promptly. (Illustrative demo guideline)", hi: "मधुमेह वाले लोगों में फेफड़े के संक्रमण की डॉक्टर से जल्दी जाँच होनी चाहिए। (उदाहरण डेमो दिशानिर्देश)", mr: "मधुमेह असलेल्या लोकांमध्ये फुफ्फुसाच्या संसर्गाची डॉक्टरांनी लवकर तपासणी करावी. (उदाहरण डेमो मार्गदर्शक)" }, doctorText: "Illustrative guideline placeholder: lung infection in diabetes → prompt medical review.", evidence: [{ kind: "guideline", guidelineId: "g_dm_lung" }] });
  f.push({ id: "f_g2", domain: "lungs", source: "guideline", patientText: { en: "A cough lasting more than two weeks should be followed by a doctor-ordered sputum test. (Illustrative demo guideline)", hi: "दो सप्ताह से अधिक खाँसी में डॉक्टर द्वारा बताई गई बलगम जाँच करानी चाहिए। (उदाहरण डेमो दिशानिर्देश)", mr: "दोन आठवड्यांपेक्षा जास्त खोकल्यात डॉक्टरांनी सांगितलेली थुंकी तपासणी करावी. (उदाहरण डेमो मार्गदर्शक)" }, doctorText: "Illustrative guideline placeholder: prolonged cough → sputum test.", evidence: [{ kind: "guideline", guidelineId: "g_cough_tb" }] });
  const sumRefs = f.filter((x) => ["f_cxr", "f_hba1c", "f_g1"].includes(x.id)).map((x) => ({ kind: "finding" as const, findingId: x.id }));
  f.push({ id: "f_sum", domain: "history", source: "summary", patientText: { en: "Summary: several results may point to a chest infection, and your sugar level has risen. A doctor should review these together soon.", hi: "सारांश: कई परिणाम छाती के संक्रमण की ओर इशारा कर सकते हैं और आपका शुगर लेवल बढ़ा है। डॉक्टर को इन्हें साथ में जल्द देखना चाहिए।", mr: "सारांश: अनेक निकाल छातीतील संसर्गाकडे निर्देश करू शकतात आणि तुमची साखर वाढली आहे. डॉक्टरांनी हे एकत्र लवकर तपासावे." }, doctorText: "AI summary of f_cxr + f_hba1c + guideline placeholder. Linked to its sources.", evidence: sumRefs });

  const k: ConsistencyItem[] = [];
  if (X && B) {
    k.push({ id: "k1", title: "X-ray vs infection marker (CRP)", status: "consistent", between: ["f_cxr", "f_crp"], patientText: { en: "Your X-ray and your blood report agree with each other.", hi: "आपका एक्स-रे और ख़ून की रिपोर्ट आपस में मेल खाते हैं।", mr: "तुमचा एक्स-रे आणि रक्त अहवाल एकमेकांशी जुळतात." }, doctorText: "Raised CRP is compatible with the CXR infection pattern (consistent in demo data)." });
    k.push({ id: "k2", title: "X-ray vs white blood cell count", status: "conflicting", between: ["f_cxr", "f_crp"], patientText: { en: "Your white blood cell count is normal, which does not by itself match the X-ray signs. Please ask the doctor.", hi: "आपकी श्वेत रक्त कोशिकाओं की गिनती सामान्य है, जो अकेले एक्स-रे संकेतों से मेल नहीं खाती। कृपया डॉक्टर से पूछें।", mr: "तुमच्या पांढऱ्या पेशींची संख्या सामान्य आहे, जी एकट्याने एक्स-रेच्या चिन्हांशी जुळत नाही. कृपया डॉक्टरांना विचारा." }, doctorText: "Conflicting evidence: normal WBC vs CXR infection pattern. Cannot be resolved from the supplied data." });
  }
  if (X && E) k.push({ id: "k3", title: "ECG change vs X-ray heart size", status: "review", between: ["f_ecg", "f_heart"], patientText: { en: "The small heart change is not explained by the X-ray, so please ask the doctor about it.", hi: "दिल का छोटा बदलाव एक्स-रे से समझ नहीं आता, इसलिए कृपया डॉक्टर से पूछें।", mr: "हृदयातील छोटा बदल एक्स-रेने स्पष्ट होत नाही, म्हणून कृपया डॉक्टरांना विचारा." }, doctorText: "ST-T change on ECG is not explained by CXR (heart size normal). Requires professional review." });
  if (X) k.push({ id: "k4", title: "TB screen vs 3-week cough", status: "insufficient", between: ["f_tb", "f_g2"], patientText: { en: "No TB signs on the X-ray, but the sputum test is not done yet, so this is not settled.", hi: "एक्स-रे में टीबी के संकेत नहीं, पर बलगम जाँच अभी नहीं हुई, इसलिए बात तय नहीं है।", mr: "एक्स-रेमध्ये टीबीची चिन्हे नाहीत, पण थुंकी तपासणी अजून झाली नाही, म्हणून निष्कर्ष निश्चित नाही." }, doctorText: "Insufficient information: sputum test pending." });

  const urgency: UrgencyLevel = X ? "high" : B ? "medium" : "low";
  return { ...base, mode: "scenario", urgency,
    urgent: X ? { title: { en: "Please see a doctor today or tomorrow.", hi: "कृपया आज या कल डॉक्टर से मिलें।", mr: "कृपया आज किंवा उद्या डॉक्टरांना भेटा." }, reason: { en: "Reason (fixed demo scenario): breathlessness reported and a chest-infection pattern in the demo X-ray output.", hi: "कारण (निश्चित डेमो परिदृश्य): साँस फूलना और डेमो एक्स-रे आउटपुट में छाती संक्रमण का पैटर्न।", mr: "कारण (निश्चित डेमो परिस्थिती): धाप लागणे आणि डेमो एक्स-रे निकालात छातीतील संसर्गाचा नमुना." }, call108: true } : undefined,
    nextStep: { en: X ? "Please see a doctor today or tomorrow and show them this report." : "Please show this report to a doctor this week.", hi: X ? "कृपया आज या कल डॉक्टर से मिलें और यह रिपोर्ट दिखाएँ।" : "कृपया इस सप्ताह यह रिपोर्ट डॉक्टर को दिखाएँ।", mr: X ? "कृपया आज किंवा उद्या डॉक्टरांना भेटा आणि हा अहवाल दाखवा." : "कृपया या आठवड्यात हा अहवाल डॉक्टरांना दाखवा." },
    summary: f[f.length - 1].patientText, findings: f, consistency: k,
    uncertainties: [
      { id: "u1", patientText: { en: "The AI is not sure about possible fluid at the lung base. Ask the doctor about a side-view X-ray.", hi: "फेफड़े के आधार पर संभावित तरल के बारे में AI निश्चित नहीं है। साइड-व्यू एक्स-रे के बारे में डॉक्टर से पूछें।", mr: "फुफ्फुसाच्या तळाशी संभाव्य द्रवाबद्दल AI ला खात्री नाही. बाजूच्या एक्स-रेबद्दल डॉक्टरांना विचारा." }, doctorText: "Effusion score 0.55; lateral view suggested." },
      { id: "u2", patientText: { en: "The sputum test is still pending, so TB cannot be fully ruled out from these files.", hi: "बलगम जाँच बाकी है, इसलिए इन फ़ाइलों से टीबी पूरी तरह नकारी नहीं जा सकती।", mr: "थुंकी तपासणी बाकी आहे, म्हणून या फाइल्सवरून टीबी पूर्णपणे नाकारता येत नाही." }, doctorText: "Sputum test pending since 9 Sep." },
    ],
    removedBySourceCheck: [
      { text: "“Findings suggest bacterial pneumonia; an antibiotic should be taken.”", reason: "No supporting source, and contains medicine advice — removed (simulated Source Check)." },
      { text: "“The heart change is a sign of an old heart attack.”", reason: "Not supported by any model output or record — removed (simulated Source Check)." },
    ],
    labTests: ["HbA1c", "CRP"], missingData: ["Sputum test result (advised 9 Sep)", "Lateral chest X-ray", "No brain MRI, skin photo or kidney CT uploaded — those models were not run"],
  };
}

function templateReport(c: Case, base: Pick<Report, "id" | "caseId" | "patientId" | "createdAt" | "modelsRun">): Report {
  const files = includedFiles(c.files);
  const findings: Finding[] = files.map((f, i) => ({
    id: `t${i}`, domain: "history", source: "model", risk: "not_sure", date: f.addedAt.slice(0, 10),
    patientText: { en: `Demo output only: the checks for “${CATEGORY_LABEL[f.category]}” (${f.name}) would run here. No real analysis was performed on your file, so there is no medical finding.` },
    doctorText: `${f.name}: ${CATEGORY_LABEL[f.category]} — template row. No model output exists for this file.`,
    uncertainty: "Template report: structure demonstration only.", evidence: [{ kind: "model_output", modelId: "template", fileId: f.id, category: f.category }],
  }));
  const sum = { en: "This is a structure demonstration. Your own files were checked for format only; no medical AI ran and no findings were produced. Use “Load sample files” to see the full demo scenario." };
  return { ...base, mode: "template", urgency: "low", nextStep: { en: "Please show your original files to a doctor. This demo did not analyse them." }, summary: sum,
    findings, consistency: [{ id: "k0", title: "Cross-result check", status: "insufficient", between: [], patientText: { en: "Nothing to compare: no real model results exist." }, doctorText: "Insufficient information (template)." }],
    uncertainties: [{ id: "u0", patientText: sum, doctorText: "All outputs absent by design in template mode." }], removedBySourceCheck: [], labTests: [], missingData: ["Real analysis of uploaded files is not part of this frontend prototype"] };
}

/** Compact seeded reports for the other fictional demo patients. */
export function simpleReport(id: string, caseId: string, patientId: string, createdAt: string, urgency: UrgencyLevel, summary: L, items: { text: string; doctor: string; modelId: string; conf: number; risk: Finding["risk"]; domain: Finding["domain"] }[]): Report {
  return { id, caseId, patientId, createdAt, mode: "scenario", urgency, nextStep: { en: "Please show this report to a doctor this week." }, summary,
    findings: items.map((it, i) => ({ id: `${id}_f${i}`, domain: it.domain, source: "model", modelId: it.modelId, confidence: it.conf, risk: it.risk, patientText: { en: it.text }, doctorText: it.doctor, evidence: [{ kind: "model_output", modelId: it.modelId }] })),
    consistency: [{ id: "k", title: "Cross-result check", status: "insufficient", between: [], patientText: { en: "Only one data type was available, so results could not be cross-checked." }, doctorText: "Insufficient information." }],
    uncertainties: [], removedBySourceCheck: [], labTests: [], modelsRun: [...new Set(items.map((i) => i.modelId))].map((m) => ({ modelId: m, version: MODEL_BY_ID[m].version, cached: false })), missingData: [] };
}
