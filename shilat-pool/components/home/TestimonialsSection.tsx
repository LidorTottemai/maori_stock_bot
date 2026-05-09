"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

const testimonials = [
  {
    name: "רונית כהן",
    initials: "ר",
    color: "from-[#0C4A8B] to-[#1565C0]",
    text: "אנחנו משפחה עם שלושה ילדים ומגיעים לבריכת שילת כבר שש שנים. האווירה פמילירית, הצוות קשוב, והבריכה תמיד נקייה ומוזמנת. הכי טוב בקיץ!",
  },
  {
    name: "דוד מזרחי",
    initials: "ד",
    color: "from-[#00B4D8] to-[#0077B6]",
    text: "שוחה בבריכה כל בוקר לפני העבודה. המים נקיים, המסלולים מוסדרים ויש תמיד אנשי צוות זמינים. שילת היא המקום הכי שקט ומרגיע שמצאתי.",
  },
  {
    name: "מיכל לוי",
    initials: "מ",
    color: "from-[#0C4A8B] to-[#00B4D8]",
    text: "הילדים שלי לומדים לשחות עם מדריכי בית ספר ירדן יובל — מקצועיים, סבלניים ואוהבים ילדים. תוך עונה אחת הם כבר שוחים לבד. ממליצה בחום!",
  },
  {
    name: "יוסי שפירא",
    initials: "י",
    color: "from-[#1565C0] to-[#00B4D8]",
    text: "מנוי זוגי כבר ארבע שנים. מחיר הוגן, שירות אדיב ומיקום נגיש מאוד לתושבי האזור. כל קיץ מחכים שהבריכה תיפתח.",
  },
  {
    name: "תמר אברהם",
    initials: "ת",
    color: "from-[#0C4A8B] to-[#1565C0]",
    text: "הפינות ישיבה, הצל והמתחם הכולל הופכים את הביקור לחוויה שלמה. לא רק שוחים — מבלים. מגיעים כל שבוע עם כל המשפחה המורחבת.",
  },
];

export default function TestimonialsSection() {
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
            <TestimonialCard key={t.name} t={t} i={i} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
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

function TestimonialCard({ t, i }: { t: typeof testimonials[0]; i: number }) {
  return (
    <motion.div
      className="flex flex-col items-center text-center p-8 rounded-2xl border border-slate-100 hover:border-[#00B4D8] hover:shadow-md transition-all"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1 }}
    >
      {/* Avatar */}
      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-2xl font-black mb-4 shadow-md`}>
        {t.initials}
      </div>
      {/* Quote mark */}
      <div className="text-[#00B4D8] text-4xl font-serif leading-none mb-2">"</div>
      <p className="text-slate-600 text-sm leading-relaxed mb-4">{t.text}</p>
      <p className="font-bold text-[#0C4A8B]">{t.name}</p>
    </motion.div>
  );
}
