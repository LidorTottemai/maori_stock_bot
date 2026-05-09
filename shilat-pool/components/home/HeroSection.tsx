"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0C4A8B] via-[#1565C0] to-[#00B4D8] text-white min-h-[88vh] flex flex-col items-center justify-center">
      {/* Animated waves */}
      <div className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none">
        <svg
          className="absolute bottom-0 w-[200%] animate-wave"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          style={{ height: 160 }}
        >
          <path
            d="M0,80 C180,140 360,20 540,80 C720,140 900,20 1080,80 C1260,140 1440,20 1440,80 L1440,160 L0,160 Z"
            fill="rgba(255,255,255,0.15)"
          />
        </svg>
        <svg
          className="absolute bottom-0 w-[200%] animate-wave2"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          style={{ height: 130 }}
        >
          <path
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,160 L0,160 Z"
            fill="rgba(255,255,255,0.10)"
          />
        </svg>
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ height: 80 }}
        >
          <path d="M0,0 L1440,0 L1440,80 L0,80 Z" fill="#ffffff" />
        </svg>
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-4 max-w-3xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="inline-block bg-[#F0C040] text-[#0C4A8B] text-sm font-bold px-4 py-1 rounded-full mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          עונת 2026 פתוחה להרשמה
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
          בריכת שילת
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
          בריכה מחוממת חצי-אולימפית מקורה · מושב שילת<br />
          <span className="text-[#F0C040] font-semibold">3 במאי – 3 באוקטובר 2026</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register/personal"
            className="bg-[#F0C040] hover:bg-[#d4a800] text-[#0C4A8B] font-bold px-8 py-4 rounded-full text-lg transition-all hover:scale-105 shadow-lg"
          >
            הרשמה למינוי
          </Link>
          <Link
            href="/early-access"
            className="border-2 border-white hover:bg-white hover:text-[#0C4A8B] text-white font-bold px-8 py-4 rounded-full text-lg transition-all"
          >
            הרשמה מוקדמת למנויי עבר
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
