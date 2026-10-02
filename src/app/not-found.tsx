import Link from "next/link";
import { LinkButtonClass } from "@/components/ui/styles";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-dots px-4">
      <div className="max-w-md rounded-[28px] border-2 border-ink bg-white p-8 text-center shadow-pop-lg">
        <p className="font-display text-6xl font-extrabold">404</p>
        <h1 className="mt-2 text-xl font-bold">This page doesn’t exist</h1>
        <p className="mt-1 text-sm text-muted">The link may be wrong, or a demo case was reset.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/" className={LinkButtonClass("primary")}>Back to landing page</Link>
          <Link href="/demo" className={LinkButtonClass("outline")}>Open demo</Link>
        </div>
      </div>
    </main>
  );
}
