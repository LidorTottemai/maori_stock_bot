import type { Metadata } from "next"
import { Rubik } from "next/font/google"
import { CartProvider } from "@tottemai/shop"
import "./globals.css"

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-rubik",
})

export const metadata: Metadata = {
  title: "החנות שלנו",
  description: "ברוכים הבאים לחנות",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className={rubik.variable}>
      <body className="bg-white text-gray-900 font-sans">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
