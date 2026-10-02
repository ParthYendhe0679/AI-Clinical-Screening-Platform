"use client";
import Link from "next/link";
import { ArrowRightIcon, BrainIcon, HeartbeatIcon, WindIcon, FilesIcon, GraphIcon, ShieldCheckIcon, SpeakerHighIcon, PillIcon, MagnifyingGlassIcon, ClockCounterClockwiseIcon, StethoscopeIcon, UserIcon, DropIcon, FaceMaskIcon, ScanIcon, FileTextIcon, MicrophoneIcon, CheckCircleIcon, WarningIcon } from "@phosphor-icons/react";
import { ArtTile, Kicker, Card, Disclaimer, PrototypeNotice } from "@/components/ui";
import { LinkButtonClass } from "@/components/ui/styles";
import { Logo } from "@/components/layout/shell";

const NAV = [["#how", "How it works"], ["#orchestration", "Orchestration"], ["#report", "Report"], ["#roles", "Patients & doctors"], ["#safety", "Safety"]];

export default function Landing() {
  return (
    <div className="bg-dots">
      <header className="sticky top-0 z-40 border-b border-ink/5 bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Sections" className="hidden items-center gap-1 rounded-full bg-white p-1 shadow-clay-sm md:flex">
            {NAV.map(([h, l]) => <a key={h} href={h} className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-ink-soft hover:text-ink">{l}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className={LinkButtonClass("ghost", "sm", "hidden sm:inline-flex")}>Log in</Link>
            <Link href="/register" className={LinkButtonClass("primary", "sm")}>Get Started</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-16 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-3 py-1.5 text-sm font-semibold shadow-pop"><span className="rounded-full bg-sun px-2 py-0.5 text-[10px] font-extrabold">NEW</span>Multimodal AI screening, watch it pick models</span>
            <h1 className="mt-6 text-[3rem] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[4.1rem] lg:text-[4.6rem]">Your files.<br />One <span className="relative inline-block"><span className="relative z-10">clear</span><span className="absolute inset-x-0 bottom-1 z-0 h-4 -rotate-1 rounded-full bg-sun sm:h-6" aria-hidden /></span> report.<br />Not a diagnosis.</h1>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register" className={LinkButtonClass("primary", "lg")}>Get Started <ArrowRightIcon size={18} weight="bold" aria-hidden /></Link>
              <Link href="/demo" className={LinkButtonClass("outline", "lg")}>Explore Demo</Link>
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {[[FilesIcon, "mint", "Many file types, one case"], [GraphIcon, "lavender", "Right models, in order"], [ShieldCheckIcon, "sun", "Screening, never diagnosis"]].map(([I, tone, t]) => (
                <li key={t as string} className="flex items-center gap-2 text-sm font-semibold"><ArtTile icon={I as React.ElementType} tone={tone as "mint"} size={36} />{t as string}</li>
              ))}
            </ul>
          </div>
          <HeroPreview />
        </section>

        {/* Marquee */}
        <section aria-label="Supported modalities" className="overflow-hidden border-y-2 border-ink bg-white py-4">
          <div className="flex w-max animate-marquee gap-4">
            {[...MODS, ...MODS].map((m, i) => <span key={i} aria-hidden={i >= MODS.length} className="rounded-[28px] border-2 border-ink bg-cream px-5 py-2 text-sm font-bold shadow-pop">{m}</span>)}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-extrabold sm:text-[2.5rem]">From a bag of papers to one page — in five steps</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map(([t, d], i) => (
              <Card key={t} className="relative p-5"><span className="absolute right-4 top-3 font-display text-4xl font-extrabold text-ink/10">0{i + 1}</span><h3 className="pr-8 text-base font-bold">{t}</h3><p className="mt-2 text-sm text-muted">{d}</p></Card>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Feature icon={FilesIcon} tone="mint" title="Multimodal upload" body="Images, PDFs, DICOM, ECG data and audio in one patient case. Each file is checked for type, body area and apparent quality — blurry photos get a retake prompt." />
            <Feature icon={ClockCounterClockwiseIcon} tone="sky" title="Patient memory" body="Older reports, prescriptions and doctor advice are kept as searchable facts, so a Previous Visit Summary is ready before the next visit." />
            <Feature icon={MagnifyingGlassIcon} tone="lavender" title="Evidence traceability" body="Every report line is tagged MODEL, RECORD, GUIDELINE or AI SUMMARY. Click a tag to open exactly where it came from." />
          </div>
        </section>

        {/* Orchestration (dark showcase) */}
        <section id="orchestration" className="bg-ink py-20 text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold sm:text-[2.5rem]">Many models. Little memory.</h2>
              <p className="mt-4 text-white/75">A selector decides which of the 7 condition checks are needed and skips the rest with reasons. A loader runs them one after another inside a RAM budget: shared encoder, int8 versions, least-recently-used unloading, result cache and cascades.</p>
              <ul className="mt-5 grid gap-2 text-sm font-semibold sm:grid-cols-2">{["Shared image encoder", "int8 light versions", "LRU load / unload", "Result cache", "Cascade confirmers", "Prefetch next model"].map((x) => <li key={x} className="flex items-center gap-2"><CheckCircleIcon size={18} weight="fill" className="text-mint" aria-hidden />{x}</li>)}</ul>
              <p className="mt-4 text-xs text-white/60">In this prototype the orchestration is a labelled simulation with illustrative sizes — no model runs.</p>
              <Link href="/demo" className={LinkButtonClass("purple", "md", "mt-6")}>Watch it in the demo</Link>
            </div>
            <div className="rounded-[28px] border-2 border-white/20 bg-white/5 p-5">
              {[["biomedclip_encoder", 95, 8], ["tb_head", 1, 1], ["cxr_densenet121_int8", 180, 20], ["ecg_resnet1d_int8", 90, 11], ["lab_rules", 260, 28]].map(([n, r, w]) => (
                <div key={n as string} className="mb-3 last:mb-0"><div className="flex justify-between font-mono text-xs"><span>{n}</span><span>~{r} MB (illustrative)</span></div><div className="mt-1 h-3 rounded-full bg-white/10"><div className="h-3 rounded-full bg-sun" style={{ width: `${Math.max(3, (w as number) * 3)}%` }} /></div></div>
              ))}
            </div>
          </div>
        </section>

        {/* Report */}
        <section id="report" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-extrabold sm:text-[2.5rem]">One unified report. Honest about what it doesn’t know.</h2>
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
            <Card variant="sticker" className="p-5">
              <div className="mb-3 flex flex-wrap gap-2"><Tag k="MODEL" c="bg-sky-soft text-sky-deep" /><Tag k="RECORD" c="bg-mint-soft text-mint-deep" /><Tag k="GUIDELINE" c="bg-lavender-soft text-purple-deep" /><Tag k="AI SUMMARY" c="bg-ink/10 text-ink-soft" /></div>
              <ul className="space-y-3 text-sm">
                <li><Tag k="MODEL" c="bg-sky-soft text-sky-deep" /> Chest X-ray may show a lower-right-lung infection pattern. <b>81%</b> <em className="text-muted">(illustrative)</em></li>
                <li><Tag k="RECORD" c="bg-mint-soft text-mint-deep" /> HbA1c went from 7.2 to 8.4 in six months.</li>
                <li><Tag k="GUIDELINE" c="bg-lavender-soft text-purple-deep" /> Illustrative guideline placeholder.</li>
                <li className="rounded-xl border-2 border-dashed border-sun-deep/50 bg-sun-soft p-2"><WarningIcon size={14} weight="fill" className="mr-1 inline" aria-hidden /><b>Conflicting evidence:</b> normal white-cell count vs. X-ray pattern — ask the doctor.</li>
              </ul>
            </Card>
            <div className="space-y-4">
              <Feature icon={SpeakerHighIcon} tone="sun" title="Listen in your language" body="English, Hindi and Marathi interface and narration using your browser’s built-in voices." />
              <Feature icon={PillIcon} tone="coral" title="Same-medicine warning" body="Dolo 650 and Crocin 650 both contain paracetamol — flagged, never replaced or dosed." />
              <Feature icon={MicrophoneIcon} tone="pink" title="Doctor’s voice instructions" body="Record advice (with the doctor’s permission), get a care plan and reminders." />
            </div>
          </div>
        </section>

        {/* Roles */}
        <section id="roles" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-7"><ArtTile icon={UserIcon} tone="mint" /><h3 className="mt-4 text-xl font-bold">For patients</h3><p className="mt-2 text-sm text-muted">Simple report, voice help, previous-visit summary, medicine warnings, care plan and reminders.</p><Link href="/demo?role=patient" className={LinkButtonClass("primary", "md", "mt-5")}>Patient Demo</Link></Card>
            <Card variant="bento" className="p-7"><ArtTile icon={StethoscopeIcon} tone="sky" /><h3 className="mt-4 text-xl font-bold">For doctors</h3><p className="mt-2 text-sm text-muted">Case queue, detailed traceable report with model names and confidences, patient history, review notes and instructions.</p><Link href="/demo?role=doctor" className={LinkButtonClass("outline", "md", "mt-5")}>Doctor Demo</Link></Card>
          </div>
        </section>

        {/* Safety */}
        <section id="safety" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <Card className="grid gap-6 rounded-[40px] p-8 lg:grid-cols-2">
            <div><h2 className="text-3xl font-extrabold">Responsible by design</h2><p className="mt-3 text-sm text-muted">Screening support only. It never diagnoses, never prescribes, and never hides uncertainty.</p>
              <ul className="mt-4 space-y-2 text-sm font-semibold">{["Not a medical diagnosis — shown on every report", "No medicine or dose advice, ever", "Urgent findings first; call 108 for danger signs", "Honest “not sure” and conflicting evidence", "Fictional data; files never leave your browser"].map((x) => <li key={x} className="flex gap-2"><ShieldCheckIcon size={18} weight="duotone" className="mt-0.5 shrink-0 text-mint-deep" aria-hidden />{x}</li>)}</ul></div>
            <Disclaimer />
          </Card>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="bg-speed rounded-[32px] border-2 border-ink bg-sun p-8 text-center shadow-pop-lg sm:p-12">
            <h2 className="text-3xl font-extrabold">See the whole journey in about three minutes</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/demo" className={LinkButtonClass("primary", "lg")}>Explore Demo</Link><Link href="/register" className={LinkButtonClass("outline", "lg")}>Get Started</Link></div>
          </div>
        </section>
      </main>

      <footer className="bg-ink px-4 py-12 text-white sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.2fr_1fr]">
          <div><Logo light /><p className="mt-4 max-w-md text-sm text-white/70">Frontend prototype for hackathon EL-04. Fictional demo data. All AI outputs are simulated. This is not a medical device and not a diagnosis.</p></div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            {[["/login", "Log in"], ["/register", "Register"], ["/demo", "Demo"], ["#safety", "Safety"], ["#how", "How it works"]].map(([h, l]) => <Link key={h} href={h} className="hover:underline">{l}</Link>)}
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl"><PrototypeNotice /></div>
      </footer>
    </div>
  );
}

const MODS = ["Chest X-ray", "Brain MRI", "Kidney CT", "12-lead ECG", "Skin photo", "Lab reports", "Prescriptions", "Doctor’s voice notes"];
const STEPS = [["Upload", "Photos and PDFs from the phone."], ["Check", "Type, body area, clarity."], ["Plan & run", "Right models, one after another."], ["Report", "Simple view + doctor view with sources."], ["Follow the plan", "Voice instructions and reminders."]];
function Tag({ k, c }: { k: string; c: string }) { return <span className={`mr-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wider ${c}`}>{k}</span>; }
function Feature({ icon, tone, title, body }: { icon: React.ElementType; tone: "mint" | "sky" | "lavender" | "sun" | "coral" | "pink"; title: string; body: string }) {
  return <Card className="flex gap-4 p-5"><ArtTile icon={icon} tone={tone} /><div><h3 className="text-base font-bold">{title}</h3><p className="mt-1 text-sm text-muted">{body}</p></div></Card>;
}

function Doctor() {
  return (
    <svg viewBox="0 0 160 190" className="h-44 w-36 animate-[bob_4s_ease-in-out_infinite]" role="img" aria-label="Animated cartoon doctor waving">
      <ellipse cx="80" cy="182" rx="46" ry="6" fill="#1c1b2b" opacity=".12" />
      <path d="M32 188c0-44 20-66 48-66s48 22 48 66z" fill="#fff" stroke="#1c1b2b" strokeWidth="3" />
      <path d="M62 126l18 30 18-30" fill="#c4def8" stroke="#1c1b2b" strokeWidth="3" />
      <path d="M60 130c-10 18-4 36 10 38" fill="none" stroke="#7b5cf0" strokeWidth="4" strokeLinecap="round" /><circle cx="72" cy="170" r="6" fill="#fad47f" stroke="#1c1b2b" strokeWidth="3" />
      <circle cx="80" cy="76" r="36" fill="#f9cbc9" stroke="#1c1b2b" strokeWidth="3" />
      <path d="M44 70c2-34 70-34 72 0-14-14-58-14-72 0z" fill="#1c1b2b" />
      <g style={{ transformOrigin: "center", animation: "blink 5s infinite" }}><circle cx="67" cy="80" r="4" fill="#1c1b2b" /><circle cx="93" cy="80" r="4" fill="#1c1b2b" /></g>
      <path d="M68 94q12 10 24 0" fill="none" stroke="#1c1b2b" strokeWidth="3" strokeLinecap="round" />
      <rect x="60" y="30" width="40" height="14" rx="7" fill="#fff" stroke="#1c1b2b" strokeWidth="3" /><path d="M80 32v10M75 37h10" stroke="#c93535" strokeWidth="3" strokeLinecap="round" />
      <g style={{ transformOrigin: "122px 140px", animation: "wave 1.6s ease-in-out infinite" }}><path d="M122 140c18-6 26-30 22-50" fill="none" stroke="#fff" strokeWidth="16" strokeLinecap="round" /><path d="M122 140c18-6 26-30 22-50" fill="none" stroke="#1c1b2b" strokeWidth="3" strokeLinecap="round" opacity=".15" /><circle cx="144" cy="86" r="10" fill="#f9cbc9" stroke="#1c1b2b" strokeWidth="3" /></g>
    </svg>
  );
}

function HeroPreview() {
  const rows: [React.ElementType, string, string, "mint" | "pink" | "coral" | "sky", string][] = [
    [WindIcon, "09:00", "Chest X-ray model", "mint", "running"],
    [HeartbeatIcon, "09:01", "ECG 1D-ResNet", "pink", "queued"],
    [DropIcon, "09:02", "Lab report rules", "coral", "cache hit"],
    [ScanIcon, "—", "Brain MRI model", "sky", "skipped · no MRI"],
  ];
  return (
    <div className="relative mx-auto w-full max-w-md">
      <span className="burst absolute -left-8 -top-6 z-20 grid h-24 w-24 -rotate-12 place-items-center bg-sun font-display text-base font-extrabold drop-shadow-[3px_3px_0_#1c1b2b]">ZAP!</span>
      <span className="burst absolute -right-8 -top-8 z-20 grid h-28 w-28 rotate-12 place-items-center bg-coral font-display text-sm font-extrabold text-white drop-shadow-[3px_3px_0_#1c1b2b]">URGENT</span>
      <span className="absolute -right-3 top-24 -z-10 h-40 w-40 rounded-[40%] bg-lavender" aria-hidden />
      <div className="rounded-[36px] border-2 border-ink bg-white p-3 shadow-pop-lg">
        <div className="rounded-[28px] bg-sky-soft p-4">
          <div className="flex items-start justify-between gap-2"><div><p className="text-[11px] font-bold uppercase tracking-wider text-muted">Case PT-1042 · Kalyan</p><p className="font-display text-lg font-extrabold">Chest screening</p></div><span className="rounded-full border-2 border-ink bg-white px-2.5 py-1 text-[11px] font-bold">81% · demo</span></div>
          <ul className="mt-3 space-y-2">
            {rows.map(([I, time, name, tone, st], i) => (
              <li key={name} style={{ animation: `bob 5s ease-in-out ${i * 0.4}s infinite` }} className={"flex items-center gap-3 rounded-2xl p-2.5 " + (st === "skipped · no MRI" ? "bg-white/70 opacity-70" : "bg-white shadow-clay-sm")}>
                <ArtTile icon={I} tone={tone} size={38} /><div className="min-w-0 flex-1"><p className="text-[11px] text-muted">{time}</p><p className={"truncate text-sm font-bold " + (st.startsWith("skipped") ? "line-through" : "")}>{name}</p></div>
                <span className="rounded-full bg-lavender-soft px-2 py-0.5 text-[10px] font-bold text-purple-deep">{st}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2 rounded-2xl border-2 border-ink bg-danger-soft p-2.5 text-xs font-bold text-danger"><span className="relative grid h-6 w-6 place-items-center"><span className="absolute inset-0 rounded-full bg-danger/40 animate-[pulse-ring_1.6s_ease-out_infinite]" /><WarningIcon size={16} weight="fill" className="relative" aria-hidden /></span>Please see a doctor today or tomorrow.</div>
        </div>
      </div>
      <div className="absolute -bottom-10 -left-10 z-20 hidden sm:block"><Doctor /></div>
      <p className="mt-3 text-center text-[11px] text-muted">Illustrative preview · simulated results · fictional data</p>
    </div>
  );
}
