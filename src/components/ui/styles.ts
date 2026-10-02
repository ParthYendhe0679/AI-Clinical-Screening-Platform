import { cn } from "@/lib/utils";

export type BtnVariant = "primary" | "purple" | "secondary" | "outline" | "soft" | "danger" | "success" | "ghost";
const press = "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
export const VARIANT: Record<BtnVariant, string> = {
  primary: `bg-pill text-white border-2 border-pill shadow-[3px_3px_0_#7b5cf0] hover:shadow-[4px_4px_0_#7b5cf0] hover:-translate-y-0.5 ${press}`,
  purple: `bg-purple text-white border-2 border-ink shadow-pop hover:-translate-y-0.5 ${press}`,
  secondary: "bg-white text-ink shadow-clay-sm hover:-translate-y-0.5 active:scale-[0.97]",
  outline: `bg-white text-ink border-2 border-ink shadow-pop hover:-translate-y-0.5 ${press}`,
  soft: "bg-lavender-soft text-purple-deep hover:bg-lavender/60 active:scale-[0.97]",
  danger: "bg-danger text-white hover:brightness-110 active:scale-[0.97]",
  success: "bg-success text-white hover:brightness-110 active:scale-[0.97]",
  ghost: "bg-transparent text-ink hover:bg-ink/5 active:scale-[0.97]",
};
export const SIZE = { sm: "h-9 px-3.5 text-[13px] gap-1.5", md: "h-11 px-5 text-sm gap-2", lg: "h-14 px-7 text-base gap-2.5", icon: "h-11 w-11 p-0", "icon-sm": "h-9 w-9 p-0" };

/** Server-safe class builder so <Link> can look like a Button. */
export function LinkButtonClass(variant: BtnVariant = "primary", size: keyof typeof SIZE = "md", extra = "") {
  return cn("relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-semibold transition-all duration-200", VARIANT[variant], SIZE[size], extra);
}
