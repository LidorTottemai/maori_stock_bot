"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRegistrationStore } from "../../../hooks/useRegistrationStore";
import Stepper from "../../../components/registration/Stepper";
import { motion } from "framer-motion";

type MembershipType = {
  id: string;
  slug: string;
  nameHe: string;
  descriptionHe: string;
  price: number;
  earlyAccessPrice: number;
  features: string[];
};

export default function PlanPage() {
  const router = useRouter();
  const store = useRegistrationStore();
  const [types, setTypes] = useState<MembershipType[]>([]);
  const [selected, setSelected] = useState(store.membershipTypeId);

  useEffect(() => {
    fetch("/api/membership-types")
      .then((r) => r.json())
      .then(setTypes);
  }, []);

  if (!store.firstName) {
    if (typeof window !== "undefined") router.replace("/register/personal");
    return null;
  }

  const formatPrice = (a: number) => `₪${(a / 100).toLocaleString("he-IL")}`;
  const isEarly = store.isEarlyAccess;

  function handleSubmit() {
    const type = types.find((t) => t.id === selected);
    if (!type) return;
    store.setPlan({
      membershipTypeId: type.id,
      membershipTypeSlug: type.slug,
      membershipTypeName: type.nameHe,
      priceCharged: isEarly ? type.earlyAccessPrice : type.price,
    });
    router.push("/register/payment");
  }

  return (
    <div className="min-h-screen bg-[#F0F7FF] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Stepper current={2} />
        <div className="bg-white rounded-2xl shadow p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-black text-[#0C4A8B] mb-2">בחירת מינוי</h1>
          {isEarly && (
            <div className="mb-4 bg-[#F0C040]/20 border border-[#F0C040] text-[#7a5f00] rounded-xl px-4 py-3 text-sm font-medium">
              🎉 הרשמה מוקדמת פעילה — מחירים מוזלים מוצגים!
            </div>
          )}

          <div className="space-y-3 mb-6">
            {types.map((t, i) => (
              <motion.label
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all min-h-[64px] ${
                  selected === t.id
                    ? "border-[#0C4A8B] bg-blue-50"
                    : "border-slate-200 hover:border-blue-300"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={t.id}
                  checked={selected === t.id}
                  onChange={() => setSelected(t.id)}
                  className="w-5 h-5 accent-[#0C4A8B] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#0C4A8B] text-sm sm:text-base leading-snug">{t.nameHe}</div>
                  <div className="text-xs text-slate-500 hidden sm:block">{t.descriptionHe}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-black ${isEarly ? "line-through text-slate-400 text-sm" : "text-[#0C4A8B] text-base sm:text-lg"}`}>
                    {formatPrice(t.price)}
                  </div>
                  {isEarly && (
                    <div className="font-black text-base sm:text-lg text-[#00B4D8]">
                      {formatPrice(t.earlyAccessPrice)}
                    </div>
                  )}
                </div>
              </motion.label>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/register/personal")}
              className="flex-1 border border-slate-200 text-slate-600 font-semibold py-4 rounded-full hover:bg-slate-50 transition-all min-h-[48px]"
            >
              ← חזרה
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selected}
              className="flex-[2] bg-[#0C4A8B] disabled:opacity-40 hover:bg-[#0a3d74] text-white font-bold py-4 rounded-full transition-all min-h-[48px]"
            >
              המשך לתשלום →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
