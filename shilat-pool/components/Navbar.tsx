"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0C4A8B] text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition-opacity">
          <WaveLogo />
          <span>בריכת שילת</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-[#00B4D8] transition-colors">בית</Link>
          <Link href="/membership" className="hover:text-[#00B4D8] transition-colors">מינויים ומחירים</Link>
          <Link href="/early-access" className="hover:text-[#F0C040] transition-colors">הרשמה מוקדמת</Link>
          <Link
            href="/register/personal"
            className="bg-[#00B4D8] hover:bg-[#0094b8] text-white px-4 py-2 rounded-full transition-colors"
          >
            הרשמה עכשיו
          </Link>
        </nav>

        {/* Hamburger — 44px touch target */}
        <button
          className="md:hidden w-11 h-11 flex flex-col items-center justify-center gap-1.5 rounded-md hover:bg-[#0a3d74] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="תפריט"
          aria-expanded={open}
        >
          <span className={`block w-5 h-0.5 bg-white transition-transform ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white transition-transform ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#0a3d74] px-4 pt-2 pb-6 flex flex-col gap-1 text-base font-medium">
          <Link href="/" onClick={() => setOpen(false)} className="py-3 hover:text-[#00B4D8] transition-colors border-b border-white/10">בית</Link>
          <Link href="/membership" onClick={() => setOpen(false)} className="py-3 hover:text-[#00B4D8] transition-colors border-b border-white/10">מינויים ומחירים</Link>
          <Link href="/early-access" onClick={() => setOpen(false)} className="py-3 hover:text-[#F0C040] transition-colors border-b border-white/10">הרשמה מוקדמת למנויי עבר</Link>
          <Link
            href="/register/personal"
            onClick={() => setOpen(false)}
            className="mt-2 bg-[#00B4D8] text-white px-4 py-3 rounded-full text-center transition-colors"
          >
            הרשמה עכשיו
          </Link>
        </div>
      )}
    </header>
  );
}

function WaveLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#00B4D8" fillOpacity="0.25" />
      <path d="M4 20 C8 16 12 24 16 20 C20 16 24 24 28 20" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M4 24 C8 20 12 28 16 24 C20 20 24 28 28 24" stroke="#00B4D8" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
