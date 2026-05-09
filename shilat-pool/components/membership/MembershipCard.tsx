"use client";
import { motion } from "framer-motion";
import Link from "next/link";

type Props = {
  slug: string;
  nameHe: string;
  descriptionHe: string;
  price: number;
  earlyAccessPrice: number;
  features: string[];
  highlighted?: boolean;
  index?: number;
};

export default function MembershipCard({
  slug,
  nameHe,
  descriptionHe,
  price,
  earlyAccessPrice,
  features,
  highlighted = false,
  index = 0,
}: Props) {
  const formatPrice = (agorot: number) =>
    `₪${(agorot / 100).toLocaleString("he-IL")}`;

  return (
    <motion.div
      className={`relative rounded-2xl p-6 flex flex-col gap-4 ${
        highlighted
          ? "bg-[#0C4A8B] text-white shadow-2xl ring-4 ring-[#00B4D8]"
          : "bg-white border border-blue-100 shadow hover:shadow-lg"
      } transition-all`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
    >
      {highlighted && (
        <span className="absolute -top-3 right-6 bg-[#F0C040] text-[#0C4A8B] text-xs font-black px-3 py-1 rounded-full">
          הנפוץ ביותר
        </span>
      )}

      <div>
        <h3 className={`text-lg font-black ${highlighted ? "text-white" : "text-[#0C4A8B]"}`}>
          {nameHe}
        </h3>
        <p className={`text-sm mt-1 ${highlighted ? "text-blue-200" : "text-slate-500"}`}>
          {descriptionHe}
        </p>
      </div>

      <div>
        <div className={`text-3xl font-black ${highlighted ? "text-[#F0C040]" : "text-[#0C4A8B]"}`}>
          {formatPrice(price)}
        </div>
        <div className={`text-sm mt-1 ${highlighted ? "text-blue-200" : "text-slate-500"}`}>
          הרשמה מוקדמת: <span className="font-semibold text-[#00B4D8]">{formatPrice(earlyAccessPrice)}</span>
        </div>
      </div>

      <ul className="space-y-2 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <span className="text-[#00B4D8] mt-0.5">✓</span>
            <span className={highlighted ? "text-blue-100" : "text-slate-600"}>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/register/personal?plan=${slug}`}
        className={`text-center py-3 rounded-full font-bold transition-all ${
          highlighted
            ? "bg-[#F0C040] text-[#0C4A8B] hover:bg-[#d4a800]"
            : "bg-[#0C4A8B] text-white hover:bg-[#0a3d74]"
        }`}
      >
        בחר מינוי זה
      </Link>
    </motion.div>
  );
}
