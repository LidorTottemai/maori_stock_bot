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

  const field = (name: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        placeholder={placeholder}
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
        <Stepper current={1} />
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-black text-[#0C4A8B] mb-6">פרטים אישיים</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {field("firstName", "שם פרטי")}
              {field("lastName", "שם משפחה")}
            </div>
            {field("israeliId", "תעודת זהות", "text", "123456789")}
            {field("email", "אימייל", "email", "name@example.com")}
            {field("phone", "טלפון", "tel", "050-0000000")}
            {field("city", "עיר מגורים (אופציונלי)")}

            <button
              type="submit"
              className="w-full bg-[#0C4A8B] hover:bg-[#0a3d74] text-white font-bold py-3 rounded-full transition-all"
            >
              המשך לבחירת מינוי →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
