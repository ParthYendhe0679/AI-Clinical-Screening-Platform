"use client";
import * as React from "react";
import { WarningOctagonIcon, PlusIcon, FlaskIcon, ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { useStore, getPatientForSession } from "@/store";
import type { Patient, Prescription, RxItem } from "@/lib/types";
import { Badge, Button, Card, EmptyState, Field, Input, PageHead, Sheet, SimBadge, toast, Select } from "@/components/ui";
import { MEDICINES, findMedicine, saltParts } from "@/data/medicines";
import { DOC_BY_ID } from "@/data/docs";
import { SourceDocView } from "./docs";
import { formatDate, uid } from "@/lib/utils";
import { t, LANGS } from "@/lib/i18n";
import { useHydratedFlag } from "./hooks";
import { ResetDemoButton, LangSelect } from "@/components/layout/shell";
import { RAMESH_RX } from "@/data/seed";

interface Warn { key: string; kind: "duplicate" | "allergy" | "tried"; text: string; refs: string[] }

/** Informational only. Compares brand→salt from the local demo list; never suggests a replacement or dose. */
export function checkRx(items: RxItem[], patient: Patient, others: Prescription[]): Warn[] {
  const w: Warn[] = [];
  const active = others.flatMap((r) => r.items.filter((i) => i.active).map((i) => ({ ...i, rx: r })));
  const newOnes = items.map((i) => ({ ...i, parts: saltParts(i.salt) }));
  newOnes.forEach((a, ai) => {
    newOnes.slice(ai + 1).forEach((b) => { const common = a.parts.filter((s) => b.parts.includes(s)); if (common.length) w.push({ key: `d:${a.brand}:${b.brand}`, kind: "duplicate", text: `${a.brand} and ${b.brand} both contain ${common.join(", ")}. Please ask your doctor before taking both.`, refs: [] }); });
    active.forEach((o) => { const common = a.parts.filter((s) => saltParts(o.salt).includes(s)); if (common.length && o.brand !== a.brand) w.push({ key: `d:${a.brand}:${o.brand}`, kind: "duplicate", text: `${a.brand} and ${o.brand} both contain ${common.join(", ")}. Please ask your doctor before taking both.`, refs: [o.rx.docId ?? o.rx.id] }); });
    patient.allergies.forEach((al) => { if (a.parts.some((s) => s.includes(al.toLowerCase()))) w.push({ key: `a:${a.brand}`, kind: "allergy", text: `${a.brand} contains ${al}, which is listed as an allergy in this (fictional) record. Please tell your doctor or pharmacist.`, refs: [] }); });
    others.filter((r) => r.outcome && r.date >= "2026-07-01").forEach((r) => r.items.forEach((o) => { if (saltParts(o.salt).some((s) => a.parts.includes(s)) && r.outcome?.toLowerCase().includes("not improve")) w.push({ key: `t:${a.brand}:${o.brand}`, kind: "tried", text: `${o.brand} (${o.salt}) was given on ${formatDate(r.date)} and the record says: “${r.outcome}”. Please tell your doctor.`, refs: [r.docId ?? r.id] }); }));
  });
  return w;
}

export function PrescriptionsPage({ forPatient }: { forPatient?: Patient }) {
  const me = useStore(getPatientForSession); const p = forPatient ?? me; const hydrated = useHydratedFlag(); const lang = useStore((s) => s.lang);
  const rxs = useStore((s) => s.prescriptions).filter((r) => r.patientId === p?.id).sort((a, b) => b.date.localeCompare(a.date)); const addRx = useStore((s) => s.addPrescription);
  const acks = useStore((s) => s.acks); const ack = useStore((s) => s.ack);
  const [open, setOpen] = React.useState<Prescription>(); const [add, setAdd] = React.useState(false); const [cmp, setCmp] = React.useState<string[]>([]); const [doc, setDoc] = React.useState<string>();
  const [brand, setBrand] = React.useState(""); const [draft, setDraft] = React.useState<RxItem[]>([]); const [err, setErr] = React.useState("");
  if (!hydrated || !p) return null;
  const warnsFor = (rx: Prescription) => checkRx(rx.items, p, rxs.filter((r) => r.id !== rx.id && r.date <= rx.date));
  const allWarns = rxs.flatMap((rx) => warnsFor(rx).map((w) => ({ ...w, rx })));
  const addItem = () => { const m = findMedicine(brand); if (!m) { setErr("That brand isn’t in this demo’s small local list. Pick one from the suggestions."); return; } setErr(""); setDraft((d) => [...d, { id: uid("i"), brand: m.brand, salt: m.salt, strength: m.strength, instructions: "As written by the doctor", active: true }]); setBrand(""); };
  const save = () => { if (!draft.length) return; addRx({ id: uid("rx"), patientId: p.id, date: new Date().toISOString().slice(0, 10), doctor: "Entered manually (demo)", items: draft }); setDraft([]); setAdd(false); toast("Prescription added", "success", "Compared with your history — see any warnings."); };
  const demoUpload = () => { const d = DOC_BY_ID["d_rx_0930"]; void d; addRx({ id: uid("rx"), patientId: p.id, date: "2026-09-30", doctor: "Dr. Anita Mehta", docId: "d_rx_0930", items: [{ id: "a", brand: "Crocin 650", salt: "paracetamol", strength: "650 mg", instructions: "1 tablet if fever (as written)", active: true }, { id: "b", brand: "Pan 40", salt: "pantoprazole", strength: "40 mg", instructions: "1 tablet before breakfast (as written)", active: true }] }); toast("Sample new prescription added", "warning", "A same-ingredient warning is now shown."); };
  const cmpRx = rxs.filter((r) => cmp.includes(r.id));
  return (
    <div><PageHead title={forPatient ? `${p.name} — medicines` : t(lang, "nav.medicines")} sub="Prescription history and same-ingredient warnings from a small local demo list. Information only — never a medicine, dose or switching suggestion." actions={!forPatient && <><Button variant="outline" onClick={() => setAdd(true)}><PlusIcon size={18} aria-hidden />Add prescription</Button><Button variant="purple" onClick={demoUpload} disabled={rxs.some((r) => r.docId === "d_rx_0930")}><FlaskIcon size={16} aria-hidden />Load sample new prescription</Button></>} />
      <p className="mb-4 rounded-xl bg-sun-soft p-3 text-xs font-medium text-sun-deep">Uploaded prescription images are not read by this prototype. Warnings use only the brands you add or the seeded demo prescriptions, matched against a tiny built-in brand→salt list ({MEDICINES.length} brands).</p>
      {allWarns.length > 0 && <div className="mb-5 space-y-3">{allWarns.map((w) => { const k = `${w.rx.id}:${w.key}`; const done = acks.includes(k); return (
        <div key={k} role="alert" className="rounded-2xl border-2 border-ink bg-sun-soft p-4 shadow-pop"><div className="flex items-start gap-3"><WarningOctagonIcon size={26} weight="duotone" className="shrink-0 text-sun-deep" aria-hidden /><div className="flex-1"><p className="text-sm font-extrabold">{w.kind === "duplicate" ? "Same medicine ingredient" : w.kind === "allergy" ? "Allergy on record" : "Already tried recently"}</p><p className="mt-1 text-sm">{w.text}</p><p className="mt-1 text-xs text-muted">Please consult the prescribing doctor or a pharmacist. This app does not tell you to take, stop or change any medicine.</p>
          {w.refs.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{w.refs.map((r) => DOC_BY_ID[r] ? <button key={r} className="rounded-full border border-mint-deep/40 bg-mint-soft px-2.5 py-0.5 text-[11px] font-bold text-mint-deep" onClick={() => setDoc(r)}>RECORD · {DOC_BY_ID[r].title}</button> : null)}</div>}
          <Button className="mt-3" size="sm" variant={done ? "success" : "outline"} aria-pressed={done} onClick={() => ack(k)}>{done ? "Acknowledged ✓" : "I will check with my doctor"}</Button></div></div></div>); })}</div>}
      {rxs.length === 0 ? <EmptyState icon={FlaskIcon} title="No prescriptions yet" body="Add one manually, or load the sample prescription." /> : <div className="grid gap-4 md:grid-cols-2">{rxs.map((rx) => <Card key={rx.id} className="p-5"><div className="flex items-start justify-between"><div><p className="font-display text-sm font-bold">{formatDate(rx.date)}</p><p className="text-xs text-muted">{rx.doctor}</p></div><label className="flex items-center gap-1 text-xs font-semibold"><input type="checkbox" className="accent-purple" checked={cmp.includes(rx.id)} onChange={(e) => setCmp((c) => (e.target.checked ? [...c, rx.id].slice(-2) : c.filter((x) => x !== rx.id)))} />Compare</label></div>
        <ul className="mt-3 space-y-1.5 text-sm">{rx.items.map((i) => <li key={i.id} className="rounded-xl bg-canvas px-3 py-2"><b>{i.brand}</b> <span className="text-muted">— {i.salt}</span></li>)}</ul>
        <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="soft" onClick={() => setOpen(rx)}>Details</Button>{rx.docId && <Button size="sm" variant="secondary" onClick={() => setDoc(rx.docId)}>Source</Button>}{warnsFor(rx).length > 0 && <Badge tone="sun">{warnsFor(rx).length} warning(s)</Badge>}</div></Card>)}</div>}
      {cmpRx.length === 2 && <Card variant="sticker" className="mt-5 p-5"><h2 className="text-lg font-bold">Comparison</h2><div className="mt-3 grid gap-3 md:grid-cols-2">{cmpRx.map((r) => <div key={r.id}><p className="text-sm font-bold">{formatDate(r.date)}</p><ul className="mt-1 space-y-1 text-sm">{r.items.map((i) => <li key={i.id} className={cmpRx.find((o) => o.id !== r.id)?.items.some((x) => saltParts(x.salt).some((s) => saltParts(i.salt).includes(s))) ? "rounded-lg bg-sun-soft px-2 py-1 font-semibold" : "px-2 py-1"}>{i.brand} <span className="text-muted">({i.salt})</span></li>)}</ul></div>)}</div><p className="mt-2 text-xs text-muted">Highlighted = shares an active ingredient with the other prescription. Ask your doctor or pharmacist.</p></Card>}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(undefined)} title="Prescription detail" description={open ? `${formatDate(open.date)} · ${open.doctor}` : undefined}>{open && <div className="space-y-3">{open.items.map((i) => <div key={i.id} className="rounded-2xl bg-white p-3 text-sm shadow-clay-sm"><p className="font-bold">{i.brand} <span className="font-normal text-muted">{i.strength}</span></p><p>Active ingredient: <b>{i.salt}</b></p><p className="text-xs text-muted">As recorded: {i.instructions}</p></div>)}{open.outcome && <p className="rounded-xl bg-canvas p-2 text-sm">Outcome on record: {open.outcome}</p>}{open.note && <p className="text-xs text-muted">{open.note}</p>}</div>}</Sheet>
      <Sheet open={add} onOpenChange={setAdd} title="Add a prescription (demo)" description="Pick brands from the small local list."><div className="space-y-3"><Field label="Brand" htmlFor="rb" error={err}><Input id="rb" list="brands" value={brand} onChange={(e) => setBrand(e.target.value)} aria-invalid={!!err} /></Field><datalist id="brands">{MEDICINES.map((m) => <option key={m.brand} value={m.brand} />)}</datalist><Button variant="secondary" onClick={addItem}>Add brand</Button>{draft.length > 0 && <ul className="text-sm">{draft.map((d) => <li key={d.id}>• {d.brand} — {d.salt}</li>)}</ul>}<Button className="w-full" disabled={!draft.length} onClick={save}>Save and compare</Button></div></Sheet>
      <Sheet open={!!doc} onOpenChange={(o) => !o && setDoc(undefined)} wide title="Source document">{doc && DOC_BY_ID[doc] && <SourceDocView doc={DOC_BY_ID[doc]} />}</Sheet>
    </div>
  );
}
void RAMESH_RX;

export function SettingsPage({ role }: { role: "patient" | "doctor" }) {
  const lang = useStore((s) => s.lang); const acct = useStore((s) => s.accounts.find((a) => a.id === s.session?.accountId)); const p = useStore(getPatientForSession);
  const loadDemo = useStore((s) => s.loadDemoInto); const hydrated = useHydratedFlag(); const setBudget = useStore((s) => s.setBudget); const budget = useStore((s) => s.budgetMb);
  if (!hydrated) return null;
  return (
    <div><PageHead title={t(lang, "nav.settings")} />
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-5"><h2 className="text-base font-bold">Account (demo)</h2><dl className="mt-2 space-y-1 text-sm"><div className="flex gap-2"><dt className="w-20 text-muted">Name</dt><dd>{acct?.name}</dd></div><div className="flex gap-2"><dt className="w-20 text-muted">Email</dt><dd>{acct?.email}</dd></div><div className="flex gap-2"><dt className="w-20 text-muted">Role</dt><dd>{role}</dd></div></dl><p className="mt-3 text-xs text-muted">Frontend-only: accounts and data live in this browser’s localStorage. Passwords are only scrambled with a non-secure demo hash. Clearing site data erases everything; there is no server and no production security.</p></Card>
        {role === "patient" && <Card className="p-5"><h2 className="text-base font-bold">{t(lang, "common.language")}</h2><div className="mt-2 max-w-xs"><LangSelect /></div><p className="mt-2 text-xs text-muted">Changes the main patient screens, report text and browser narration. Languages: {LANGS.map((l) => l.native).join(", ")}. Translations were written for this prototype and need native-speaker review.</p></Card>}
        <Card className="p-5"><h2 className="text-base font-bold">Simulated RAM budget</h2><Select aria-label="RAM budget" className="mt-2 max-w-xs" value={budget} onChange={(e) => setBudget(Number(e.target.value))}>{[2048, 1024, 512, 384].map((b) => <option key={b} value={b}>{b} MB</option>)}</Select><p className="mt-2 text-xs text-muted">Used by the next simulated analysis (illustrative sizes).</p></Card>
        <Card className="p-5"><h2 className="text-base font-bold">Demo data</h2><div className="mt-3 flex flex-wrap gap-2">{role === "patient" && p && <Button variant="outline" onClick={() => { loadDemo(p.id); toast("Demo patient loaded", "success", "History, medicines and reminders restored."); }}><FlaskIcon size={16} aria-hidden />Load Demo Patient</Button>}<ResetDemoButton /></div><p className="mt-2 text-xs text-muted">Reset restores the known starting state, clears cases, reminders, recordings and in-memory files.</p></Card>
      </div>
    </div>
  );
}
void ArrowCounterClockwiseIcon; void SimBadge;
