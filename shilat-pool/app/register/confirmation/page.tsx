"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRegistrationStore } from "../../../hooks/useRegistrationStore";
import { motion } from "framer-motion";
import Link from "next/link";
import Stepper from "../../../components/registration/Stepper";

export default function ConfirmationPage() {
  const router = useRouter();
  const store = useRegistrationStore();

  useEffect(() => {
    if (!store.confirmationNumber) {
      router.replace("/register/personal");
    }
  }, [store.confirmationNumber, router]);

  if (!store.confirmationNumber) return null;

  return (
    <div className="min-h-screen bg-[#F0F7FF] py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Stepper current={4} />

        <motion.div
          className="bg-white rounded-2xl shadow p-6 sm:p-8 text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <motion.div
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            ✅
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#0C4A8B] mb-2">ההרשמה בוצעה בהצלחה!</h1>
          <p className="text-slate-500 mb-5 text-sm sm:text-base">אישור נשלח לכתובת {store.email}</p>

          <div className="bg-[#F0F7FF] rounded-xl p-4 sm:p-6 mb-5">
            <p className="text-sm text-slate-500 mb-1">מספר אישור:</p>
            <p className="font-mono font-black text-base sm:text-xl text-[#0C4A8B] tracking-wider break-all">
              {store.confirmationNumber}
            </p>
          </div>

          <div className="text-sm text-slate-600 space-y-2 text-right mb-6">
            <p><span className="font-semibold">שם:</span> {store.firstName} {store.lastName}</p>
            <p><span className="font-semibold">מינוי:</span> {store.membershipTypeName}</p>
            {store.isEarlyAccess && (
              <p className="text-green-700 font-semibold">✓ הרשמה מוקדמת</p>
            )}
          </div>

          <Link
            href="/"
            onClick={() => store.reset()}
            className="block bg-[#0C4A8B] hover:bg-[#0a3d74] text-white font-bold py-4 rounded-full transition-all min-h-[48px] flex items-center justify-center"
          >
            חזרה לדף הבית
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
