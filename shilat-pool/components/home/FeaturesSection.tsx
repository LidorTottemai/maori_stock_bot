"use client";
import { motion } from "framer-motion";

const features = [
  {
    icon: "🏊",
    title: "בריכה חצי-אולימפית",
    desc: "25 מטר, 6 מסלולים, מחוממת ומקורה לאורך כל העונה",
  },
  {
    icon: "👶",
    title: "בריכת פעוטות",
    desc: "בריכה ייעודית לתינוקות וילדים קטנים עם מים רדודים ובטוחים",
  },
  {
    icon: "🚿",
    title: "מלתחות מחודשות",
    desc: "חדרי הלבשה ומקלחות חדשות ומרווחות לנשים וגברים",
  },
  {
    icon: "🎓",
    title: "שיעורי שחייה",
    desc: "בית ספר ירדן יובל עם מדריכי וינגייט מוסמכים לכל הגילאים",
  },
  {
    icon: "☀️",
    title: "עונה ארוכה",
    desc: "מ-3 במאי ועד 3 באוקטובר — חמישה חודשים של כיף בבריכה",
  },
  {
    icon: "📍",
    title: "נגישות",
    desc: "מושב שילת, לב השפלה — נגיש לערים המרכזיות",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-black text-center text-[#0C4A8B] mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          למה בריכת שילת?
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="p-6 rounded-2xl border border-blue-100 hover:border-[#00B4D8] hover:shadow-lg transition-all group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg text-[#0C4A8B] mb-2 group-hover:text-[#00B4D8] transition-colors">
                {f.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
