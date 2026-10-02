"use client";
import * as React from "react";
import type { CaseFile, SourceDoc } from "@/lib/types";
import { DOC_BY_ID } from "@/data/docs";
import { cn } from "@/lib/utils";
import { getRuntime } from "@/lib/files";
import { FileTextIcon, ImageBrokenIcon } from "@phosphor-icons/react";

/** Illustrative chest X-ray drawn in SVG. FICTIONAL — not a scan. */
export function XraySample({ highlight }: { highlight?: boolean }) {
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label="Illustrative fictional chest X-ray drawing" className="w-full rounded-2xl bg-ink">
      <defs><radialGradient id="lg"><stop offset="0" stopColor="#8e90a6" stopOpacity=".55" /><stop offset="1" stopColor="#3a3850" stopOpacity=".25" /></radialGradient></defs>
      <rect width="300" height="300" fill="#1c1b2b" />
      <path d="M150 20v250" stroke="#3a3850" strokeWidth="14" />
      <path d="M60 80c-20 60-10 150 40 170 30 8 40-40 40-90s-20-90-80-80z" fill="url(#lg)" />
      <path d="M240 80c20 60 10 150-40 170-30 8-40-40-40-90s20-90 80-80z" fill="url(#lg)" />
      {[70, 100, 130, 160, 190].map((y) => <path key={y} d={`M40 ${y}q110 -30 220 0`} stroke="#9794ab" strokeOpacity=".35" strokeWidth="3" fill="none" />)}
      <path d="M128 150c-8 30 0 70 30 70 20 0 30-30 20-60-8-20-40-25-50-10z" fill="#c4def8" fillOpacity=".25" />
      {highlight && <g><ellipse cx="85" cy="205" rx="38" ry="28" fill="#f08a6c" fillOpacity=".4" stroke="#f08a6c" strokeWidth="3" strokeDasharray="6 4" /><text x="85" y="252" fill="#fde3d9" fontSize="10" textAnchor="middle" fontFamily="sans-serif">illustrative region of interest</text></g>}
      <text x="150" y="292" fill="#fad47f" fontSize="11" textAnchor="middle" fontFamily="sans-serif" fontWeight="700">FICTIONAL DEMO IMAGE — NOT A REAL SCAN</text>
    </svg>
  );
}

export function EcgSample({ highlight }: { highlight?: boolean }) {
  const pts = Array.from({ length: 300 }, (_, i) => { const p = i % 50; const y = p === 10 ? -6 : p === 20 ? 30 : p === 21 ? -50 : p === 22 ? 14 : p > 30 && p < 40 ? -4 * Math.sin(((p - 30) / 10) * Math.PI) : 0; return `${i},${60 - y}`; }).join(" ");
  return (
    <svg viewBox="0 0 300 140" role="img" aria-label="Illustrative fictional ECG trace" className="w-full rounded-2xl bg-white">
      <defs><pattern id="g" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#f9cbc9" strokeWidth=".7" /></pattern></defs>
      <rect width="300" height="140" fill="url(#g)" />
      <polyline points={pts} fill="none" stroke="#1c1b2b" strokeWidth="1.5" />
      {highlight && <rect x="205" y="30" width="60" height="60" fill="#f08a6c" fillOpacity=".25" stroke="#f08a6c" strokeDasharray="4 3" />}
      <text x="150" y="132" fontSize="8" textAnchor="middle" fill="#c4502f" fontWeight="700" fontFamily="sans-serif">FICTIONAL DEMO SIGNAL — NOT A REAL RECORDING</text>
    </svg>
  );
}

/** Renders a seeded document with an optional highlighted line (used by the Evidence Inspector). */
export function SourceDocView({ doc, lineId, highlightImage }: { doc: SourceDoc; lineId?: string; highlightImage?: boolean }) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-white p-4 shadow-pop">
      <p className="font-display text-sm font-bold">{doc.title}</p>
      <p className="text-xs text-muted">{doc.issuer} · page {doc.page}</p>
      {doc.header && <p className="mt-1 text-[11px] font-semibold text-sun-deep">{doc.header.join(" · ")}</p>}
      {doc.kind === "xray" && <div className="mt-3"><XraySample highlight={highlightImage ?? !!lineId} /></div>}
      {doc.kind === "ecg" && <div className="mt-3"><EcgSample highlight={highlightImage ?? !!lineId} /></div>}
      {doc.table && (
        <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[320px] text-sm"><thead><tr className="bg-canvas text-left text-[11px] uppercase tracking-wider text-muted">{doc.table.columns.map((c) => <th key={c} className="px-2 py-1.5">{c}</th>)}</tr></thead>
          <tbody>{doc.table.rows.map((r) => <tr key={r.id} className={cn("border-t border-line", r.id === lineId && "bg-sun-soft outline outline-2 -outline-offset-2 outline-sun-deep")}>{r.cells!.map((c, i) => <td key={i} className="px-2 py-1.5 tabular">{c}{i === 1 && r.flag ? <b className="ml-1 text-danger">{r.flag}</b> : null}</td>)}</tr>)}</tbody></table></div>
      )}
      {doc.lines.length > 0 && doc.kind !== "xray" && doc.kind !== "ecg" && <ul className="mt-3 space-y-1.5 text-sm">{doc.lines.map((l) => <li key={l.id} className={cn("rounded-lg px-2 py-1", l.id === lineId && "bg-sun-soft outline outline-2 outline-sun-deep")}>{l.text}</li>)}</ul>}
    </div>
  );
}

export function docById(id: string) { return DOC_BY_ID[id]; }

/** Preview of a case file: sample drawings for demo files, object-URL previews for real files. */
export function FilePreview({ file, className }: { file: CaseFile; className?: string }) {
  const rt = getRuntime(file.id);
  const [failed, setFailed] = React.useState(false);
  const fallback = (msg: string) => <div className={cn("grid place-items-center rounded-2xl bg-canvas p-4 text-center text-xs text-muted", className)}><ImageBrokenIcon size={28} aria-hidden /><p className="mt-1">{msg}</p></div>;
  if (file.previewKind === "sample" && file.docId) {
    const d = DOC_BY_ID[file.docId];
    if (file.category === "xray") return <div className={className}><XraySample /></div>;
    if (file.category === "ecg") return <div className={className}><EcgSample /></div>;
    return <div className={className}><SourceDocView doc={d} /></div>;
  }
  if (!rt) return fallback("Preview unavailable — files are kept only in memory and were cleared by a refresh. Re-add the file to preview it.");
  if (failed) return fallback("The browser could not display this file.");
  if (file.previewKind === "image" && rt.url) return /* eslint-disable-next-line @next/next/no-img-element */ <img src={rt.url} alt={`Preview of ${file.name}`} onError={() => setFailed(true)} className={cn("max-h-72 w-full rounded-2xl bg-canvas object-contain", className)} />;
  if (file.previewKind === "pdf" && rt.url) return <object data={rt.url} type="application/pdf" aria-label={`PDF preview of ${file.name}`} className={cn("h-72 w-full rounded-2xl", className)}>{fallback("This browser can’t show PDFs inline.")}</object>;
  if (file.previewKind === "audio" && rt.url) return <audio controls src={rt.url} className={cn("w-full", className)} onError={() => setFailed(true)} />;
  if (file.previewKind === "text" && rt.text) return <pre className={cn("max-h-48 overflow-auto rounded-2xl bg-canvas p-3 font-mono text-[11px]", className)}>{rt.text.split("\n").slice(0, 10).join("\n")}</pre>;
  return <div className={cn("grid place-items-center rounded-2xl bg-canvas p-4 text-center text-xs text-muted", className)}><FileTextIcon size={28} aria-hidden /><p className="mt-1">No preview for this file type in the prototype.</p></div>;
}
