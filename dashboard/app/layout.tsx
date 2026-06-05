import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientProvider from "@/components/ClientProvider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Hipster Hippo — Admin",
  description: "Hipster Hippo Admin Dashboard",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className={inter.variable}>
      <body className="bg-h-bg text-h-text font-sans">
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  )
}
