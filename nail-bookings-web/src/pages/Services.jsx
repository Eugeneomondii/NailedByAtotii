import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { formatPrice, formatDuration } from '../format'

const addOns = [
  { name: 'Plain design', price: 'KSh 30 per nail' },
  { name: '3D design', price: 'KSh 50 per nail' },
]

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/services')
      .then(setServices)
      .catch((err) => {
        console.error('Services request failed:', err)
        setError("We couldn't load the services right now. Please refresh or message us on WhatsApp.")
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Page heading */}
      <section className="mx-auto max-w-3xl px-4 pt-14 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gold" />
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-mauve">Services &amp; prices</p>
          <span className="h-px w-8 bg-gold" />
        </div>
        <h1 className="mt-5 font-display text-4xl uppercase tracking-wide text-ink md:text-5xl">
          Our services
        </h1>
        <div className="mx-auto mt-5 h-px w-16 bg-gold" />
        <p className="mt-5 text-gray-600">Pay after your service, in cash or M-Pesa.</p>
      </section>

      {/* Price menu, loaded from the backend */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        {loading && <p className="text-center text-gray-500">Loading services...</p>}
        {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}

        <ul>
          {services.map((s) => (
            <li
              key={s.id}
              className="flex items-start justify-between gap-6 border-b border-pink-200 py-6 first:border-t"
            >
              <div>
                <h2 className="font-display text-xl text-ink md:text-2xl">{s.name}</h2>
                <p className="mt-1 text-gray-600">{s.description}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                  About {formatDuration(s.duration_min)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-2xl text-pink-600 md:text-3xl">{formatPrice(s.price)}</p>
                <Link
                  to={`/book?service=${s.id}`}
                  className="group mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-pink-700"
                >
                  Book
                  <span aria-hidden="true" className="transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Design add-ons */}
      <section className="bg-pink-600">
        <div className="mx-auto grid max-w-5xl md:grid-cols-2">
          <div className="px-6 py-14 md:px-12 md:py-16">
            <p className="text-xs uppercase tracking-[0.25em] text-pink-200">Make it yours</p>
            <h2 className="mt-4 font-display text-3xl uppercase tracking-wide text-cream">
              Nail design add-ons
            </h2>
            <ul className="mt-8 divide-y divide-pink-400/50 border-y border-pink-400/50">
              {addOns.map((a) => (
                <li key={a.name} className="flex justify-between gap-4 py-4 text-cream">
                  <span className="font-display text-lg">{a.name}</span>
                  <span className="text-pink-100">{a.price}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-pink-100">
              Tell her which designs you want in the notes when you book.
            </p>
            <Link
              to="/book"
              className="mt-8 inline-block bg-cream px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-pink-600 hover:bg-white"
            >
              Book now
            </Link>
          </div>

          <img
            src="/gallery/cherry-french-tips.jpg"
            alt="Almond nails with soft yellow tips and hand-painted cherries"
            className="h-72 w-full object-cover md:h-full"
          />
        </div>
      </section>
    </div>
  )
}