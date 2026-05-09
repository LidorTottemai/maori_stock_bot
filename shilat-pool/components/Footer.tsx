import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0C4A8B] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-3">בריכת שילת</h3>
          <p className="text-blue-200 text-sm leading-relaxed">
            מושב שילת, המחוז המרכזי<br />
            עונה: 3 במאי – 3 באוקטובר 2026
          </p>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-3">קישורים מהירים</h3>
          <ul className="space-y-2 text-sm text-blue-200">
            <li><Link href="/membership" className="hover:text-white transition-colors">מינויים ומחירים</Link></li>
            <li><Link href="/register/personal" className="hover:text-white transition-colors">הרשמה למינוי</Link></li>
            <li><Link href="/early-access" className="hover:text-white transition-colors">הרשמה מוקדמת</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-3">צור קשר</h3>
          <ul className="space-y-2 text-sm text-blue-200">
            <li>
              <span className="block">מנהל הבריכה – אבי</span>
              <a href="tel:0528405657" className="hover:text-white transition-colors">052-8405657</a>
            </li>
            <li>
              <span className="block">שיעורי שחייה (בי"ס ירדן יובל)</span>
              <a href="tel:0505793989" className="hover:text-white transition-colors">050-5793989</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-blue-700 py-4 text-center text-xs text-blue-300">
        © {new Date().getFullYear()} בריכת שילת. כל הזכויות שמורות.
        {" | "}
        <Link href="/admin/login" className="hover:text-white transition-colors">כניסת מנהל</Link>
      </div>
    </footer>
  );
}
