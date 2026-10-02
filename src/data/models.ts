import type { BodyArea, FileCategory } from "@/lib/types";

/**
 * Model catalog transcribed from the project document §12 (7 conditions) and §22 (Model List).
 * RAM figures are ILLUSTRATIVE sizes used only by the simulated loader — the project document
 * states its own sizes are examples to be replaced by measured values. Nothing here is a benchmark.
 */
export interface CatalogModel {
  id: string;
  name: string;
  kind: "encoder" | "head" | "specialist" | "rules" | "reader";
  /** Spec §12 condition number this model serves, if any. */
  condition?: number;
  bodyArea: BodyArea;
  modality: string;
  inputs: FileCategory[];
  task: string;
  finds: string[];
  encoder?: string;
  ramMb: number;
  lightId?: string;
  isLight?: boolean;
  escalateTo?: string;
  resource: "tiny" | "light" | "medium" | "heavy";
  trainedOn?: string;
  version: string;
  alwaysLoaded?: boolean;
  /** Spec-stated caveat shown with the model. */
  caveat?: string;
}

export const MODELS: CatalogModel[] = [
  {
    id: "biomedclip_encoder",
    name: "BiomedCLIP shared image encoder (int8)",
    kind: "encoder",
    bodyArea: "general",
    modality: "Image (X-ray, MRI, CT, skin photo)",
    inputs: ["xray", "mri", "ct", "skin_photo"],
    task: "Shared encoder: reads each image once and produces an embedding that tiny disease heads reuse; also used by the File Check.",
    finds: ["image embedding", "file type match"],
    ramMb: 95,
    resource: "light",
    trainedOn: "PMC-15M medical image–text pairs (per project document)",
    version: "demo-1.0",
    alwaysLoaded: true,
  },
  {
    id: "tb_head",
    name: "TB risk head",
    kind: "head",
    condition: 3,
    bodyArea: "lungs",
    modality: "Chest X-ray",
    inputs: ["xray"],
    task: "Tuberculosis risk screening on top of the shared encoder.",
    finds: ["tuberculosis risk"],
    encoder: "biomedclip_encoder",
    ramMb: 1,
    resource: "tiny",
    trainedOn: "TB Chest X-ray Database (Kaggle, open)",
    version: "demo-1.0",
  },
  {
    id: "cxr_densenet121",
    name: "Chest X-ray specialist (DenseNet121, fp32)",
    kind: "specialist",
    condition: 2,
    bodyArea: "lungs",
    modality: "Chest X-ray",
    inputs: ["xray"],
    task: "18 chest findings (pneumonia, opacity, effusion, nodule, cardiomegaly and others).",
    finds: ["pneumonia", "lung opacity", "effusion", "nodule", "cardiomegaly"],
    ramMb: 700,
    lightId: "cxr_densenet121_int8",
    resource: "heavy",
    trainedOn: "Large public chest X-ray datasets via TorchXRayVision",
    version: "demo-1.0",
    caveat: "Phone photos of X-ray films are less clear than the original digital image, so accuracy can be lower.",
  },
  {
    id: "cxr_densenet121_int8",
    name: "Chest X-ray specialist (DenseNet121, int8 light)",
    kind: "specialist",
    condition: 2,
    bodyArea: "lungs",
    modality: "Chest X-ray",
    inputs: ["xray"],
    task: "Same task as the fp32 version, ~4× smaller after int8 quantization.",
    finds: ["pneumonia", "lung opacity", "effusion", "nodule", "cardiomegaly"],
    ramMb: 180,
    isLight: true,
    resource: "light",
    version: "demo-1.0-int8",
  },
  {
    id: "brain_mri_head",
    name: "Brain MRI head",
    kind: "head",
    condition: 1,
    bodyArea: "brain",
    modality: "Brain MRI",
    inputs: ["mri"],
    task: "Fast brain-tumor check: glioma, meningioma, pituitary tumor, or no tumor.",
    finds: ["glioma", "meningioma", "pituitary tumor", "no tumor"],
    encoder: "biomedclip_encoder",
    ramMb: 1,
    escalateTo: "brain_effnet_b0_int8",
    resource: "tiny",
    trainedOn: "Brain Tumor MRI Dataset (Kaggle, open)",
    version: "demo-1.0",
  },
  {
    id: "brain_effnet_b0_int8",
    name: "Brain MRI confirmer (EfficientNet-B0, int8)",
    kind: "specialist",
    condition: 1,
    bodyArea: "brain",
    modality: "Brain MRI",
    inputs: ["mri"],
    task: "Cascade confirmer — loaded only if the tiny head says 'possible problem' or 'not sure'.",
    finds: ["glioma", "meningioma", "pituitary tumor", "no tumor"],
    ramMb: 150,
    resource: "light",
    version: "demo-1.0-int8",
  },
  {
    id: "ecg_resnet1d_int8",
    name: "ECG 1D-ResNet (int8)",
    kind: "specialist",
    condition: 4,
    bodyArea: "heart",
    modality: "12-lead ECG file",
    inputs: ["ecg"],
    task: "Normal, heart-attack pattern, ST/T-wave change, conduction problem, thick heart wall.",
    finds: ["normal", "MI pattern", "ST-T change", "conduction disturbance", "hypertrophy"],
    ramMb: 90,
    resource: "light",
    trainedOn: "PTB-XL (PhysioNet, open)",
    version: "demo-1.0-int8",
  },
  {
    id: "skin_effnet_b0",
    name: "Skin lesion model (EfficientNet-B0)",
    kind: "specialist",
    condition: 6,
    bodyArea: "skin",
    modality: "Skin photo",
    inputs: ["skin_photo"],
    task: "7 skin lesion types, including melanoma and basal cell carcinoma.",
    finds: ["melanoma", "basal cell carcinoma", "nevus", "other lesion types"],
    ramMb: 140,
    resource: "light",
    trainedOn: "HAM10000 (open)",
    version: "demo-1.0",
    caveat: "HAM10000 has mostly light-skin images, so accuracy on Indian skin tones may be lower.",
  },
  {
    id: "kidney_ct_head",
    name: "Kidney CT head",
    kind: "head",
    condition: 7,
    bodyArea: "kidney",
    modality: "Kidney CT",
    inputs: ["ct"],
    task: "Kidney stone, cyst or tumor on CT, on top of the shared encoder.",
    finds: ["stone", "cyst", "tumor", "normal"],
    encoder: "biomedclip_encoder",
    ramMb: 1,
    resource: "tiny",
    trainedOn: "CT Kidney Dataset (Kaggle, open)",
    version: "demo-1.0",
  },
  {
    id: "lab_rules",
    name: "Lab report reader + rules",
    kind: "rules",
    condition: 7,
    bodyArea: "blood",
    modality: "Lab report (PDF / photo)",
    inputs: ["lab_report"],
    task: "Extracts lab values and applies clear rules with normal ranges: anemia, diabetes control, thyroid, kidney function.",
    finds: ["HbA1c", "hemoglobin", "creatinine", "thyroid", "WBC / CRP"],
    ramMb: 260,
    resource: "medium",
    version: "demo-1.0",
  },
  {
    id: "doc_reader",
    name: "Document reader (OCR + fact extraction)",
    kind: "reader",
    bodyArea: "general",
    modality: "Prescription / clinical note",
    inputs: ["prescription", "clinical_note"],
    task: "Reads text, finds medicines, dates and values, and links each fact to its source page (Patient Memory ingest).",
    finds: ["medicines", "dates", "diagnoses"],
    ramMb: 220,
    resource: "medium",
    version: "demo-1.0",
  },
];

export const MODEL_BY_ID: Record<string, CatalogModel> = Object.fromEntries(MODELS.map((m) => [m.id, m]));

/** The seven condition groups from project document §12. */
export const CONDITIONS: {
  n: number;
  area: BodyArea;
  areaLabel: string;
  screen: string;
  input: string;
  plan: string;
  modelIds: string[];
}[] = [
  { n: 1, area: "brain", areaLabel: "Brain", screen: "Brain tumor: glioma, meningioma, pituitary tumor, or no tumor", input: "MRI image", plan: "Tiny head on the shared image model for a fast check; EfficientNet-B0 to confirm", modelIds: ["brain_mri_head", "brain_effnet_b0_int8"] },
  { n: 2, area: "lungs", areaLabel: "Lungs", screen: "Pneumonia, lung opacity, fluid, nodule and 14 other findings", input: "Chest X-ray", plan: "TorchXRayVision DenseNet121 — 18 findings", modelIds: ["cxr_densenet121", "cxr_densenet121_int8"] },
  { n: 3, area: "lungs", areaLabel: "Lungs", screen: "Tuberculosis risk", input: "Chest X-ray", plan: "Tiny head on the shared image model", modelIds: ["tb_head"] },
  { n: 4, area: "heart", areaLabel: "Heart", screen: "Normal, heart-attack pattern, ST and T wave changes, conduction problems, thick heart wall", input: "12-lead ECG file", plan: "1D ResNet trained on PTB-XL", modelIds: ["ecg_resnet1d_int8"] },
  { n: 5, area: "heart", areaLabel: "Heart", screen: "Enlarged heart (cardiomegaly)", input: "Chest X-ray", plan: "Output of the chest X-ray model, cross-checked with the ECG", modelIds: ["cxr_densenet121"] },
  { n: 6, area: "skin", areaLabel: "Skin", screen: "7 types of skin lesions, including melanoma and basal cell carcinoma", input: "Skin photo", plan: "EfficientNet-B0 trained on HAM10000", modelIds: ["skin_effnet_b0"] },
  { n: 7, area: "kidney", areaLabel: "Kidney and blood", screen: "Kidney stone, cyst or tumor on CT; anemia, diabetes control, thyroid and kidney function from lab reports", input: "CT image, lab report", plan: "Tiny head on shared model for CT; AI extraction plus clear rules for lab values", modelIds: ["kidney_ct_head", "lab_rules"] },
];

export const CATEGORY_LABEL: Record<FileCategory, string> = {
  xray: "Chest X-ray",
  mri: "Brain MRI",
  ct: "CT scan",
  skin_photo: "Skin photo",
  ecg: "ECG",
  lab_report: "Lab report",
  prescription: "Prescription",
  clinical_note: "Clinical note",
  audio: "Audio recording",
  unknown: "Unclassified",
};

export const AREA_LABEL: Record<BodyArea, string> = {
  lungs: "Lungs",
  heart: "Heart",
  brain: "Brain",
  skin: "Skin",
  kidney: "Kidney",
  blood: "Blood / labs",
  general: "General",
  unknown: "Unknown",
};

export const CATEGORY_AREA: Record<FileCategory, BodyArea> = {
  xray: "lungs",
  mri: "brain",
  ct: "kidney",
  skin_photo: "skin",
  ecg: "heart",
  lab_report: "blood",
  prescription: "general",
  clinical_note: "general",
  audio: "general",
  unknown: "unknown",
};

/** Models that an ordinary fixed rule would pick for a given file category. */
export function modelsForCategory(cat: FileCategory): string[] {
  switch (cat) {
    case "xray": return ["tb_head", "cxr_densenet121"];
    case "mri": return ["brain_mri_head"];
    case "ct": return ["kidney_ct_head"];
    case "skin_photo": return ["skin_effnet_b0"];
    case "ecg": return ["ecg_resnet1d_int8"];
    case "lab_report": return ["lab_rules"];
    case "prescription":
    case "clinical_note": return ["doc_reader"];
    default: return [];
  }
}
