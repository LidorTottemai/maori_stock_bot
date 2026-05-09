"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

type Testimonial = {
  id: string;
  name: string;
  text: string;
  initials: string;
  color: string;
};

export default function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-black text-[#0C4A8B]">מנויים ממליצים</h2>
          <div className="mt-3 mx-auto w-16 h-1 rounded-full bg-[#00B4D8]" />
        </motion.div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((t, i) => (
            <TestimonialCard key={t.id} t={t} i={i} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TestimonialCard t={testimonials[current]} i={0} />
          </motion.div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#00B4D8] hover:text-[#00B4D8] transition-colors"
            >
              <MdChevronRight size={22} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-[#0C4A8B]" : "bg-slate-200"}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#00B4D8] hover:text-[#00B4D8] transition-colors"
            >
              <MdChevronLeft size={22} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ t, i }: { t: Testimonial; i: number }) {
  return (
    <motion.div
      className="flex flex-col items-center text-center p-8 rounded-2xl border border-slate-100 hover:border-[#00B4D8] hover:shadow-md transition-all"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1 }}
    >
      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-2xl font-black mb-4 shadow-md`}>
        {t.initials}
      </div>
      <div className="text-[#00B4D8] text-4xl font-serif leading-none mb-2">"</div>
      <p className="text-slate-600 text-sm leading-relaxed mb-4">{t.text}</p>
      <p className="font-bold text-[#0C4A8B]">{t.name}</p>
    </motion.div>
  );
}
