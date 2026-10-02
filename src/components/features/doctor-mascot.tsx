"use client";
export function Doctor({ className = "h-44 w-36" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 190" className={className + " animate-[bob_4s_ease-in-out_infinite]"} role="img" aria-label="Animated cartoon doctor waving">
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

