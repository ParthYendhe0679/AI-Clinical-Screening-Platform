import type { BodyArea, CaseFile, FileCategory, FileCheck, FileStatus, PreviewKind } from "./types";
import { CATEGORY_AREA, CATEGORY_LABEL } from "@/data/models";
import { sha256Hex, uid } from "./utils";

export const MAX_BYTES = 25 * 1024 * 1024;

/** `accept` is a convenience filter only — validity is decided by reading the file's bytes below. */
export const ACCEPT = [
  "image/png", "image/jpeg", "image/webp", "application/pdf", "audio/*",
  ".dcm", ".dicom", ".csv", ".txt", ".json", ".xml", ".hea", ".dat", ".wav", ".mp3", ".m4a", ".ogg", ".webm",
].join(",");

/* ---------------------- Runtime-only file registry ---------------------- */
// Real user files are kept ONLY in this tab's memory (never persisted, never uploaded).
interface Runtime {
  file: File;
  url?: string;
  text?: string;
  width?: number;
  height?: number;
}
const registry = new Map<string, Runtime>();

export function getRuntime(id: string) {
  return registry.get(id);
}
export function releaseRuntime(id: string) {
  const r = registry.get(id);
  if (r?.url) URL.revokeObjectURL(r.url);
  registry.delete(id);
}
export function releaseAllRuntime() {
  for (const id of Array.from(registry.keys())) releaseRuntime(id);
}

/* ------------------------------ Signature sniffing ------------------------------ */

interface Sniff {
  format: string;
  kind: "image" | "pdf" | "audio" | "dicom" | "text" | "unsupported" | "unknown";
  mime: string;
}

function ascii(b: Uint8Array, from: number, len: number) {
  return String.fromCharCode(...Array.from(b.slice(from, from + len)));
}

export function sniffBytes(b: Uint8Array): Sniff {
  if (b.length === 0) return { format: "Empty file", kind: "unknown", mime: "" };
  if (b[0] === 0x89 && ascii(b, 1, 3) === "PNG") return { format: "PNG image", kind: "image", mime: "image/png" };
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { format: "JPEG image", kind: "image", mime: "image/jpeg" };
  if (ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 4) === "WEBP") return { format: "WebP image", kind: "image", mime: "image/webp" };
  if (ascii(b, 0, 3) === "GIF") return { format: "GIF image", kind: "image", mime: "image/gif" };
  if (ascii(b, 0, 5) === "%PDF-") return { format: "PDF document", kind: "pdf", mime: "application/pdf" };
  if (b.length > 132 && ascii(b, 128, 4) === "DICM") return { format: "DICOM file", kind: "dicom", mime: "application/dicom" };
  if (ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 4) === "WAVE") return { format: "WAV audio", kind: "audio", mime: "audio/wav" };
  if (ascii(b, 0, 3) === "ID3" || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)) return { format: "MP3 audio", kind: "audio", mime: "audio/mpeg" };
  if (ascii(b, 0, 4) === "OggS") return { format: "Ogg audio", kind: "audio", mime: "audio/ogg" };
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return { format: "WebM audio/video", kind: "audio", mime: "audio/webm" };
  if (ascii(b, 4, 4) === "ftyp") return { format: "MP4/M4A audio", kind: "audio", mime: "audio/mp4" };
  if (b[0] === 0x4d && b[1] === 0x5a) return { format: "Windows executable", kind: "unsupported", mime: "application/x-msdownload" };
  if (b[0] === 0x50 && b[1] === 0x4b && (b[2] === 3 || b[2] === 5)) return { format: "ZIP archive", kind: "unsupported", mime: "application/zip" };
  if (b[0] === 0x7f && ascii(b, 1, 3) === "ELF") return { format: "Executable", kind: "unsupported", mime: "application/x-elf" };
  if (b[0] === 0x1f && b[1] === 0x8b) return { format: "GZIP archive", kind: "unsupported", mime: "application/gzip" };
  // text heuristic: mostly printable
  const n = Math.min(b.length, 512);
  let printable = 0;
  for (let i = 0; i < n; i++) {
    const c = b[i];
    if (c === 9 || c === 10 || c === 13 || (c >= 32 && c < 127)) printable++;
  }
  if (printable / n > 0.95) return { format: "Plain text / CSV", kind: "text", mime: "text/plain" };
  return { format: "Unrecognised binary", kind: "unknown", mime: "application/octet-stream" };
}

const HINTS: [RegExp, FileCategory][] = [
  [/x-?ray|cxr|chest|radiograph/i, "xray"],
  [/\bmri\b|mri_|_mri|brain/i, "mri"],
  [/(^|[^a-z])ct([^a-z]|$)|kidney|ctscan/i, "ct"],
  [/skin|lesion|derm|rash|mole/i, "skin_photo"],
  [/ecg|ekg|12.?lead|electrocardio/i, "ecg"],
  [/prescription|presc|\brx\b|rx_|_rx/i, "prescription"],
  [/lab|blood|cbc|hba1c|pathology|hemogram|report/i, "lab_report"],
  [/note|discharge|summary|clinical/i, "clinical_note"],
];

export function guessCategory(name: string, kind: Sniff["kind"]): { category: FileCategory; source: CaseFile["categorySource"] } {
  for (const [re, cat] of HINTS) if (re.test(name)) return { category: cat, source: "filename" };
  if (kind === "audio") return { category: "audio", source: "format" };
  return { category: "unknown", source: "none" };
}

function mkCheck(key: FileCheck["key"], label: string, status: FileCheck["status"], detail: string): FileCheck {
  return { key, label, status, detail };
}

function loadImageDims(url: string): Promise<{ w: number; h: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(null), 6000);
    img.onload = () => {
      clearTimeout(timer);
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

export function categorySupported(cat: FileCategory) {
  return cat !== "unknown" && cat !== "audio";
}

/** Recompute checks/status after the user picks a category by hand (or toggles nothing else). */
export function applyUserCategory(f: CaseFile, category: FileCategory): CaseFile {
  const checks = f.checks.filter((c) => c.key !== "category" && c.key !== "support");
  checks.push(mkCheck("category", "Modality / document category", "pass", `Set by you: ${CATEGORY_LABEL[category]}. (Not verified by any model.)`));
  checks.push(supportCheck(category));
  const status = deriveStatus(checks, f.status);
  return { ...f, category, categorySource: "user", bodyArea: CATEGORY_AREA[category], checks, status };
}

function supportCheck(cat: FileCategory): FileCheck {
  if (cat === "unknown") return mkCheck("support", "Supported by demo workflow", "warn", "Category unknown — choose one so the right model categories can be selected.");
  if (cat === "audio") return mkCheck("support", "Supported by demo workflow", "info", "Audio is accepted for the voice-help demo but no model is selected for it in a screening case.");
  return mkCheck("support", "Supported by demo workflow", "pass", `${CATEGORY_LABEL[cat]} is supported by the demo workflow.`);
}

function deriveStatus(checks: FileCheck[], prev: FileStatus): FileStatus {
  if (prev === "invalid" || prev === "unsupported") return prev;
  if (checks.some((c) => c.status === "fail")) return "invalid";
  if (checks.some((c) => c.status === "warn")) return "needs_review";
  return "ready";
}

/** Inspect a real browser File. Everything stays local; nothing is uploaded. */
export async function analyzeFile(file: File): Promise<CaseFile> {
  const id = uid("f");
  const checks: FileCheck[] = [];
  const base = {
    id,
    name: file.name,
    size: file.size,
    addedAt: new Date().toISOString(),
  };

  if (file.size === 0) {
    return {
      ...base, mimeType: file.type || "unknown", detectedFormat: "Empty file", category: "unknown", categorySource: "none",
      bodyArea: "unknown", previewKind: "none", status: "invalid",
      checks: [mkCheck("size", "File size", "fail", "The file is empty (0 bytes).")],
    };
  }
  if (file.size > MAX_BYTES) {
    return {
      ...base, mimeType: file.type || "unknown", detectedFormat: "Too large", category: "unknown", categorySource: "none",
      bodyArea: "unknown", previewKind: "none", status: "invalid",
      checks: [mkCheck("size", "File size", "fail", "Larger than the 25 MB demo limit. Large DICOM series are not supported in this prototype.")],
    };
  }

  let head = new Uint8Array(0);
  try {
    head = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  } catch {
    return {
      ...base, mimeType: file.type || "unknown", detectedFormat: "Unreadable", category: "unknown", categorySource: "none",
      bodyArea: "unknown", previewKind: "none", status: "invalid",
      checks: [mkCheck("format", "File format", "fail", "The browser could not read this file.")],
    };
  }

  const sniff = sniffBytes(head);
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
  checks.push(mkCheck("size", "File size", "pass", "Within the 25 MB demo limit."));

  if (sniff.kind === "unsupported") {
    checks.unshift(mkCheck("format", "File format", "fail", `${sniff.format} files are not supported. Accepted: images, PDF, DICOM, ECG data (CSV/text), audio.`));
    return { ...base, mimeType: file.type || sniff.mime, detectedFormat: sniff.format, category: "unknown", categorySource: "none", bodyArea: "unknown", previewKind: "none", status: "unsupported", checks };
  }
  if (sniff.kind === "unknown") {
    checks.unshift(mkCheck("format", "File format", "fail", "The file's contents do not match any supported format."));
    return { ...base, mimeType: file.type || sniff.mime, detectedFormat: sniff.format, category: "unknown", categorySource: "none", bodyArea: "unknown", previewKind: "none", status: "unsupported", checks };
  }

  const mismatch = ext && ((sniff.kind === "image" && !["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) || (sniff.kind === "pdf" && ext !== "pdf"));
  checks.unshift(
    mkCheck(
      "format", "File format", mismatch ? "warn" : "pass",
      mismatch ? `Contents look like a ${sniff.format} but the extension is “.${ext}”. The extension is not proof of what a file is.` : `Contents read as: ${sniff.format} (checked from the file's first bytes, not just its name).`,
    ),
  );

  const guess = guessCategory(file.name, sniff.kind);
  let category = guess.category;
  let categorySource = guess.source;
  if (sniff.kind === "dicom") {
    category = guess.category; // modality tag is not decoded in this prototype
  }
  checks.push(
    category === "unknown"
      ? mkCheck("category", "Modality / document category", "warn", "Could not reliably classify this file — marked for review. Choose a category below instead of trusting a guess.")
      : mkCheck("category", "Modality / document category", "pass", `Suggested from the ${categorySource === "filename" ? "file name" : "file format"}: ${CATEGORY_LABEL[category]}. This is a rule-based suggestion, not image recognition.`),
  );

  // Previews
  const rt: Runtime = { file };
  let previewKind: PreviewKind = "none";
  if (sniff.kind === "image") {
    try {
      rt.url = URL.createObjectURL(file);
      const dims = await loadImageDims(rt.url);
      if (!dims) {
        URL.revokeObjectURL(rt.url);
        rt.url = undefined;
        checks.push(mkCheck("preview", "Preview available", "warn", "The browser could not decode this image, so no preview can be shown."));
      } else {
        rt.width = dims.w;
        rt.height = dims.h;
        previewKind = "image";
        checks.push(mkCheck("preview", "Preview available", "pass", `Image preview OK (${dims.w}×${dims.h}px).`));
        if (Math.min(dims.w, dims.h) < 300) {
          checks.push(mkCheck("quality", "Quality check (simulated)", "warn", `Image is only ${dims.w}×${dims.h}px — a real system would ask for a clearer photo. (Pixel size is the only thing checked here.)`));
        } else {
          checks.push(mkCheck("quality", "Quality check (simulated)", "info", "Simulated: only pixel size was checked. No image-quality AI is run on your file in this prototype."));
        }
      }
    } catch {
      checks.push(mkCheck("preview", "Preview available", "warn", "Preview could not be created."));
    }
  } else if (sniff.kind === "pdf") {
    rt.url = URL.createObjectURL(file);
    previewKind = "pdf";
    checks.push(mkCheck("preview", "Preview available", "pass", "PDF preview uses your browser's built-in viewer (if it supports inline PDFs)."));
    checks.push(mkCheck("quality", "Quality check (simulated)", "info", "Simulated: no legibility or OCR check is run in this prototype."));
  } else if (sniff.kind === "audio") {
    rt.url = URL.createObjectURL(file);
    previewKind = "audio";
    checks.push(mkCheck("preview", "Preview available", "pass", "Audio can be played back locally."));
    checks.push(mkCheck("quality", "Quality check (simulated)", "info", "Simulated: no audio-quality or speech-to-text check is run."));
  } else if (sniff.kind === "dicom") {
    previewKind = "dicom";
    checks.push(mkCheck("preview", "Preview available", "warn", "DICOM detected, but this prototype has no DICOM viewer or tag reader. Modality must be set manually."));
    checks.push(mkCheck("quality", "Quality check (simulated)", "info", "Simulated: DICOM pixel data is not decoded in this prototype."));
    if (category === "unknown") categorySource = "none";
  } else if (sniff.kind === "text") {
    try {
      const text = await file.slice(0, 4000).text();
      rt.text = text;
      previewKind = "text";
      checks.push(mkCheck("preview", "Preview available", "pass", "First lines shown as text. ECG signal files are not plotted from your data in this prototype."));
    } catch {
      checks.push(mkCheck("preview", "Preview available", "warn", "Text could not be read."));
    }
    checks.push(mkCheck("quality", "Quality check (simulated)", "info", "Simulated: signal quality is not analysed."));
  }

  checks.push(supportCheck(category));
  registry.set(id, rt);

  const sha = file.size <= MAX_BYTES ? await sha256Hex(await file.arrayBuffer()).catch(() => undefined) : undefined;
  const status = deriveStatus(checks, "ready");

  return {
    ...base,
    mimeType: file.type || sniff.mime,
    detectedFormat: sniff.format,
    category,
    categorySource,
    bodyArea: CATEGORY_AREA[category] as BodyArea,
    previewKind,
    sha256: sha,
    checks,
    status,
  };
}

/* ---------------------------------- Samples ---------------------------------- */

const simQuality = (status: FileCheck["status"], detail: string) => mkCheck("quality", "Quality check (simulated)", status, detail);

function sampleFile(p: {
  name: string; size: number; format: string; mime: string; category: FileCategory; docId: string;
  blurry?: boolean;
}): CaseFile {
  const checks: FileCheck[] = [
    mkCheck("format", "File format", "pass", `Generated demo sample (${p.format}) — fictional content, no real file is read.`),
    mkCheck("category", "Modality / document category", "pass", `Sample is pre-labelled as ${CATEGORY_LABEL[p.category]}.`),
    mkCheck("preview", "Preview available", "pass", "Illustrative sample preview drawn by the app (not a real scan)."),
    p.blurry
      ? simQuality("warn", "Simulated: this sample is flagged as blurry to demonstrate the retake prompt. A real system would ask the patient to take the photo again.")
      : simQuality("info", "Simulated: sample content is pre-approved. No real quality analysis ran."),
    supportCheck(p.category),
    mkCheck("size", "File size", "pass", "Within the 25 MB demo limit."),
  ];
  return {
    id: uid("s"),
    name: p.name,
    size: p.size,
    mimeType: p.mime,
    detectedFormat: p.format,
    category: p.category,
    categorySource: "sample",
    bodyArea: CATEGORY_AREA[p.category],
    previewKind: "sample",
    checks,
    status: p.blurry ? "needs_review" : "ready",
    addedAt: new Date().toISOString(),
    sample: true,
    docId: p.docId,
    excluded: p.blurry ? true : undefined,
  };
}

export function createSampleFiles(kind: "ramesh" | "blurry"): CaseFile[] {
  if (kind === "blurry") {
    return [sampleFile({ name: "xray_chest_blurry_demo.jpg", size: 640_000, format: "JPEG image (sample)", mime: "image/jpeg", category: "xray", docId: "d_xray_0930", blurry: true })];
  }
  return [
    sampleFile({ name: "xray_chest_demo.png", size: 1_240_000, format: "PNG image (sample)", mime: "image/png", category: "xray", docId: "d_xray_0930" }),
    sampleFile({ name: "ecg_12lead_demo.csv", size: 86_400, format: "ECG signal CSV (sample)", mime: "text/csv", category: "ecg", docId: "d_ecg_0930" }),
    sampleFile({ name: "blood_report_2026-09-30.pdf", size: 214_000, format: "PDF document (sample)", mime: "application/pdf", category: "lab_report", docId: "d_lab_0930" }),
    sampleFile({ name: "blood_report_old_2026-06-10.jpg", size: 410_000, format: "JPEG image (sample)", mime: "image/jpeg", category: "lab_report", docId: "d_lab_0610" }),
    sampleFile({ name: "blood_report_old_2026-03-12.jpg", size: 388_000, format: "JPEG image (sample)", mime: "image/jpeg", category: "lab_report", docId: "d_lab_0312" }),
  ];
}
