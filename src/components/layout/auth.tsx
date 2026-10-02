"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon, StethoscopeIcon, UserIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import { UploadSimpleIcon, GraphIcon, FileTextIcon } from "@phosphor-icons/react";
import { useStore } from "@/store";
import { ArtTile, Button, Card, Chip, Field, Input, PrototypeNotice, toast, Toaster } from "@/components/ui";
import { Logo, useHydrated } from "./shell";
import { Doctor } from "@/components/features/doctor-mascot";
import { XraySample } from "@/components/features/docs";
import { DEMO_DOCTOR_EMAIL, DEMO_PASSWORD, DEMO_PATIENT_EMAIL } from "@/data/seed";
import type { Role } from "@/lib/types";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-dots lg:grid-cols-[1fr_1.05fr]">
      <aside className="hidden overflow-hidden border-r-2 border-ink bg-lavender p-10 lg:flex lg:flex-col">
        <Logo />
        <h2 className="mt-8 text-[2.6rem] font-extrabold leading-[1.05] tracking-[-0.03em]">Your files.<br />One <span className="relative inline-block"><span className="relative z-10">clear</span><span className="absolute inset-x-0 bottom-1 z-0 h-4 -rotate-1 rounded-full bg-sun" aria-hidden /></span> report.</h2>
        <div className="mt-6 flex items-center justify-between gap-3 rounded-[28px] border-2 border-ink bg-white p-4 shadow-pop-lg">
          {[[UploadSimpleIcon, "mint", "1. UPLOAD"], [GraphIcon, "lavender", "2. MODELS"], [FileTextIcon, "sun", "3. REPORT"]].map(([I, tone, l], k) => (
            <React.Fragment key={l as string}>
              <div className="text-center"><div className="mx-auto w-fit"><ArtTile icon={I as React.ElementType} tone={tone as "mint"} size={68} /></div><p className="mt-2 text-[11px] font-bold tracking-wider">{l as string}</p></div>
              {k < 2 && <svg viewBox="0 0 60 20" className="h-5 w-12 shrink-0 text-ink" aria-hidden><path d="M2 14c14-14 34-14 52 0" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" /><path d="M48 8l8 6-10 2" fill="none" stroke="currentColor" strokeWidth="2" /></svg>}
            </React.Fragment>
          ))}
        </div>
        <div className="relative mt-10 flex-1">
          <div className="absolute left-0 top-0 w-[68%] -rotate-3 rounded-[28px] border-2 border-ink bg-white p-3 shadow-pop-lg"><XraySample highlight /><p className="mt-2 flex flex-wrap items-center gap-1 text-xs"><span className="rounded-full bg-sky-soft px-2 py-0.5 font-extrabold text-sky-deep">MODEL</span> possible infection · <b>81%</b> <em className="text-muted">demo</em></p></div>
          <div className="absolute right-0 top-24 w-[46%] rotate-3 rounded-[24px] border-2 border-ink bg-white p-4 shadow-pop-lg"><p className="font-display text-sm font-bold">Not a diagnosis</p><p className="mt-1 text-xs text-muted">Screening support that always sends you to a doctor.</p></div>
          <div className="absolute bottom-0 right-4"><Doctor className="h-40 w-32" /></div>
          <span className="burst absolute left-[52%] top-2 grid h-20 w-20 rotate-12 place-items-center bg-sun font-display text-sm font-extrabold drop-shadow-[3px_3px_0_#1c1b2b]">ZAP!</span>
        </div>
        <p className="text-xs font-semibold text-ink-soft">Prototype · fictional demo data · simulated AI</p>
      </aside>
      <main className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"><ArrowLeftIcon size={16} weight="bold" aria-hidden />Back to landing page</Link>
        {children}
        <PrototypeNotice className="mt-6" />
      </main>
      <Toaster />
    </div>
  );
}

function RoleSelect({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  return (
    <fieldset className="space-y-2"><legend className="text-sm font-semibold">I am a…</legend>
      <div className="grid grid-cols-2 gap-1 rounded-full border-2 border-ink bg-white p-1 shadow-pop">
        {([["patient", "Patient / caregiver", UserIcon, "bg-mint"], ["doctor", "Doctor", StethoscopeIcon, "bg-sky"]] as const).map(([r, l, I, bg]) => (
          <button key={r} type="button" aria-pressed={role === r} onClick={() => onChange(r)} className={"flex h-11 items-center justify-center gap-2 rounded-full text-sm font-bold transition " + (role === r ? bg + " border-2 border-ink shadow-pop" : "text-ink-soft hover:text-ink")}><I size={16} weight={role === r ? "fill" : "regular"} aria-hidden />{l}</button>
        ))}
      </div>
    </fieldset>
  );
}

function PasswordInput({ id, value, onChange, error, label }: { id: string; value: string; onChange: (v: string) => void; error?: string; label: string }) {
  const [show, setShow] = React.useState(false);
  return (
    <Field label={label} htmlFor={id} error={error}>
      <div className="relative"><Input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} autoComplete={id === "pw" ? "current-password" : "new-password"} className="pr-12" />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full hover:bg-ink/5">{show ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}</button></div>
    </Field>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const hydrated = useHydrated(); const router = useRouter(); const sp = useSearchParams();
  const login = useStore((s) => s.login); const demoLogin = useStore((s) => s.demoLogin); const session = useStore((s) => s.session);
  const [role, setRole] = React.useState<Role>((sp.get("role") as Role) === "doctor" ? "doctor" : "patient");
  const [email, setEmail] = React.useState(""); const [pw, setPw] = React.useState("");
  const [errs, setErrs] = React.useState<{ email?: string; pw?: string; form?: string }>({}); const [busy, setBusy] = React.useState(false);
  const next = sp.get("next");
  const go = (r: Role) => router.replace(next && next.startsWith(`/${r}`) ? next : `/${r}/dashboard`);
  React.useEffect(() => { if (hydrated && session) go(session.role); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [hydrated, session]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: typeof errs = {};
    if (!email.trim()) er.email = "Email is required."; else if (!EMAIL_RE.test(email)) er.email = "Enter a valid email address.";
    if (!pw) er.pw = "Password is required.";
    setErrs(er); if (Object.keys(er).length) return;
    setBusy(true);
    setTimeout(() => { const r = login(email, pw, role); setBusy(false); if (!r.ok) { setErrs({ form: r.error }); toast("Could not sign in", "error", r.error); } else { toast("Signed in (demo session)", "success"); go(r.role!); } }, 500);
  };
  return (
    <Card variant="sticker" className="p-6 sm:p-8">
      <h1 className="text-3xl font-extrabold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Demo accounts only — this is not production authentication.</p>
      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        <RoleSelect role={role} onChange={(r) => { setRole(r); setErrs({}); }} />
        <Field label="Email" htmlFor="email" error={errs.email}><Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errs.email} aria-describedby={errs.email ? "email-err" : undefined} autoComplete="email" /></Field>
        <PasswordInput id="pw" label="Password" value={pw} onChange={setPw} error={errs.pw} />
        {errs.form && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm font-semibold text-danger">{errs.form}</p>}
        <Button type="submit" size="lg" className="w-full" loading={busy}>Log in</Button>
      </form>
      <div className="mt-5 rounded-2xl bg-sun-soft p-4 text-sm">
        <p className="font-bold">Demo accounts (password <code className="font-mono">{DEMO_PASSWORD}</code>)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => { setRole("patient"); setEmail(DEMO_PATIENT_EMAIL); setPw(DEMO_PASSWORD); setErrs({}); }}>Fill patient</Button>
          <Button size="sm" variant="outline" onClick={() => { setRole("doctor"); setEmail(DEMO_DOCTOR_EMAIL); setPw(DEMO_PASSWORD); setErrs({}); }}>Fill doctor</Button>
          <Button size="sm" variant="purple" onClick={() => { demoLogin("patient"); router.replace("/patient/dashboard"); }}>Patient Demo</Button>
          <Button size="sm" variant="purple" onClick={() => { demoLogin("doctor"); router.replace("/doctor/dashboard"); }}>Doctor Demo</Button>
        </div>
      </div>
      <p className="mt-5 text-center text-sm">No account? <Link href="/register" className="font-bold text-purple-deep underline">Register</Link></p>
    </Card>
  );
}

export function RegisterForm() {
  const router = useRouter(); const register = useStore((s) => s.register);
  const [role, setRole] = React.useState<Role>("patient");
  const [f, setF] = React.useState({ name: "", email: "", pw: "", pw2: "", agree: false });
  const [errs, setErrs] = React.useState<Record<string, string>>({}); const [busy, setBusy] = React.useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = "Enter your name (at least 2 characters).";
    if (!EMAIL_RE.test(f.email)) er.email = "Enter a valid email address.";
    if (f.pw.length < 8) er.pw = "Use at least 8 characters.";
    if (f.pw2 !== f.pw) er.pw2 = "Passwords do not match.";
    if (!f.agree) er.agree = "Please acknowledge the demo notice.";
    setErrs(er); if (Object.keys(er).length) return;
    setBusy(true);
    setTimeout(() => { const r = register({ name: f.name.trim(), email: f.email, password: f.pw, role }); setBusy(false); if (!r.ok) { setErrs({ email: r.error! }); return; } toast("Account created (demo only)", "success", "Stored in this browser only."); router.replace(`/${role}/dashboard`); }, 500);
  };
  return (
    <Card variant="sticker" className="p-6 sm:p-8">
      <h1 className="text-2xl font-extrabold">Create a demo account</h1>
      <p className="mt-1 text-sm text-muted">We only ask for name, email and password. No medical details are needed to register.</p>
      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        <RoleSelect role={role} onChange={setRole} />
        <Field label="Full name" htmlFor="name" error={errs.name}><Input id="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-invalid={!!errs.name} autoComplete="name" /></Field>
        <Field label="Email" htmlFor="remail" error={errs.email}><Input id="remail" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-invalid={!!errs.email} autoComplete="email" /></Field>
        <PasswordInput id="npw" label="Password" value={f.pw} onChange={(v) => setF({ ...f, pw: v })} error={errs.pw} />
        <PasswordInput id="npw2" label="Confirm password" value={f.pw2} onChange={(v) => setF({ ...f, pw2: v })} error={errs.pw2} />
        <div><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={f.agree} onChange={(e) => setF({ ...f, agree: e.target.checked })} className="mt-1 h-4 w-4 accent-purple" />I understand this is a prototype: the account lives only in this browser, and no real medical analysis is performed.</label>{errs.agree && <p role="alert" className="mt-1 text-xs font-semibold text-danger">{errs.agree}</p>}</div>
        <Button type="submit" size="lg" className="w-full" loading={busy}><ShieldCheckIcon size={18} aria-hidden />Create account</Button>
      </form>
      <p className="mt-5 text-center text-sm">Already registered? <Link href="/login" className="font-bold text-purple-deep underline">Log in</Link></p>
    </Card>
  );
}
