"use client";
import * as React from "react";
import { PlayIcon, StopIcon, MicrophoneIcon, TrashIcon, PlusIcon, SpeakerHighIcon, PencilIcon, BellRingingIcon, FlaskIcon } from "@phosphor-icons/react";
import { useStore, getPatientForSession, addDays } from "@/store";
import type { CareCategory, CareItem, CarePlan, Reminder, Role } from "@/lib/types";
import { Badge, Button, Card, Checkbox, ConfirmDialog, EmptyState, Field, Input, PageHead, Select, Sheet, SimBadge, Tabs, toast, Disclaimer } from "@/components/ui";
import { cn, dayKey, formatDate, formatDuration, uid } from "@/lib/utils";
import { t, tl, DICT, L3 } from "@/lib/i18n";
import { speak, stopSpeech, voiceStatus } from "@/lib/speech";
import { useHydratedFlag } from "./hooks";

export function dueOn(r: Reminder, day: string) {
  if (r.repeat === "once") return r.startDate === day;
  return r.startDate <= day && (!r.endDate || day <= r.endDate);
}
const CAT_TONE: Record<CareCategory, "mint" | "sun" | "sky" | "lavender" | "pink" | "coral" | "ink"> = { medicine: "mint", cream: "sun", diet: "sky", activity: "lavender", test: "lavender", follow_up: "coral", danger_sign: "pink" };
const CATS: CareCategory[] = ["medicine", "cream", "diet", "activity", "test", "follow_up", "danger_sign"];

// In-memory only recordings (blob URLs) — never persisted or uploaded.
const blobs = new Map<string, string>();

/* ---------------- Care plan page ---------------- */
export function CarePlanPage() {
  const lang = useStore((s) => s.lang); const p = useStore(getPatientForSession); const hydrated = useHydratedFlag();
  const plans = useStore((s) => s.carePlans).filter((c) => c.patientId === p?.id); const all = useStore((s) => s.reminders).filter((r) => r.patientId === p?.id);
  const { toggleReminderDone, upsertReminder, deleteReminder, loadDemoInto } = useStore();
  const [tab, setTab] = React.useState<"today" | "upcoming" | "plan">("today"); const [edit, setEdit] = React.useState<Reminder | "new">(); const [del, setDel] = React.useState<Reminder>();
  const [notif, setNotif] = React.useState<string>("");
  if (!hydrated || !p) return null;
  const today = dayKey();
  const todays = all.filter((r) => dueOn(r, today)).sort((a, b) => a.time.localeCompare(b.time));
  const upcoming = Array.from({ length: 7 }, (_, i) => addDays(today, i + 1)).flatMap((d) => all.filter((r) => dueOn(r, d)).map((r) => ({ r, d })));
  const missed = all.filter((r) => r.repeat === "once" && r.startDate < today && !r.completions[r.startDate]);
  const done = todays.filter((r) => r.completions[today]).length;
  const askNotif = async () => { if (!("Notification" in window)) { setNotif("This browser doesn’t support notifications. Reminders still appear here on this page."); return; } const r = await Notification.requestPermission(); setNotif(r === "granted" ? "Notifications allowed. (This prototype can’t send them while the page is closed.)" : "Notifications not allowed — reminders still appear on this page."); };
  const hearItem = (i: CareItem, mine: boolean) => { const txt = mine ? tl(lang, i.text) : i.doctorQuote; void speak(txt, mine ? lang : "en").then((r) => { if (!r.ok) toast("Voice unavailable", "warning", r.reason); }); };
  const rec = plans.find((pl) => pl.recordingId && blobs.has(pl.recordingId));
  return (
    <div><PageHead title={t(lang, "care.title")} sub="Reminders from your doctor’s instructions. They are not verified prescriptions — follow your doctor’s advice." actions={<><Button variant="outline" onClick={() => setEdit("new")}><PlusIcon size={18} aria-hidden />Add reminder</Button><Button variant="secondary" onClick={askNotif}><BellRingingIcon size={18} aria-hidden />Enable notifications</Button></>} />
      {notif && <p role="status" className="mb-3 rounded-xl bg-sky-soft p-3 text-sm text-sky-deep">{notif}</p>}
      {plans.length === 0 && all.length === 0 ? <EmptyState icon={BellRingingIcon} title="No care plan yet" body="Record your doctor’s instructions, or load the demo patient." action={<><a className="inline-flex h-11 items-center rounded-full border-2 border-pill bg-pill px-5 text-sm font-semibold text-white" href="/patient/instructions">Record instructions</a><Button variant="outline" onClick={() => loadDemoInto(p.id)}><FlaskIcon size={16} aria-hidden />Load Demo Patient</Button></>} /> : <>
        <Tabs label="Care views" value={tab} onChange={setTab} tabs={[{ key: "today", label: t(lang, "care.today"), count: todays.length }, { key: "upcoming", label: t(lang, "care.upcoming"), count: upcoming.length }, { key: "plan", label: "Instructions", count: plans.reduce((a, c) => a + c.items.length, 0) }]} />
        {tab === "today" && <div className="mt-4 space-y-3"><p className="text-sm font-semibold">{done} of {todays.length} done today</p>
          {missed.length > 0 && <Card variant="flat" className="border-coral p-4"><p className="text-sm font-bold text-coral-deep">Missed / pending from earlier</p><ul className="mt-2 space-y-2">{missed.map((r) => <ReminderRow key={r.id} r={r} day={r.startDate} onToggle={() => toggleReminderDone(r.id, r.startDate)} onEdit={() => setEdit(r)} onDelete={() => setDel(r)} missed />)}</ul></Card>}
          {todays.length === 0 ? <EmptyState icon={BellRingingIcon} title="Nothing due today" /> : <ul className="space-y-2">{todays.map((r) => <ReminderRow key={r.id} r={r} day={today} onToggle={() => toggleReminderDone(r.id, today)} onEdit={() => setEdit(r)} onDelete={() => setDel(r)} />)}</ul>}</div>}
        {tab === "upcoming" && <ul className="mt-4 space-y-2">{upcoming.length === 0 ? <li><EmptyState icon={BellRingingIcon} title="Nothing in the next 7 days" /></li> : upcoming.map(({ r, d }) => <li key={r.id + d} className="flex items-center justify-between rounded-2xl bg-white p-3 text-sm shadow-clay-sm"><span><b>{formatDate(d)} {r.time}</b> · {r.title}</span><Badge tone={CAT_TONE[r.category]}>{r.category.replace("_", " ")}</Badge></li>)}</ul>}
        {tab === "plan" && <div className="mt-4 space-y-4">{plans.map((pl) => <Card key={pl.id} className="p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-bold">{pl.title}</h2><p className="text-xs text-muted">{pl.doctor} · {formatDate(pl.createdAt)} · {pl.origin === "doctor_recording" ? "from recording (simulated transcript)" : "seeded demo plan"}</p></div></div>
          <ul className="mt-3 space-y-2">{pl.items.map((i) => <li key={i.id} className="rounded-2xl bg-canvas p-3"><div className="flex flex-wrap items-center gap-2"><Badge tone={CAT_TONE[i.category]}>{i.category.replace("_", " ")}</Badge><span className="text-sm font-semibold">{tl(lang, i.text)}</span></div><p className="mt-1 text-xs italic text-muted">“{i.doctorQuote}” {rec?.id === pl.id ? `(clip ${i.segment.start}s–${i.segment.end}s)` : ""}</p>
            <div className="mt-2 flex flex-wrap gap-2"><Button size="sm" variant="soft" onClick={() => { const url = pl.recordingId ? blobs.get(pl.recordingId) : undefined; if (url) { const a = new Audio(url); a.currentTime = i.segment.start; void a.play(); setTimeout(() => a.pause(), (i.segment.end - i.segment.start) * 1000); } else { toast("No audio file for this item", "info", "Using browser voice to read the doctor’s words instead."); hearItem(i, false); } }}><PlayIcon size={14} weight="fill" aria-hidden />{t(lang, "care.hearDoctor")}</Button><Button size="sm" variant="secondary" onClick={() => hearItem(i, true)}><SpeakerHighIcon size={14} aria-hidden />{t(lang, "care.hearMine")}</Button><Button size="sm" variant="ghost" onClick={() => stopSpeech()}>{t(lang, "common.stop")}</Button></div></li>)}</ul></Card>)}
          <p className="text-xs text-muted">{voiceStatus(lang).message}</p></div>}
      </>}
      <ReminderForm key={edit === "new" ? "new" : edit?.id ?? "none"} open={!!edit} onClose={() => setEdit(undefined)} initial={edit === "new" ? undefined : edit} patientId={p.id} onSave={(r) => { upsertReminder(r); toast(edit === "new" ? "Reminder added" : "Reminder updated", "success"); setEdit(undefined); }} />
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(undefined)} danger title="Delete reminder?" body={del?.title ?? ""} confirmLabel="Delete" onConfirm={() => { if (del) { deleteReminder(del.id); toast("Reminder deleted", "info"); } }} />
      <div className="mt-6"><Disclaimer lang={lang} compact /></div>
    </div>
  );
}

function ReminderRow({ r, day, onToggle, onEdit, onDelete, missed }: { r: Reminder; day: string; onToggle: () => void; onEdit: () => void; onDelete: () => void; missed?: boolean }) {
  const done = !!r.completions[day];
  return (
    <li className={cn("flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-clay-sm", done && "opacity-70")}>
      <Checkbox id={`rm-${r.id}-${day}`} checked={done} onChange={onToggle} label={<span className={cn(done && "line-through")}><b className="tabular">{r.time}</b> · {r.title}{missed && <Badge tone="coral" className="ml-2">Missed</Badge>}</span>} className="flex-1" />
      <Badge tone={CAT_TONE[r.category]}>{r.category.replace("_", " ")}</Badge>
      <Button size="icon-sm" variant="ghost" aria-label={`Edit ${r.title}`} onClick={onEdit}><PencilIcon size={16} aria-hidden /></Button><Button size="icon-sm" variant="ghost" aria-label={`Delete ${r.title}`} onClick={onDelete}><TrashIcon size={16} aria-hidden /></Button>
    </li>
  );
}

function ReminderForm({ open, onClose, initial, patientId, onSave }: { open: boolean; onClose: () => void; initial?: Reminder; patientId: string; onSave: (r: Reminder) => void }) {
  const [title, setTitle] = React.useState(initial?.title ?? ""); const [time, setTime] = React.useState(initial?.time ?? "09:00"); const [date, setDate] = React.useState(initial?.startDate ?? dayKey());
  const [cat, setCat] = React.useState<CareCategory>(initial?.category ?? "activity"); const [rep, setRep] = React.useState<Reminder["repeat"]>(initial?.repeat ?? "once"); const [end, setEnd] = React.useState(initial?.endDate ?? ""); const [err, setErr] = React.useState("");
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()} title={initial ? "Edit reminder" : "Add reminder"} description="Your own reminder — not a medical prescription.">
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (title.trim().length < 2) { setErr("Give the reminder a title."); return; } if (rep === "daily" && end && end < date) { setErr("End date must be after the start date."); return; } onSave({ id: initial?.id ?? uid("rm"), patientId, carePlanId: initial?.carePlanId, careItemId: initial?.careItemId, title: title.trim(), category: cat, time, startDate: date, endDate: rep === "daily" && end ? end : undefined, repeat: rep, completions: initial?.completions ?? {}, createdBy: initial?.createdBy ?? "user" }); }}>
        <Field label="Title" htmlFor="rt" error={err}><Input id="rt" value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!err} /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Time" htmlFor="rtime"><Input id="rtime" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field><Field label="Start date" htmlFor="rdate"><Input id="rdate" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field></div>
        <div className="grid grid-cols-2 gap-3"><Field label="Category" htmlFor="rcat"><Select id="rcat" value={cat} onChange={(e) => setCat(e.target.value as CareCategory)}>{CATS.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}</Select></Field><Field label="Repeat" htmlFor="rrep"><Select id="rrep" value={rep} onChange={(e) => setRep(e.target.value as Reminder["repeat"])}><option value="once">Once</option><option value="daily">Daily</option></Select></Field></div>
        {rep === "daily" && <Field label="Last day (optional)" htmlFor="rend"><Input id="rend" type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>}
        <Button type="submit" className="w-full">Save reminder</Button></form>
    </Sheet>
  );
}

/* ---------------- Voice recorder (patient + doctor) ---------------- */
const SAMPLE_TRANSCRIPT = "Take this tablet twice a day after food for 5 days. Apply this cream on the rash at night only. Do not eat oily food. Come back after 15 days. If the fever goes above 102, come at once.";
function sampleItems(): CareItem[] {
  return [
    { id: "n1", category: "medicine", text: L3("Take the tablet twice a day after food for 5 days.", "गोली दिन में दो बार खाने के बाद 5 दिन लें।", "गोळी दिवसातून दोनदा जेवणानंतर 5 दिवस घ्या."), doctorQuote: "Take this tablet twice a day after food for 5 days.", segment: { start: 0, end: 4 } },
    { id: "n2", category: "cream", text: L3("Apply the cream on the rash at night only.", "क्रीम केवल रात में दाने पर लगाएँ।", "क्रीम फक्त रात्री पुरळावर लावा."), doctorQuote: "Apply this cream on the rash at night only.", segment: { start: 4, end: 8 } },
    { id: "n3", category: "diet", text: L3("Do not eat oily food.", "तैलीय खाना न खाएँ।", "तेलकट अन्न खाऊ नका."), doctorQuote: "Do not eat oily food.", segment: { start: 8, end: 10 } },
    { id: "n4", category: "follow_up", text: L3("Come back after 15 days.", "15 दिन बाद वापस आएँ।", "15 दिवसांनी परत या."), doctorQuote: "Come back after 15 days.", segment: { start: 10, end: 13 } },
    { id: "n5", category: "danger_sign", text: L3("If the fever goes above 102, come at once.", "बुख़ार 102 से ऊपर जाए तो तुरंत आएँ।", "ताप 102 च्या वर गेल्यास लगेच या."), doctorQuote: "If the fever goes above 102, come at once.", segment: { start: 13, end: 17 } },
  ];
}
function previewReminders(patientId: string, planId: string, today: string): Reminder[] {
  const mk = (i: string, title: string, cat: CareCategory, time: string, end: string | undefined, rep: Reminder["repeat"], start = today): Reminder => ({ id: uid("rm"), patientId, carePlanId: planId, careItemId: i, title, category: cat, time, startDate: start, endDate: end, repeat: rep, completions: {}, createdBy: "doctor" });
  return [mk("n1", "Tablet after food (morning) — as the doctor said", "medicine", "09:00", addDays(today, 4), "daily"), mk("n1", "Tablet after food (evening) — as the doctor said", "medicine", "20:00", addDays(today, 4), "daily"), mk("n2", "Apply cream at night", "cream", "21:30", addDays(today, 14), "daily"), mk("n3", "Avoid oily food", "diet", "13:00", addDays(today, 14), "daily"), mk("n4", "Follow-up visit", "follow_up", "10:00", undefined, "once", addDays(today, 15))];
}

export function VoiceRecorder({ role, patientIds }: { role: Role; patientIds: { id: string; name: string }[] }) {
  const lang = useStore((s) => s.lang); const { addCarePlan, addRecording, deleteRecording } = useStore(); const recs = useStore((s) => s.recordings);
  const doctors = useStore((s) => s.doctors); const acct = useStore((s) => s.accounts.find((a) => a.id === s.session?.accountId));
  const [pid, setPid] = React.useState(patientIds[0]?.id ?? ""); const [consent, setConsent] = React.useState(false);
  const [state, setState] = React.useState<"idle" | "recording" | "ready">("idle"); const [secs, setSecs] = React.useState(0); const [err, setErr] = React.useState(""); const [recId, setRecId] = React.useState<string>();
  const [items, setItems] = React.useState<CareItem[]>([]); const [transcript, setTranscript] = React.useState("");
  const mr = React.useRef<MediaRecorder | null>(null); const chunks = React.useRef<Blob[]>([]); const timer = React.useRef<ReturnType<typeof setInterval> | null>(null); const stream = React.useRef<MediaStream | null>(null);
  React.useEffect(() => () => { timer.current && clearInterval(timer.current); stream.current?.getTracks().forEach((t) => t.stop()); }, []);
  const supported = typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";
  const start = async () => {
    setErr("");
    if (!consent) { setErr("Please confirm the doctor’s permission first."); return; }
    if (!supported) { setErr("Recording isn’t supported in this browser. Use the sample recording instead."); return; }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true }); stream.current = s; chunks.current = [];
      const m = new MediaRecorder(s); mr.current = m;
      m.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      m.onstop = () => { const blob = new Blob(chunks.current, { type: m.mimeType || "audio/webm" }); const id = uid("rec"); blobs.set(id, URL.createObjectURL(blob)); setRecId(id); setState("ready"); stream.current?.getTracks().forEach((t) => t.stop()); addRecording({ id, patientId: pid, createdAt: new Date().toISOString(), durationSec: secs, by: role, consent: true, inMemory: true }); };
      m.onerror = () => { setErr("Recording failed."); setState("idle"); };
      m.start(); setSecs(0); setState("recording"); timer.current = setInterval(() => setSecs((x) => x + 1), 1000);
    } catch (e) { const n = (e as DOMException).name; setErr(n === "NotAllowedError" ? "Microphone permission was denied. Allow it in the browser, or use the sample recording." : n === "NotFoundError" ? "No microphone was found on this device. Use the sample recording instead." : "Could not start recording."); }
  };
  const stop = () => { timer.current && clearInterval(timer.current); mr.current?.state !== "inactive" && mr.current?.stop(); };
  const useSample = () => { setErr(""); setRecId(undefined); setState("ready"); setSecs(17); };
  const transcribe = () => { setTranscript(SAMPLE_TRANSCRIPT); setItems(sampleItems()); toast("Transcript ready", "info", "Seeded sample transcript — no speech-to-text service ran."); };
  const save = () => {
    const doc = doctors.find((d) => d.id === acct?.doctorId)?.name ?? "Dr. Anita Mehta"; const planId = uid("cp"); const today = dayKey();
    const plan: CarePlan = { id: planId, patientId: pid, createdAt: new Date().toISOString(), title: `Care plan — ${formatDate(today)}`, doctor: role === "doctor" ? doc : "Doctor (recorded by patient)", origin: "doctor_recording", recordingId: recId, items, active: true };
    addCarePlan(plan, previewReminders(pid, planId, today)); toast("Care plan saved", "success", "Reminders created. Open the Care plan page."); setItems([]); setTranscript(""); setState("idle");
  };
  const url = recId ? blobs.get(recId) : undefined;
  return (
    <div className="space-y-5">
      <Card variant="sticker" className="p-5"><h2 className="text-lg font-bold">{role === "doctor" ? "Record instructions for a patient" : "Record the doctor’s advice"}</h2>
        <p className="mt-1 text-sm text-ink-soft">Recording starts only when you press Record, and only after the doctor has given permission. The audio stays in this browser tab’s memory — it is not uploaded and is lost on refresh.</p>
        {role === "doctor" && <div className="mt-3 max-w-xs"><Field label="Patient" htmlFor="rp"><Select id="rp" value={pid} onChange={(e) => setPid(e.target.value)}>{patientIds.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field></div>}
        <div className="mt-3"><Checkbox id="rc" checked={consent} onChange={setConsent} label={role === "doctor" ? "I (the doctor) agree to this instruction being recorded." : "I asked the doctor, and the doctor agreed to be recorded."} /></div>
        <div className="mt-4 flex flex-wrap items-center gap-2" aria-live="polite">
          {state !== "recording" ? <Button variant="danger" onClick={start}><MicrophoneIcon size={18} weight="fill" aria-hidden />Record</Button> : <Button variant="outline" onClick={stop}><StopIcon size={18} weight="fill" aria-hidden />Stop</Button>}
          <Button variant="secondary" onClick={useSample}><FlaskIcon size={16} aria-hidden />Use sample recording (no microphone)</Button>
          <span className="tabular font-mono text-sm font-bold">{state === "recording" && <span className="mr-2 inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-danger" aria-hidden />}{formatDuration(secs * 1000)}</span><Badge tone={state === "recording" ? "pink" : state === "ready" ? "mint" : "ink"}>{state === "recording" ? "Recording…" : state === "ready" ? "Ready" : "Idle"}</Badge></div>
        {err && <p role="alert" className="mt-3 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-danger">{err}</p>}
        {state === "ready" && <div className="mt-4 space-y-3">{url ? <audio controls src={url} className="w-full" aria-label="Playback of the recording" /> : <p className="rounded-xl bg-sun-soft p-3 text-sm">Sample recording selected (no audio file). “Hear doctor” will use the browser voice to read the words.</p>}
          <div className="flex flex-wrap gap-2"><Button onClick={transcribe}>Create transcript & care plan preview</Button><Button variant="ghost" onClick={() => { if (recId) { deleteRecording(recId); blobs.delete(recId); } setState("idle"); setRecId(undefined); setItems([]); setTranscript(""); toast("Recording deleted", "info"); }}><TrashIcon size={16} aria-hidden />Delete recording</Button></div></div>}</Card>
      {transcript && <Card className="p-5"><div className="flex items-center justify-between"><h3 className="text-base font-bold">Transcript</h3><SimBadge>Seeded sample — not transcribed</SimBadge></div><p className="mt-2 rounded-xl bg-canvas p-3 text-sm italic">“{transcript}”</p>
        <h3 className="mt-4 text-base font-bold">Structured instructions</h3><ul className="mt-2 space-y-2">{items.map((i) => <li key={i.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-canvas p-2 text-sm"><Badge tone={CAT_TONE[i.category]}>{i.category.replace("_", " ")}</Badge>{tl(lang, i.text)}</li>)}</ul>
        <h3 className="mt-4 text-base font-bold">Reminder schedule preview</h3><ul className="mt-2 space-y-1 text-sm text-muted">{previewReminders(pid, "x", dayKey()).map((r, i) => <li key={i}>{r.time} · {r.title}{r.endDate ? ` (until ${formatDate(r.endDate)})` : r.repeat === "once" ? ` (${formatDate(r.startDate)})` : ""}</li>)}</ul>
        <p className="mt-2 text-xs text-muted">The schedule is a preview taken from the words above. It is editable on the Care plan page and is not a verified prescription.</p>
        <Button className="mt-3" onClick={save}>Save as care plan</Button></Card>}
      {recs.length > 0 && <Card variant="flat" className="p-4 text-sm"><b>Recordings this session:</b> {recs.length} (in memory only)</Card>}
    </div>
  );
}
void DICT;
