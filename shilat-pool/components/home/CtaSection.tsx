"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#0C4A8B] to-[#00B4D8] text-white text-center">
      <motion.div
        className="max-w-2xl mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-black mb-4">
          מוכנים לעונת 2026?
        </h2>
        <p className="text-blue-100 mb-8 text-lg">
          הבטיחו את מקומכם עוד היום — מינויים בכמות מוגבלת
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register/personal"
            className="bg-[#F0C040] hover:bg-[#d4a800] text-[#0C4A8B] font-bold px-8 py-4 rounded-full text-lg transition-all hover:scale-105"
          >
            הרשמה למינוי
          </Link>
          <Link
            href="/membership"
            className="border-2 border-white hover:bg-white hover:text-[#0C4A8B] font-bold px-8 py-4 rounded-full text-lg transition-all"
          >
            צפייה במחירים
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
