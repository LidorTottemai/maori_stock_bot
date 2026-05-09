"use client";
import { useRouter } from "next/navigation";
import { useRegistrationStore } from "../../../hooks/useRegistrationStore";
import Stepper from "../../../components/registration/Stepper";
import { useState } from "react";

export default function PersonalPage() {
  const router = useRouter();
  const store = useRegistrationStore();

  const [form, setForm] = useState({
    firstName: store.firstName,
    lastName: store.lastName,
    israeliId: store.israeliId,
    email: store.email,
    phone: store.phone,
    city: store.city,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "שדה חובה";
    if (!form.lastName.trim()) errs.lastName = "שדה חובה";
    if (!/^\d{9}$/.test(form.israeliId.trim())) errs.israeliId = "תעודת זהות חייבת להיות 9 ספרות";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "כתובת אימייל לא תקינה";
    if (!/^0\d{8,9}$/.test(form.phone.replace(/[-\s]/g, ""))) errs.phone = "מספר טלפון לא תקין";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    store.setPersonal({ ...form });
    router.push("/register/plan");
  }

  const inputClass = (name: string) =>
    `w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#00B4D8] ${
      errors[name] ? "border-red-400" : "border-slate-200"
    }`;

  return (
    <div className="min-h-screen bg-[#F0F7FF] py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Stepper current={1} />
        <div className="bg-white rounded-2xl shadow p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-black text-[#0C4A8B] mb-6">פרטים אישיים</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name: stacked on mobile, side-by-side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">שם פרטי</label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className={inputClass("firstName")}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">שם משפחה</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className={inputClass("lastName")}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">תעודת זהות</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={9}
                value={form.israeliId}
                onChange={(e) => setForm({ ...form, israeliId: e.target.value.replace(/\D/g, "") })}
                placeholder="123456789"
                className={inputClass("israeliId")}
              />
              {errors.israeliId && <p className="text-red-500 text-xs mt-1">{errors.israeliId}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">אימייל</label>
              <input
                type="email"
                inputMode="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@example.com"
                className={inputClass("email")}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">טלפון</label>
              <input
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="050-0000000"
                className={inputClass("phone")}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">עיר מגורים (אופציונלי)</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputClass("city")}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0C4A8B] hover:bg-[#0a3d74] text-white font-bold py-4 rounded-full transition-all min-h-[48px]"
            >
              המשך לבחירת מינוי →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
