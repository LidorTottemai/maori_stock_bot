"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegistrationStore } from "../../../hooks/useRegistrationStore";
import Stepper from "../../../components/registration/Stepper";

export default function PaymentPage() {
  const router = useRouter();
  const store = useRegistrationStore();

  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!store.membershipTypeId) {
    if (typeof window !== "undefined") router.replace("/register/plan");
    return null;
  }

  const formatPrice = (a: number) => `₪${(a / 100).toLocaleString("he-IL")}`;

  function validate() {
    const errs: Record<string, string> = {};
    if (!/^\d{16}$/.test(card.number.replace(/\s/g, ""))) errs.number = "מספר כרטיס לא תקין";
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) errs.expiry = "פורמט MM/YY";
    if (!/^\d{3,4}$/.test(card.cvv)) errs.cvv = "CVV לא תקין";
    if (!card.name.trim()) errs.name = "שדה חובה";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: store.firstName,
          lastName: store.lastName,
          israeliId: store.israeliId,
          email: store.email,
          phone: store.phone,
          city: store.city,
          membershipTypeId: store.membershipTypeId,
          priceCharged: store.priceCharged,
          isEarlyAccess: store.isEarlyAccess,
          earlyAccessWindowId: store.earlyAccessWindowId || undefined,
          familyMembers: store.familyMembers,
          mockTransactionId: `MOCK-${Date.now()}`,
        }),
      });

      if (!res.ok) throw new Error("שגיאה בהרשמה");
      const data = await res.json();
      store.setPayment(`MOCK-${Date.now()}`);
      store.setConfirmation(data.id, data.confirmationNumber);
      router.push("/register/confirmation");
    } catch {
      alert("שגיאה בביצוע ההרשמה. אנא נסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (name: string) =>
    `w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#00B4D8] ${
      errors[name] ? "border-red-400" : "border-slate-200"
    }`;

  return (
    <div className="min-h-screen bg-[#F0F7FF] py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Stepper current={3} />
        <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800 font-medium text-center">
          ⚠️ זהו תשלום מדומה בלבד — לא יתבצע חיוב אמיתי
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 mb-5">
          <h2 className="font-black text-[#0C4A8B] mb-3">סיכום הזמנה</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between"><span>שם:</span><span className="font-semibold">{store.firstName} {store.lastName}</span></div>
            <div className="flex justify-between"><span>מינוי:</span><span className="font-semibold text-left">{store.membershipTypeName}</span></div>
            {store.isEarlyAccess && (
              <div className="flex justify-between text-green-700"><span>הנחת הרשמה מוקדמת:</span><span>✓</span></div>
            )}
            <div className="flex justify-between text-lg font-black text-[#0C4A8B] pt-2 border-t">
              <span>סה"כ:</span>
              <span>{formatPrice(store.priceCharged)}</span>
            </div>
          </div>
        </div>

        {/* Payment form */}
        <div className="bg-white rounded-2xl shadow p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-black text-[#0C4A8B] mb-6">פרטי כרטיס אשראי (מדומה)</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">שם בעל הכרטיס</label>
              <input
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
                placeholder="ישראל ישראלי"
                className={inputClass("name")}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">מספר כרטיס</label>
              <input
                value={card.number}
                onChange={(e) => setCard({ ...card, number: e.target.value })}
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                maxLength={19}
                className={inputClass("number")}
              />
              {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
            </div>

            {/* Expiry + CVV — stack on very small screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">תוקף</label>
                <input
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  maxLength={5}
                  className={inputClass("expiry")}
                />
                {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">CVV</label>
                <input
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                  placeholder="123"
                  inputMode="numeric"
                  maxLength={4}
                  className={inputClass("cvv")}
                />
                {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/register/plan")}
                className="flex-1 border border-slate-200 text-slate-600 font-semibold py-4 rounded-full hover:bg-slate-50 transition-all min-h-[48px]"
              >
                ← חזרה
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] bg-[#0C4A8B] disabled:opacity-60 hover:bg-[#0a3d74] text-white font-bold py-4 rounded-full transition-all min-h-[48px]"
              >
                {loading ? "מעבד..." : `שלם ${formatPrice(store.priceCharged)}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
