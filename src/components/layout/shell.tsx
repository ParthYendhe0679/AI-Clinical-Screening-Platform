"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { BellIcon, HeartbeatIcon, HouseIcon, UploadSimpleIcon, FolderOpenIcon, ClockCounterClockwiseIcon, PillIcon, MicrophoneIcon, ListChecksIcon, GearIcon, SignOutIcon, UsersIcon, ClipboardTextIcon, CpuIcon, MegaphoneIcon, SpeakerHighIcon, ArrowCounterClockwiseIcon, UserCircleIcon } from "@phosphor-icons/react";
import { useStore, getAccount } from "@/store";
import { cn, initials } from "@/lib/utils";
import { t, LANGS } from "@/lib/i18n";
import { Button, Disclaimer, PrototypeNotice, Select, Sheet, Toaster, ConfirmDialog, toast, Badge } from "@/components/ui";
import type { Lang, Role } from "@/lib/types";
import { speak, stopSpeech, voiceStatus } from "@/lib/speech";

export function Logo({ href = "/", light }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2" aria-label="EL-04 Clinical Screening home">
      <span className="grid h-9 w-9 place-items-center rounded-[30%] border-2 border-ink bg-purple text-white shadow-pop"><HeartbeatIcon size={20} weight="bold" aria-hidden /></span>
      <span className={cn("font-display text-[15px] font-extrabold leading-none tracking-tight", light && "text-white")}>EL-04<span className="block text-[10px] font-semibold tracking-wider opacity-70">SCREENING</span></span>
    </Link>
  );
}

export function LangSelect({ className }: { className?: string }) {
  const lang = useStore((s) => s.lang); const setLang = useStore((s) => s.setLang);
  return (
    <Select aria-label={t(lang, "common.language")} value={lang} onChange={(e) => { setLang(e.target.value as Lang); stopSpeech(); }} className={cn("h-10 w-auto min-w-[7.5rem] text-[13px]", className)}>
      {LANGS.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
    </Select>
  );
}

interface NavItem { href: string; label: string; icon: React.ElementType }
const patientNav = (lang: Lang): NavItem[] => [
  { href: "/patient/dashboard", label: t(lang, "nav.home"), icon: HouseIcon },
  { href: "/patient/upload", label: t(lang, "nav.upload"), icon: UploadSimpleIcon },
  { href: "/patient/cases", label: t(lang, "nav.cases"), icon: FolderOpenIcon },
  { href: "/patient/history", label: t(lang, "nav.history"), icon: ClockCounterClockwiseIcon },
  { href: "/patient/prescriptions", label: t(lang, "nav.medicines"), icon: PillIcon },
  { href: "/patient/instructions", label: t(lang, "nav.instructions"), icon: MicrophoneIcon },
  { href: "/patient/care-plan", label: t(lang, "nav.carePlan"), icon: ListChecksIcon },
];
const doctorNav: NavItem[] = [
  { href: "/doctor/dashboard", label: "Home", icon: HouseIcon },
  { href: "/doctor/patients", label: "Patients", icon: UsersIcon },
  { href: "/doctor/review", label: "Review", icon: ClipboardTextIcon },
  { href: "/doctor/instructions", label: "Instructions", icon: MicrophoneIcon },
  { href: "/doctor/system", label: "System view", icon: CpuIcon },
  { href: "/doctor/settings", label: "Settings", icon: GearIcon },
];

export function useHydrated() {
  const [h, setH] = React.useState(false);
  React.useEffect(() => { void useStore.persist.rehydrate(); setH(true); }, []);
  return h;
}

/** Role guard + shell for /patient/* and /doctor/* */
export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const hydrated = useHydrated();
  const router = useRouter(); const path = usePathname();
  const session = useStore((s) => s.session); const account = useStore((s) => getAccount(s));
  const lang = useStore((s) => s.lang); const notifs = useStore((s) => s.notifications); const logout = useStore((s) => s.logout);
  const readAll = useStore((s) => s.readAll);
  const [voiceOpen, setVoiceOpen] = React.useState(false);
  const [bell, setBell] = React.useState(false);

  React.useEffect(() => {
    if (!hydrated) return;
    if (!session) router.replace(`/login?next=${encodeURIComponent(path)}&role=${role}`);
    else if (session.role !== role) router.replace(`/${session.role}/dashboard`);
  }, [hydrated, session, role, router, path]);

  if (!hydrated || !session || session.role !== role) return <div className="grid min-h-dvh place-items-center bg-dots"><p className="text-sm font-semibold text-muted" role="status">Loading your workspace…</p></div>;

  const nav = role === "patient" ? patientNav(lang) : doctorNav;
  const mine = notifs.filter((n) => n.role === role);
  const unread = mine.filter((n) => !n.read).length;
  const active = (h: string) => path === h || (h !== `/${role}/dashboard` && path.startsWith(h));
  return (
    <div className={cn("min-h-dvh pb-28 md:pb-10", role === "doctor" ? "bg-dots-cool" : "bg-dots")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <header className="no-print sticky top-0 z-40 border-b border-ink/5 bg-canvas/85 backdrop-blur-md">
        <div className={cn("mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:px-6", role === "doctor" ? "max-w-7xl" : "max-w-6xl")}>
          <div className="flex items-center gap-3"><Logo href={`/${role}/dashboard`} />{role === "doctor" && <Badge tone="sky">Doctor workspace</Badge>}</div>
          <nav aria-label="Main" className="hidden items-center gap-1 rounded-full bg-white p-1 shadow-clay-sm lg:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined} className={cn("relative inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold transition-colors", active(n.href) ? "text-white" : "text-ink-soft hover:text-ink")}>
                {active(n.href) && <motion.span layoutId={`nav-pill-${role}`} className="absolute inset-0 rounded-full bg-pill" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <n.icon size={18} weight={active(n.href) ? "fill" : "regular"} className="relative" aria-hidden /><span className="relative">{n.label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {role === "patient" && <LangSelect className="hidden sm:block" />}
            <Button variant="secondary" size="icon" aria-label={`Notifications, ${unread} unread`} onClick={() => { setBell(true); }} className="relative">
              <BellIcon size={20} weight="bold" />{unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">{unread}</span>}
            </Button>
            <Dropdown.Root>
              <Dropdown.Trigger asChild><button aria-label="Account menu" className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-lavender font-display text-sm font-bold shadow-pop">{initials(account?.name ?? "?")}</button></Dropdown.Trigger>
              <Dropdown.Portal>
                <Dropdown.Content align="end" sideOffset={8} className="no-print z-[80] w-60 rounded-2xl border-2 border-ink bg-white p-2 shadow-pop-lg">
                  <div className="px-3 py-2"><p className="text-sm font-bold">{account?.name}</p><p className="text-xs text-muted">{account?.email}</p><Badge tone="sun" className="mt-1">Demo session</Badge></div>
                  <Dropdown.Separator className="my-1 h-px bg-line" />
                  <Dropdown.Item asChild><Link href={`/${role}/settings`} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold outline-none data-[highlighted]:bg-lavender-soft"><GearIcon size={16} aria-hidden />{t(lang, "nav.settings")}</Link></Dropdown.Item>
                  <Dropdown.Item onSelect={() => { logout(); router.push("/"); toast("Logged out", "info", "Demo session cleared."); }} className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold outline-none data-[highlighted]:bg-lavender-soft"><SignOutIcon size={16} aria-hidden />{t(lang, "common.logout")}</Dropdown.Item>
                </Dropdown.Content>
              </Dropdown.Portal>
            </Dropdown.Root>
          </div>
        </div>
      </header>
      <main id="main" className={cn("mx-auto px-4 py-6 sm:px-6", role === "doctor" ? "max-w-7xl" : "max-w-6xl")}>
        {children}
        <div className="no-print mt-10 space-y-3"><Disclaimer lang={role === "patient" ? lang : "en"} compact /><PrototypeNotice /></div>
      </main>

      <nav aria-label="Primary mobile" className="no-print fixed inset-x-3 bottom-3 z-40 rounded-[28px] border-2 border-ink bg-white/95 px-2 py-1.5 shadow-pop backdrop-blur lg:hidden">
        <ul className="flex items-center justify-around overflow-x-auto">
          {nav.slice(0, 5).map((n) => (
            <li key={n.href}><Link href={n.href} aria-current={active(n.href) ? "page" : undefined} className="flex min-w-14 flex-col items-center gap-0.5 rounded-2xl px-1 py-1">
              <span className={cn("grid h-9 w-12 place-items-center rounded-full transition-colors", active(n.href) ? "bg-pill text-white" : "text-ink-soft")}><n.icon size={20} weight={active(n.href) ? "fill" : "regular"} aria-hidden /></span>
              <span className={cn("text-[10px] font-semibold", active(n.href) ? "text-ink" : "text-muted")}>{n.label}</span></Link></li>
          ))}
          <li><Link href={`/${role}/settings`} className="flex min-w-14 flex-col items-center gap-0.5 px-1 py-1"><span className="grid h-9 w-12 place-items-center rounded-full text-ink-soft"><UserCircleIcon size={20} aria-hidden /></span><span className="text-[10px] font-semibold text-muted">More</span></Link></li>
        </ul>
      </nav>

      {role === "patient" && (
        <button onClick={() => setVoiceOpen(true)} aria-label={t(lang, "voice.title")} className="no-print group fixed bottom-24 right-4 z-50 grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-sun text-ink shadow-pop transition hover:-translate-y-1 hover:shadow-pop-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none lg:bottom-6 lg:right-6">
          <SpeakerHighIcon size={24} weight="bold" className="transition-transform duration-300 group-hover:rotate-12" aria-hidden />
        </button>
      )}
      <VoiceHelp open={voiceOpen} onOpenChange={setVoiceOpen} />
      <Sheet open={bell} onOpenChange={setBell} title="Notifications" description="Demo notifications from this browser session.">
        <div className="space-y-2">
          {mine.length === 0 && <p className="rounded-2xl bg-white p-4 text-sm text-muted">Nothing yet. When an analysis finishes, a notice appears here.</p>}
          {mine.map((n) => (
            <Link key={n.id} href={n.href ?? "#"} onClick={() => setBell(false)} className={cn("block rounded-2xl bg-white p-3 shadow-clay-sm", !n.read && "ring-2 ring-purple")}><p className="text-sm font-bold">{n.title}</p><p className="text-xs text-muted">{n.body}</p></Link>
          ))}
          {mine.length > 0 && <Button variant="soft" size="sm" onClick={() => readAll(role)}>Mark all as read</Button>}
        </div>
      </Sheet>
      <Toaster />
    </div>
  );
}

/** Floating voice-help assistant (project doc Feature 3). Uses browser speechSynthesis only. */
function VoiceHelp({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const lang = useStore((s) => s.lang);
  const [status, setStatus] = React.useState<string>("");
  const [q, setQ] = React.useState(0);
  const [answers, setAnswers] = React.useState<string[]>([]);
  React.useEffect(() => { if (open) setStatus(voiceStatus(lang).message); }, [open, lang]);
  const questions = ["upload.q1", "upload.q2", "upload.q3"];
  const say = async (key: string) => { const r = await speak(t(lang, key), lang); if (!r.ok) toast("Voice unavailable", "warning", r.reason); };
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t(lang, "voice.title")} description={t(lang, "voice.askNote")}>
      <div className="space-y-4">
        <LangSelect />
        <p className="rounded-xl bg-sky-soft p-3 text-xs font-medium text-sky-deep" role="status">{status}</p>
        <div className="rounded-2xl bg-white p-4 shadow-clay-sm">
          <p className="text-sm font-semibold">{t(lang, "voice.welcome")}</p>
          <div className="mt-2 flex flex-wrap gap-2"><Button size="sm" variant="soft" onClick={() => say("voice.welcome")}><SpeakerHighIcon size={16} aria-hidden />{t(lang, "common.listen")}</Button><Button size="sm" variant="ghost" onClick={() => stopSpeech()}>{t(lang, "common.stop")}</Button></div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-clay-sm"><p className="text-sm">{t(lang, "voice.photoTip")}</p><Button size="sm" className="mt-2" variant="soft" onClick={() => say("voice.photoTip")}><SpeakerHighIcon size={16} aria-hidden />{t(lang, "common.listen")}</Button></div>
        <div className="rounded-2xl bg-white p-4 shadow-clay-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Simulated voice questions</p>
          <p className="text-sm font-semibold">{t(lang, questions[q % 3])}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="soft" onClick={() => say(questions[q % 3])}><SpeakerHighIcon size={16} aria-hidden />{t(lang, "common.listen")}</Button>
            {["Yes", "No", "Not sure"].map((a) => <Button key={a} size="sm" variant="secondary" onClick={() => { setAnswers((x) => [...x, `${t(lang, questions[q % 3])} → ${a}`]); setQ((n) => n + 1); }}>{a}</Button>)}
          </div>
          {answers.length > 0 && <ul className="mt-3 space-y-1 text-xs text-ink-soft">{answers.map((a, i) => <li key={i}>• {a}</li>)}</ul>}
          <p className="mt-2 text-[11px] text-muted"><Megaphone /> Answers are tapped, not spoken: no speech-to-text service is connected.</p>
        </div>
      </div>
    </Sheet>
  );
}
function Megaphone() { return <MegaphoneIcon size={12} className="inline" aria-hidden />; }

export function ResetDemoButton({ variant = "danger" as const, label = "Reset demo" }: { variant?: "danger"; label?: string }) {
  const reset = useStore((s) => s.resetDemo); const router = useRouter();
  const [open, setOpen] = React.useState(false);
  return (<>
    <Button variant={variant} size="sm" onClick={() => setOpen(true)}><ArrowCounterClockwiseIcon size={16} weight="bold" aria-hidden />{label}</Button>
    <ConfirmDialog open={open} onOpenChange={setOpen} danger title="Reset the demo?" body="This restores the known starting state, signs you out, and clears all demo cases, reminders and in-memory files from this browser." confirmLabel="Reset demo" onConfirm={() => { reset(); router.push("/"); toast("Demo reset", "success", "Known starting state restored."); }} />
  </>);
}
