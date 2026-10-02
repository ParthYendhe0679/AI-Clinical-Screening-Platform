/**
 * Small, explicit, locally defined brand→salt demonstration list.
 * The project document intends to use the Kaggle "A to Z Medicine Dataset of India" (250k+ brands);
 * that dataset is NOT bundled. Salts below are listed for the demo only. This list never
 * parses uploaded files and never suggests, replaces or doses any medicine.
 */
export interface MedicineEntry {
  brand: string;
  salt: string; // lowercase active ingredient(s), joined by " + "
  strength: string;
}

export const MEDICINES: MedicineEntry[] = [
  { brand: "Dolo 650", salt: "paracetamol", strength: "650 mg" },
  { brand: "Crocin 650", salt: "paracetamol", strength: "650 mg" },
  { brand: "Calpol 650", salt: "paracetamol", strength: "650 mg" },
  { brand: "Azithral 500", salt: "azithromycin", strength: "500 mg" },
  { brand: "Augmentin 625", salt: "amoxicillin + clavulanic acid", strength: "625 mg" },
  { brand: "Pan 40", salt: "pantoprazole", strength: "40 mg" },
  { brand: "Glycomet 500", salt: "metformin", strength: "500 mg" },
  { brand: "Cetzine", salt: "cetirizine", strength: "10 mg" },
  { brand: "Allegra 120", salt: "fexofenadine", strength: "120 mg" },
  { brand: "Brufen 400", salt: "ibuprofen", strength: "400 mg" },
];

export function findMedicine(brand: string): MedicineEntry | undefined {
  const q = brand.trim().toLowerCase();
  if (!q) return undefined;
  return MEDICINES.find((m) => m.brand.toLowerCase() === q) ?? MEDICINES.find((m) => m.brand.toLowerCase().startsWith(q));
}

export function saltParts(salt: string): string[] {
  return salt.split("+").map((s) => s.trim().toLowerCase()).filter(Boolean);
}
