"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegistrationStore } from "../../hooks/useRegistrationStore";
import { motion } from "framer-motion";

export default function EarlyAccessPage() {
  const router = useRouter();
  const store = useRegistrationStore();
  const [israeliId, setIsraeliId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notEligible, setNotEligible] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{9}$/.test(israeliId.trim())) {
      setError("תעודת זהות חייבת להיות 9 ספרות");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/early-access/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ israeliId: israeliId.trim() }),
      });
      const data = await res.json();
      if (data.eligible && data.windowId) {
        store.setEarlyAccess(data.windowId);
        router.push("/register/personal");
      } else if (data.eligible && !data.windowId) {
        setError("אין חלון הרשמה מוקדמת פעיל כרגע. אנא בדקו שוב בקרוב.");
      } else {
        setNotEligible(true);
      }
    } catch {
      setError("שגיאת תקשורת. נסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C4A8B] to-[#F0F7FF] py-12 px-4">
      <div className="max-w-md mx-auto">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-7">
            <div className="text-5xl mb-3">🌊</div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0C4A8B] mb-2">הרשמה מוקדמת</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              למנויי עבר בלבד — הזינו את תעודת הזהות שלכם לקבלת גישה מוקדמת עם מחירים מוזלים
            </p>
          </div>

          {!notEligible ? (
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  תעודת זהות
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  value={israeliId}
                  onChange={(e) => setIsraeliId(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456789"
                  className={`w-full border rounded-xl px-4 py-4 text-xl text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#00B4D8] ${
                    error ? "border-red-400" : "border-slate-200"
                  }`}
                />
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0C4A8B] disabled:opacity-60 hover:bg-[#0a3d74] text-white font-bold py-4 rounded-full transition-all min-h-[48px]"
              >
                {loading ? "בודק..." : "בדוק זכאות"}
              </button>
            </form>
          ) : (
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-4xl mb-4">😔</div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">לא נמצאת ברשימת מנויי העבר</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                אם אתם חושבים שיש טעות, פנו למנהל הבריכה:{" "}
                <a href="tel:0528405657" className="text-[#00B4D8] font-semibold whitespace-nowrap">052-8405657</a>
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setNotEligible(false)}
                  className="border border-[#0C4A8B] text-[#0C4A8B] font-semibold py-4 rounded-full hover:bg-blue-50 transition-all min-h-[48px]"
                >
                  נסה ת.ז. אחרת
                </button>
                <a
                  href="/register/personal"
                  className="bg-[#0C4A8B] text-white font-bold py-4 rounded-full transition-all text-center min-h-[48px] flex items-center justify-center"
                >
                  הרשמה במחיר רגיל
                </a>
              </div>
            </motion.div>
          )}

          <p className="text-xs text-slate-400 text-center mt-6">
            פרטי תעודת הזהות שלכם מוגנים ואינם נשמרים בצורה גלויה
          </p>
        </motion.div>
      </div>
    </div>
  );
}
