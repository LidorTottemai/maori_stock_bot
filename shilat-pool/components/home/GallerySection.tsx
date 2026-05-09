"use client";
import { motion } from "framer-motion";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const photos = [
  { src: "pool-hero.jpeg", alt: "בריכת שחייה חצי-אולימפית", span: "col-span-2 row-span-2" },
  { src: "pool-hero.jpeg", alt: "מתחם הבריכה", span: "col-span-1 row-span-1" },
  { src: "pool-hero.jpeg", alt: "בריכת שילת", span: "col-span-1 row-span-1" },
];

export default function GallerySection() {
  return (
    <section className="py-20 bg-[#F8FBFF]">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-black text-[#0C4A8B]">גלריה</h2>
          <div className="mt-3 mx-auto w-16 h-1 rounded-full bg-[#00B4D8]" />
        </motion.div>

        <motion.div
          className="grid grid-cols-3 grid-rows-2 gap-3 h-[420px] sm:h-[520px] rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {photos.map((p, i) => (
            <div
              key={i}
              className={`overflow-hidden ${p.span} group bg-cover bg-center transition-transform duration-500`}
              style={{ backgroundImage: `url('${BASE}/${p.src}')` }}
            >
              <div className="w-full h-full bg-[#0C4A8B]/0 group-hover:bg-[#0C4A8B]/20 transition-colors duration-300" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
