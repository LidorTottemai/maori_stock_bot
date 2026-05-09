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

  const f = (name: keyof typeof card, label: string, placeholder: string, maxLen?: number) => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <input
        value={card[name]}
        onChange={(e) => setCard({ ...card, [name]: e.target.value })}
        placeholder={placeholder}
        maxLength={maxLen}
        className={`w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#00B4D8] ${
          errors[name] ? "border-red-400" : "border-slate-200"
        }`}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F7FF] py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Stepper current={3} />
        <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800 font-medium text-center">
          ⚠️ זהו תשלום מדומה בלבד — לא יתבצע חיוב אמיתי
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="font-black text-[#0C4A8B] mb-3">סיכום הזמנה</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between"><span>שם:</span><span className="font-semibold">{store.firstName} {store.lastName}</span></div>
            <div className="flex justify-between"><span>מינוי:</span><span className="font-semibold">{store.membershipTypeName}</span></div>
            {store.isEarlyAccess && (
              <div className="flex justify-between text-green-700"><span>הנחת הרשמה מוקדמת:</span><span>✓</span></div>
            )}
            <div className="flex justify-between text-lg font-black text-[#0C4A8B] pt-2 border-t">
              <span>סה"כ לתשלום:</span>
              <span>{formatPrice(store.priceCharged)}</span>
            </div>
          </div>
        </div>

        {/* Payment form */}
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-black text-[#0C4A8B] mb-6">פרטי כרטיס אשראי (מדומה)</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            {f("name", "שם בעל הכרטיס", "ישראל ישראלי")}
            {f("number", "מספר כרטיס", "0000 0000 0000 0000", 19)}
            <div className="grid grid-cols-2 gap-4">
              {f("expiry", "תוקף", "MM/YY", 5)}
              {f("cvv", "CVV", "123", 4)}
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push("/register/plan")}
                className="flex-1 border border-slate-200 text-slate-600 font-semibold py-3 rounded-full hover:bg-slate-50 transition-all"
              >
                ← חזרה
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-grow-[2] flex-2 bg-[#0C4A8B] disabled:opacity-60 hover:bg-[#0a3d74] text-white font-bold py-3 rounded-full transition-all"
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
