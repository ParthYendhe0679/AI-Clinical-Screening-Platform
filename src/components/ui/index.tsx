"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { create } from "zustand";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircleIcon, InfoIcon, WarningIcon, XCircleIcon, XIcon, ArrowClockwiseIcon, SirenIcon, ShieldWarningIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { DICT } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { VARIANT, SIZE, type BtnVariant } from "./styles";
export { LinkButtonClass } from "./styles";

/* ---------------- Button (DESIGN.md §8) ---------------- */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: BtnVariant; size?: keyof typeof SIZE; loading?: boolean }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = "primary", size = "md", loading, className, children, disabled, type = "button", ...p }, ref) {
  return (
    <button ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined}
      className={cn("relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50", VARIANT[variant], SIZE[size], className)} {...p}>
      {loading && <ArrowClockwiseIcon className="animate-spin" size={16} weight="bold" aria-hidden />}
      {children}
    </button>
  );
});

/* ---------------- Card (§9) ---------------- */
const CARD = {
  clay: "bg-white shadow-clay rounded-[28px]",
  bento: "bg-white border border-line-cool shadow-soft rounded-2xl",
  sticker: "bg-white border-2 border-ink shadow-pop-lg rounded-[24px]",
  soft: "rounded-[24px]",
  flat: "bg-white rounded-2xl border border-line",
};
export function Card({ variant = "clay", tone, interactive, className, ...p }: React.HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof CARD; tone?: Tone; interactive?: boolean }) {
  return <div className={cn(CARD[variant], variant === "soft" && tone && SOFT[tone], interactive && "cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-clay-lg", "print-break-avoid", className)} {...p} />;
}

/* ---------------- Tones / badges ---------------- */
export type Tone = "purple" | "lavender" | "sun" | "coral" | "mint" | "sky" | "pink" | "cream" | "ink";
export const SOFT: Record<Tone, string> = { purple: "bg-lavender-soft text-purple-deep", lavender: "bg-lavender-soft text-purple-deep", sun: "bg-sun-soft text-sun-deep", coral: "bg-coral-soft text-coral-deep", mint: "bg-mint-soft text-mint-deep", sky: "bg-sky-soft text-sky-deep", pink: "bg-pink-soft text-pink-deep", cream: "bg-cream text-sun-deep", ink: "bg-ink/5 text-ink-soft" };
export const SOLID: Record<Tone, string> = { purple: "bg-purple", lavender: "bg-lavender", sun: "bg-sun", coral: "bg-coral", mint: "bg-mint", sky: "bg-sky", pink: "bg-pink", cream: "bg-cream", ink: "bg-ink" };
export const DEEP: Record<Tone, string> = { purple: "#5a3dd4", lavender: "#5a3dd4", sun: "#a86f00", coral: "#c4502f", mint: "#3f8a2e", sky: "#2f6fbf", pink: "#c9544f", cream: "#a86f00", ink: "#1c1b2b" };

export function Badge({ tone = "ink", className, icon, ...p }: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone; icon?: React.ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide", SOFT[tone], className)} {...p}>{icon}{p.children}</span>;
}
export function Kicker({ children, className, tilt = true }: { children: React.ReactNode; className?: string; tilt?: boolean }) {
  return <span className={cn("inline-block rounded-full border-2 border-ink bg-sun px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-ink shadow-pop", tilt && "-rotate-1", className)}>{children}</span>;
}
export function SimBadge({ children = "Simulated" }: { children?: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full border-2 border-dashed border-sun-deep/50 bg-sun-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sun-deep">{children}</span>;
}

/* ---------------- Art tile (§12.2) ---------------- */
export function ArtTile({ icon: Icon, tone = "lavender", size = 48 }: { icon: React.ElementType; tone?: Tone; size?: number }) {
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[30%] shadow-clay-sm", SOLID[tone])} style={{ width: size, height: size }} aria-hidden>
      <span className="absolute inset-x-1 top-0.5 h-1/2 rounded-full bg-white/45 blur-[2px]" />
      <Icon size={size * 0.52} weight="duotone" color={DEEP[tone]} className="relative drop-shadow-[0_2px_0_rgba(255,255,255,0.6)]" />
    </span>
  );
}

/* ---------------- Forms (§10) ---------------- */
export function Field({ label, error, hint, children, htmlFor }: { label: string; error?: string; hint?: string; children: React.ReactNode; htmlFor: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p id={`${htmlFor}-err`} role="alert" className="flex items-center gap-1 text-xs font-semibold text-danger"><WarningIcon size={14} weight="fill" aria-hidden />{error}</p>}
    </div>
  );
}
const INPUT = "w-full rounded-2xl border-2 border-transparent bg-white px-4 text-sm font-medium text-ink shadow-clay-sm outline-none placeholder:text-faint focus:border-purple aria-[invalid=true]:border-danger";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) { return <input ref={ref} className={cn(INPUT, "h-12", className)} {...p} />; });
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...p }, ref) { return <textarea ref={ref} className={cn(INPUT, "min-h-28 resize-none py-3", className)} {...p} />; });
const CHEV = "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 256 256%22><path fill=%22%231c1b2b%22 d=%22M213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32Z%22/></svg>')] bg-[length:12px] bg-[right_14px_center] bg-no-repeat pr-9";
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...p }, ref) { return <select ref={ref} className={cn(INPUT, "h-11 appearance-none", CHEV, className)} {...p} />; });

export function Chip({ selected, tone = "sun", size = "md", className, children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; tone?: Tone; size?: "sm" | "md" }) {
  return (
    <button type="button" aria-pressed={selected} className={cn("inline-flex items-center gap-1.5 rounded-full font-semibold transition active:scale-95", size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm", selected ? cn(SOLID[tone], "text-ink ring-2 ring-ink shadow-pop") : "bg-white text-ink-soft shadow-clay-sm hover:-translate-y-0.5", className)} {...p}>
      {selected && <CheckCircleIcon size={14} weight="fill" aria-hidden />}{children}
    </button>
  );
}

export function Checkbox({ checked, onChange, label, id, className, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode; id: string; className?: string; disabled?: boolean }) {
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-start gap-3 text-sm font-medium", disabled && "opacity-50", className)}>
      <input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 border-ink bg-white shadow-[2px_2px_0_#1c1b2b] peer-checked:bg-mint peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-purple">
        {checked && <CheckCircleIcon size={16} weight="bold" aria-hidden />}
      </span>
      <span>{label}</span>
    </label>
  );
}

/* ---------------- Tabs ---------------- */
export function Tabs<T extends string>({ tabs, value, onChange, label }: { tabs: { key: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex max-w-full flex-wrap gap-1 rounded-full bg-white p-1 shadow-clay-sm">
      {tabs.map((t) => (
        <button key={t.key} role="tab" type="button" aria-selected={value === t.key} onClick={() => onChange(t.key)}
          className={cn("relative h-9 rounded-full px-4 text-[13px] font-semibold transition-colors", value === t.key ? "text-white" : "text-ink-soft hover:text-ink")}>
          {value === t.key && <motion.span layoutId={`tab-${label}`} className="absolute inset-0 rounded-full bg-pill" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
          <span className="relative">{t.label}{t.count !== undefined ? ` (${t.count})` : ""}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- Sheet / Modal (§11.2) ---------------- */
export function Sheet({ open, onOpenChange, title, description, children, wide }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="no-print fixed inset-0 z-[60] bg-ink/40 backdrop-blur-[2px]" />
        <Dialog.Content aria-describedby={description ? undefined : undefined}
          className={cn("no-print fixed z-[70] flex max-h-[92dvh] flex-col overflow-hidden bg-canvas shadow-float inset-x-0 bottom-0 rounded-t-[32px] sm:inset-x-auto sm:bottom-3 sm:right-3 sm:top-3 sm:rounded-[32px]", wide ? "sm:w-[640px]" : "sm:w-[460px]")}>
          <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-ink/15 sm:hidden" />
          <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-4">
            <div>
              <Dialog.Title className="font-display text-lg font-bold">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white shadow-clay-sm transition hover:rotate-90" aria-label="Close"><XIcon size={18} weight="bold" /></Dialog.Close>
          </div>
          <div className="overflow-y-auto px-5 pb-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ConfirmDialog({ open, onOpenChange, title, body, confirmLabel = "Confirm", danger, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; body: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="no-print fixed inset-0 z-[60] bg-ink/40 backdrop-blur-[2px]" />
        <Dialog.Content className="no-print fixed left-1/2 top-1/2 z-[70] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[24px] border-2 border-ink bg-white p-6 shadow-pop-lg">
          <Dialog.Title className="font-display text-lg font-bold">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-ink-soft">{body}</Dialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant={danger ? "danger" : "primary"} onClick={() => { onConfirm(); onOpenChange(false); }}>{confirmLabel}</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ---------------- Toasts (§11.1) ---------------- */
type ToastTone = "success" | "error" | "info" | "warning";
interface Toast { id: number; tone: ToastTone; title: string; body?: string }
const useToasts = create<{ list: Toast[]; push: (t: Omit<Toast, "id">) => void; dismiss: (id: number) => void }>((set) => ({
  list: [],
  push: (t) => { const id = Date.now() + Math.random(); set((s) => ({ list: [...s.list, { ...t, id }].slice(-4) })); setTimeout(() => set((s) => ({ list: s.list.filter((x) => x.id !== id) })), 4500); },
  dismiss: (id) => set((s) => ({ list: s.list.filter((x) => x.id !== id) })),
}));
export const toast = (title: string, tone: ToastTone = "info", body?: string) => useToasts.getState().push({ title, tone, body });
const TOAST_ICON = { success: [CheckCircleIcon, "bg-mint"], error: [XCircleIcon, "bg-pink"], info: [InfoIcon, "bg-sky"], warning: [WarningIcon, "bg-sun"] } as const;
export function Toaster() {
  const { list, dismiss } = useToasts();
  return (
    <div className="no-print pointer-events-none fixed inset-x-3 top-3 z-[90] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4 sm:top-4" role="status" aria-live="polite">
      <AnimatePresence>
        {list.map((t) => { const [Icon, bg] = TOAST_ICON[t.tone]; return (
          <motion.div key={t.id} layout initial={{ opacity: 0, y: -16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 40, scale: 0.96 }} transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[22px] border-2 border-ink bg-white p-3 pr-2 shadow-pop-lg">
            <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink", bg)}><Icon size={18} weight="bold" aria-hidden /></span>
            <div className="min-w-0 flex-1 pt-0.5"><p className="text-sm font-bold">{t.title}</p>{t.body && <p className="text-xs text-muted">{t.body}</p>}</div>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink/5"><XIcon size={14} weight="bold" /></button>
          </motion.div>); })}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- States (§11.3) ---------------- */
export function EmptyState({ icon: Icon, title, body, action }: { icon: React.ElementType; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[28px] bg-white/60 p-8 text-center sm:p-14">
      <div className="mx-auto mb-4 w-fit animate-float"><ArtTile icon={Icon} tone="lavender" size={64} /></div>
      <p className="font-display text-lg font-bold">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-md text-sm text-muted">{body}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
export function ErrorState({ title = "Something went wrong", body, onRetry }: { title?: string; body?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-[28px] border-2 border-dashed border-danger/30 bg-danger-soft/40 px-6 py-10 text-center">
      <p className="font-display text-lg font-bold text-danger">{title}</p>
      {body && <p className="mt-1 text-sm text-ink-soft">{body}</p>}
      {onRetry && <Button className="mt-4" variant="outline" onClick={onRetry}><ArrowClockwiseIcon size={16} weight="bold" aria-hidden />Retry</Button>}
    </div>
  );
}
export function Skeleton({ className }: { className?: string }) { return <div aria-hidden className={cn("skeleton rounded-2xl", className)} />; }

/* ---------------- Misc ---------------- */
export function StatCard({ label, value, hint, icon, tone = "lavender" }: { label: string; value: React.ReactNode; hint?: string; icon: React.ElementType; tone?: Tone }) {
  return (
    <Card className="rounded-[24px] p-4 shadow-clay-sm sm:p-5" variant="clay">
      <div className="flex items-start justify-between gap-2"><p className="text-xs font-semibold text-muted">{label}</p><ArtTile icon={icon} tone={tone} size={38} /></div>
      <p className="tabular mt-1 font-display text-[28px] font-extrabold leading-none">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </Card>
  );
}
export function ProgressBar({ value, label, tone = "purple" }: { value: number; label: string; tone?: Tone }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} className="h-3 w-full overflow-hidden rounded-full bg-ink/10 shadow-inner">
      <div className={cn("h-full rounded-full border-r-2 border-ink transition-[width] duration-300", SOLID[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
export function PageHead({ kicker, title, sub, actions }: { kicker?: string; title: string; sub?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">{kicker && <Kicker className="mb-2">{kicker}</Kicker>}<h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>{sub && <p className="mt-1 max-w-2xl text-sm text-muted">{sub}</p>}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Persistent medical disclaimer (project doc §1, §26). */
export function Disclaimer({ lang = "en", compact, className }: { lang?: Lang; compact?: boolean; className?: string }) {
  return (
    <div role="note" className={cn("rounded-2xl border-2 border-ink bg-sun-soft p-4 shadow-pop", className)}>
      <p className="flex items-center gap-2 text-sm font-extrabold"><ShieldWarningIcon size={20} weight="duotone" aria-hidden />{DICT["disclaimer.title"][lang] ?? DICT["disclaimer.title"].en}</p>
      {!compact && <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{DICT["disclaimer.body"][lang] ?? DICT["disclaimer.body"].en}</p>}
    </div>
  );
}
export function PrototypeNotice({ className }: { className?: string }) {
  return <p className={cn("rounded-xl border border-dashed border-sun-deep/40 bg-sun-soft/60 px-3 py-2 text-xs font-medium text-sun-deep", className)}>Prototype with fictional demo data. All AI results are simulated — no real medical model ran. Demo sign-in is not production security.</p>;
}

export function UrgentAlert({ title, reason, call108, callText, className }: { title: string; reason?: string; call108?: boolean; callText?: string; className?: string }) {
  return (
    <div role="alert" className={cn("rounded-2xl border-2 border-ink bg-danger-soft p-4 shadow-pop-lg", className)}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-danger text-white"><SirenIcon size={20} weight="fill" aria-hidden /></span>
        <div>
          <p className="font-display text-base font-extrabold text-danger"><span className="mr-1 rounded-full bg-danger px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">Urgent</span>{title}</p>
          {call108 && <p className="mt-1 text-sm font-bold">{callText ?? "If you have chest pain or trouble breathing, call 108 for an ambulance."}</p>}
          {reason && <p className="mt-1 text-xs text-ink-soft">{reason}</p>}
          <p className="mt-1 text-xs text-muted">This alert comes from a fixed demo scenario, not from a real analysis. Having no alert never means a person is safe.</p>
        </div>
      </div>
    </div>
  );
}
