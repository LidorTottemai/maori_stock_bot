import { OrderTracking } from "@tottemai/shop"

interface Props {
  params: { token: string }
}

export default function TrackingPage({ params }: Props) {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <a
            href="/"
            className="text-lg font-bold text-brand hover:text-brand-hover transition-colors"
          >
            ← החנות שלנו
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">מעקב הזמנה</h1>
        <OrderTracking token={params.token} />
      </main>
    </div>
  )
}
