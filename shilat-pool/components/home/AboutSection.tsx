"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { MdPool, MdChildCare, MdChair, MdShower } from "react-icons/md";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const highlights = [
  { Icon: MdPool, label: "בריכה חצי-אולימפית מחוממת ומקורה" },
  { Icon: MdChildCare, label: "בריכת פעוטות עם מים רדודים" },
  { Icon: MdChair, label: "צליות ופינות ישיבה במתחם" },
  { Icon: MdShower, label: "מלתחות ושירותים חדשים" },
];

export default function AboutSection() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#00B4D8] font-bold text-sm uppercase tracking-widest mb-3 block">
              אודותינו
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#0C4A8B] mb-5 leading-tight">
              בריכת שילת —<br />חוויה לכל המשפחה
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              בריכת שילת ממוקמת במושב שילת, לב השפלה, ומציעה חוויית שחייה מהנה ובטוחה לכל המשפחה.
              הבריכה פועלת מדי קיץ מה-3 במאי ועד ה-3 באוקטובר, ומחוממת לאורך כל העונה.
            </p>
            <p className="text-slate-600 leading-relaxed mb-8">
              שיעורי שחייה לכל הגילאים מועברים על ידי בית ספר ירדן יובל עם מדריכי וינגייט מוסמכים.
              ניהול הבריכה: אבי — <a href="tel:0528405657" className="text-[#00B4D8] hover:underline font-medium">052-840-5657</a>
            </p>

            <ul className="space-y-3 mb-8">
              {highlights.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-slate-700">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Icon className="text-[#0C4A8B]" size={18} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>

            <Link
              href="/membership"
              className="inline-flex items-center gap-2 bg-[#0C4A8B] hover:bg-[#0a3d74] text-white font-bold px-6 py-3 rounded-full transition-all"
            >
              לצפייה במחירים
            </Link>
          </motion.div>

          {/* Image */}
          <motion.div
            className="h-80 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-cover bg-center"
            style={{ backgroundImage: `url('${BASE}/pool-hero.jpeg')` }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>
    </section>
  );
}
