import { prisma } from "../../../lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalRegs, earlyRegs, revenue, recentRegs] = await Promise.all([
    prisma.registration.count({ where: { status: "ACTIVE" } }),
    prisma.registration.count({ where: { isEarlyAccess: true, status: "ACTIVE" } }),
    prisma.registration.aggregate({
      _sum: { priceCharged: true },
      where: { paymentStatus: "COMPLETED" },
    }),
    prisma.registration.findMany({
      where: { status: "ACTIVE" },
      include: { membershipType: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const totalRevenue = revenue._sum.priceCharged ?? 0;

  return (
    <div className="min-h-screen bg-[#F0F7FF] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0C4A8B]">לוח ניהול — בריכת שילת</h1>
          <form action="/api/auth/signout" method="POST">
            <button className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-4 py-2 rounded-full transition-all whitespace-nowrap min-h-[40px]">
              יציאה
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <div className="text-3xl sm:text-4xl font-black text-[#0C4A8B]">{totalRegs}</div>
            <div className="text-slate-500 text-sm mt-1">מינויים פעילים</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <div className="text-3xl sm:text-4xl font-black text-[#00B4D8]">{earlyRegs}</div>
            <div className="text-slate-500 text-sm mt-1">הרשמה מוקדמת</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <div className="text-3xl sm:text-4xl font-black text-green-600">
              ₪{(totalRevenue / 100).toLocaleString("he-IL")}
            </div>
            <div className="text-slate-500 text-sm mt-1">הכנסה כוללת</div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { href: "/api/admin/members", label: "כל המנויים (JSON)" },
            { href: "/api/admin/early-access", label: "חלונות הרשמה" },
            { href: "/api/admin/stats", label: "סטטיסטיקות" },
            { href: "/", label: "אתר ציבורי" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="bg-white border border-blue-100 rounded-xl p-3 sm:p-4 text-center text-xs sm:text-sm font-semibold text-[#0C4A8B] hover:border-[#00B4D8] hover:shadow transition-all min-h-[56px] flex items-center justify-center"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Recent registrations */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-black text-[#0C4A8B] text-lg sm:text-xl">הרשמות אחרונות</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-right px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">שם</th>
                  <th className="text-right px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">מינוי</th>
                  <th className="text-right px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">מחיר</th>
                  <th className="text-right px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">מוקדמת</th>
                  <th className="text-right px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">תאריך</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRegs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">{r.firstName} {r.lastName}</td>
                    <td className="px-3 sm:px-4 py-3 text-slate-500">{r.membershipType.nameHe}</td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">₪{(r.priceCharged / 100).toLocaleString("he-IL")}</td>
                    <td className="px-3 sm:px-4 py-3">{r.isEarlyAccess ? "✅" : "—"}</td>
                    <td className="px-3 sm:px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("he-IL")}
                    </td>
                  </tr>
                ))}
                {recentRegs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      אין הרשמות עדיין
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
