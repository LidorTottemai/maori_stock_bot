"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const steps = 40;
    const increment = to / steps;
    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + increment, to);
      setCount(Math.round(current));
      if (current >= to) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [inView, to]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const stats = [
  { label: "שנות פעילות", value: 30, suffix: "+" },
  { label: "מינויים בעונה", value: 500, suffix: "+" },
  { label: "מסלולי שחייה", value: 6, suffix: "" },
  { label: "חודשי עונה", value: 5, suffix: "" },
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-[#F0F7FF]">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="text-4xl md:text-5xl font-black text-[#0C4A8B]">
              <Counter to={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-2 text-slate-600 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
