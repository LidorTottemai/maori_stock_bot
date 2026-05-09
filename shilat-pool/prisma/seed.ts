import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcryptjs from "bcryptjs";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter } as any);

const membershipTypes = [
  {
    slug: "single",
    nameHe: "מנוי עונתי יחיד",
    descriptionHe: "מנוי לאדם אחד לכל עונת הרחצה",
    price: 140000,
    earlyAccessPrice: 120000,
    maxAdults: 1,
    maxChildren: 0,
    features: JSON.stringify(["כניסה חופשית לאורך העונה", "שחייה בכל המסלולים", "גישה לבריכת פעוטות", "שירותים ומלתחות"]),
    sortOrder: 1,
  },
  {
    slug: "couple-or-single-child",
    nameHe: "מנוי עונתי זוגי או יחיד עם ילד",
    descriptionHe: "זוג מבוגרים, או מבוגר אחד עם ילד",
    price: 220000,
    earlyAccessPrice: 190000,
    maxAdults: 2,
    maxChildren: 1,
    features: JSON.stringify(["כניסה חופשית לאורך העונה", "עד 2 נפשות", "שחייה בכל המסלולים", "גישה לבריכת פעוטות"]),
    sortOrder: 2,
  },
  {
    slug: "couple-1-child",
    nameHe: "מנוי עונתי זוג + ילד 1",
    descriptionHe: "זוג מבוגרים + ילד אחד",
    price: 270000,
    earlyAccessPrice: 235000,
    maxAdults: 2,
    maxChildren: 1,
    features: JSON.stringify(["כניסה חופשית לאורך העונה", "3 נפשות", "שחייה בכל המסלולים", "גישה לבריכת פעוטות"]),
    sortOrder: 3,
  },
  {
    slug: "couple-2-children",
    nameHe: "מנוי עונתי זוג + 2 ילדים",
    descriptionHe: "זוג מבוגרים + שני ילדים",
    price: 295000,
    earlyAccessPrice: 255000,
    maxAdults: 2,
    maxChildren: 2,
    features: JSON.stringify(["כניסה חופשית לאורך העונה", "4 נפשות", "שחייה בכל המסלולים", "גישה לבריכת פעוטות"]),
    sortOrder: 4,
  },
  {
    slug: "couple-3-children",
    nameHe: "מנוי עונתי זוג + 3 ילדים",
    descriptionHe: "זוג מבוגרים + שלושה ילדים",
    price: 315000,
    earlyAccessPrice: 275000,
    maxAdults: 2,
    maxChildren: 3,
    features: JSON.stringify(["כניסה חופשית לאורך העונה", "5 נפשות", "שחייה בכל המסלולים", "גישה לבריכת פעוטות"]),
    sortOrder: 5,
  },
  {
    slug: "couple-4plus-children",
    nameHe: "מנוי עונתי זוג + 4 ילדים ויותר",
    descriptionHe: "זוג מבוגרים + 4 ילדים ומעלה",
    price: 335000,
    earlyAccessPrice: 295000,
    maxAdults: 2,
    maxChildren: 99,
    features: JSON.stringify(["כניסה חופשית לאורך העונה", "6+ נפשות", "שחייה בכל המסלולים", "גישה לבריכת פעוטות"]),
    sortOrder: 6,
  },
  {
    slug: "booklet-10",
    nameHe: "כרטיסייה – 10 כניסות",
    descriptionHe: "10 כניסות בודדות למנויי הבריכה בלבד",
    price: 65000,
    earlyAccessPrice: 55000,
    maxAdults: 1,
    maxChildren: 0,
    features: JSON.stringify(["10 כניסות שמישות לאורך העונה", "למנויי הבריכה בלבד", "מוגבל ל-2 כרטיסיות למנוי", "בלתי ניתנות להעברה"]),
    sortOrder: 7,
  },
  {
    slug: "occasional",
    nameHe: "כניסה מזדמנת",
    descriptionHe: "כניסה בודדת, לא כולל שבת וחג",
    price: 7500,
    earlyAccessPrice: 7500,
    maxAdults: 1,
    maxChildren: 0,
    features: JSON.stringify(["ימים א׳–ו׳ בלבד", "לא כולל שבת וחג", "ללא הרשמה מוקדמת"]),
    sortOrder: 8,
  },
];

async function main() {
  console.log("Seeding database...");

  for (const type of membershipTypes) {
    await prisma.membershipType.upsert({
      where: { slug: type.slug },
      update: type,
      create: type,
    });
  }

  const passwordHash = await bcryptjs.hash("admin123", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@shilatpool.co.il" },
    update: {},
    create: {
      email: "admin@shilatpool.co.il",
      passwordHash,
      name: "אבי - מנהל הבריכה",
    },
  });

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
