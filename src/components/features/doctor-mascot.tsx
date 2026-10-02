"use client";

/** Friendly animated cartoon doctor (waves, blinks, bobs). Decorative. */
export function Doctor({ className = "h-44 w-36" }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 200" className={className + " animate-[bob_4s_ease-in-out_infinite]"} role="img" aria-label="Animated cartoon doctor waving">
      <ellipse cx="85" cy="194" rx="50" ry="6" fill="#1c1b2b" opacity=".12" />
      {/* coat */}
      <path d="M26 196c0-48 24-72 59-72s59 24 59 72z" fill="#fff" stroke="#1c1b2b" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M85 128v68" stroke="#1c1b2b" strokeWidth="2.5" opacity=".25" />
      <path d="M66 128l19 32 19-32" fill="#c4def8" stroke="#1c1b2b" strokeWidth="3" strokeLinejoin="round" />
      <rect x="100" y="162" width="22" height="16" rx="3" fill="#ece5fe" stroke="#1c1b2b" strokeWidth="2.5" /><path d="M105 168h12M105 173h8" stroke="#7b5cf0" strokeWidth="2" strokeLinecap="round" />
      {/* stethoscope */}
      <path d="M64 130c-12 20-6 42 12 44" fill="none" stroke="#7b5cf0" strokeWidth="4" strokeLinecap="round" /><circle cx="78" cy="175" r="7" fill="#fad47f" stroke="#1c1b2b" strokeWidth="3" />
      {/* neck + head */}
      <rect x="74" y="108" width="22" height="20" rx="8" fill="#f2b9a0" stroke="#1c1b2b" strokeWidth="3" />
      <circle cx="50" cy="82" r="8" fill="#f2b9a0" stroke="#1c1b2b" strokeWidth="3" /><circle cx="120" cy="82" r="8" fill="#f2b9a0" stroke="#1c1b2b" strokeWidth="3" />
      <ellipse cx="85" cy="80" rx="37" ry="38" fill="#f9cbb4" stroke="#1c1b2b" strokeWidth="3.5" />
      {/* hair */}
      <path d="M47 76c-6-40 34-52 62-40 14 6 18 22 14 40-6-18-20-26-38-26-18 0-30 8-38 26z" fill="#1c1b2b" />
      {/* head mirror / cap */}
      <ellipse cx="85" cy="42" rx="22" ry="9" fill="#fff" stroke="#1c1b2b" strokeWidth="3" /><path d="M85 36v12M79 42h12" stroke="#c93535" strokeWidth="3" strokeLinecap="round" />
      {/* face */}
      <g style={{ transformOrigin: "85px 82px", animation: "blink 5s infinite" }}><ellipse cx="70" cy="82" rx="4.5" ry="5.5" fill="#1c1b2b" /><ellipse cx="100" cy="82" rx="4.5" ry="5.5" fill="#1c1b2b" /><circle cx="71.5" cy="80" r="1.5" fill="#fff" /><circle cx="101.5" cy="80" r="1.5" fill="#fff" /></g>
      <circle cx="62" cy="94" r="5" fill="#f08a6c" opacity=".45" /><circle cx="108" cy="94" r="5" fill="#f08a6c" opacity=".45" />
      <path d="M72 96q13 12 26 0" fill="#fff" stroke="#1c1b2b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* waving arm */}
      <g style={{ transformOrigin: "128px 150px", animation: "wave 1.6s ease-in-out infinite" }}>
        <path d="M128 150c20-4 30-28 26-52" fill="none" stroke="#1c1b2b" strokeWidth="22" strokeLinecap="round" /><path d="M128 150c20-4 30-28 26-52" fill="none" stroke="#fff" strokeWidth="16" strokeLinecap="round" />
        <circle cx="154" cy="92" r="11" fill="#f9cbb4" stroke="#1c1b2b" strokeWidth="3.5" />
      </g>
    </svg>
  );
}
