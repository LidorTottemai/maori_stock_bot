"use client";
import { motion } from "framer-motion";
import { MdPool, MdChildCare, MdShower, MdSchool, MdWbSunny, MdLocationOn } from "react-icons/md";
import type { IconType } from "react-icons";

const features: { Icon: IconType; color: string; bg: string; title: string; desc: string }[] = [
  {
    Icon: MdPool,
    color: "text-[#0C4A8B]",
    bg: "bg-blue-100",
    title: "בריכה חצי-אולימפית",
    desc: "25 מטר, 6 מסלולים, מחוממת ומקורה לאורך כל העונה",
  },
  {
    Icon: MdChildCare,
    color: "text-[#00B4D8]",
    bg: "bg-cyan-100",
    title: "בריכת פעוטות",
    desc: "בריכה ייעודית לתינוקות וילדים קטנים עם מים רדודים ובטוחים",
  },
  {
    Icon: MdShower,
    color: "text-[#0C4A8B]",
    bg: "bg-blue-100",
    title: "מלתחות מחודשות",
    desc: "חדרי הלבשה ומקלחות חדשות ומרווחות לנשים וגברים",
  },
  {
    Icon: MdSchool,
    color: "text-[#00B4D8]",
    bg: "bg-cyan-100",
    title: "שיעורי שחייה",
    desc: "בית ספר ירדן יובל עם מדריכי וינגייט מוסמכים לכל הגילאים",
  },
  {
    Icon: MdWbSunny,
    color: "text-amber-500",
    bg: "bg-amber-100",
    title: "עונה ארוכה",
    desc: "מ-3 במאי ועד 3 באוקטובר — חמישה חודשים של כיף בבריכה",
  },
  {
    Icon: MdLocationOn,
    color: "text-[#0C4A8B]",
    bg: "bg-blue-100",
    title: "נגישות",
    desc: "מושב שילת, לב השפלה — נגיש לערים המרכזיות",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-[#F8FBFF]">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-black text-[#0C4A8B]">
            למה בריכת שילת?
          </h2>
          <div className="mt-3 mx-auto w-16 h-1 rounded-full bg-[#00B4D8]" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="group flex gap-4 items-start bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-transparent hover:border-[#00B4D8] transition-all duration-200"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <div className={`shrink-0 w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center`}>
                <f.Icon className={`w-6 h-6 ${f.color}`} size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#0C4A8B] mb-1 group-hover:text-[#00B4D8] transition-colors">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
