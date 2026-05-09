"use client";

const steps = [
  { label: "פרטים אישיים", step: 1 },
  { label: "בחירת מינוי", step: 2 },
  { label: "תשלום", step: 3 },
  { label: "אישור", step: 4 },
];

export default function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                s.step < current
                  ? "bg-[#00B4D8] text-white"
                  : s.step === current
                  ? "bg-[#0C4A8B] text-white ring-4 ring-blue-200"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              {s.step < current ? "✓" : s.step}
            </div>
            <span
              className={`text-xs mt-1 hidden sm:block ${
                s.step === current ? "text-[#0C4A8B] font-semibold" : "text-slate-400"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-12 sm:w-20 mx-1 ${
                s.step < current ? "bg-[#00B4D8]" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
