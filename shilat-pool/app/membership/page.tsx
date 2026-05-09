import { prisma } from "../../lib/prisma";
import MembershipCard from "../../components/membership/MembershipCard";

export const dynamic = "force-dynamic";

export default async function MembershipPage() {
  const types = await prisma.membershipType.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="py-16 px-4 bg-[#F0F7FF] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-[#0C4A8B] mb-4">
            מינויים ומחירים
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            בחרו את המינוי המתאים לכם. מחירי הרשמה מוקדמת זמינים למנויי עבר בלבד דרך{" "}
            <a href="/early-access" className="text-[#00B4D8] font-semibold hover:underline">
              דף ההרשמה המוקדמת
            </a>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {types.filter(t => !["booklet-10", "occasional"].includes(t.slug)).map((t, i) => (
            <MembershipCard
              key={t.id}
              slug={t.slug}
              nameHe={t.nameHe}
              descriptionHe={t.descriptionHe}
              price={t.price}
              earlyAccessPrice={t.earlyAccessPrice}
              features={JSON.parse(t.features)}
              highlighted={t.slug === "couple-2-children"}
              index={i}
            />
          ))}
        </div>

        {/* Extra options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
          {types.filter(t => ["booklet-10", "occasional"].includes(t.slug)).map((t, i) => (
            <MembershipCard
              key={t.id}
              slug={t.slug}
              nameHe={t.nameHe}
              descriptionHe={t.descriptionHe}
              price={t.price}
              earlyAccessPrice={t.earlyAccessPrice}
              features={JSON.parse(t.features)}
              index={i}
            />
          ))}
        </div>

        {/* Rules */}
        <div className="bg-white rounded-2xl p-6 border border-blue-100 max-w-2xl mx-auto">
          <h2 className="font-black text-[#0C4A8B] text-xl mb-4">הערות חשובות</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• לא יתאפשר איחוד משפחות למנוי אחד</li>
            <li>• ילד מגיל 2 מחויב במנוי</li>
            <li>• בימים שני ורביעי מ-16:00 לא יוקצה מסלול לשחיינים</li>
            <li>• אין כניסה מזדמנת בשבת וחג</li>
            <li>• כרטיסיות אורח מוגבלות ל-2 לכל מנוי, בלתי ניתנות להעברה</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
