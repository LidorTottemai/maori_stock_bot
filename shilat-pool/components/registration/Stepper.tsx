"use client";

const steps = [
  { label: "פרטים", step: 1 },
  { label: "מינוי", step: 2 },
  { label: "תשלום", step: 3 },
  { label: "אישור", step: 4 },
];

export default function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-start justify-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.step} className="flex items-start">
          <div className="flex flex-col items-center">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                s.step < current
                  ? "bg-[#00B4D8] text-white"
                  : s.step === current
                  ? "bg-[#0C4A8B] text-white ring-4 ring-blue-200"
                  : "bg-slate-200 text-slate-400"
              }`}
              aria-label={s.label}
            >
              {s.step < current ? "✓" : s.step}
            </div>
            <span
              className={`text-xs mt-1 text-center w-12 leading-tight ${
                s.step === current ? "text-[#0C4A8B] font-semibold" : "text-slate-400"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-1 w-8 sm:w-16 md:w-20 mx-0.5 mt-5 ${
                s.step < current ? "bg-[#00B4D8]" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
