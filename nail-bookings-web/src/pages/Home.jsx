// cspell:ignore Atoti
import { Link } from 'react-router-dom'
import { BUSINESS } from '../config'
import VideoReel from '../components/VideoReel'

const trust = [
  { title: 'Quality products', text: 'Products chosen to look beautiful and hold up.' },
  { title: 'Long lasting', text: 'Nails built to stay put and stay pretty.' },
  { title: 'Trendy & stylish', text: 'From classic tips to 3D designs, in looks you will love.' },
  { title: 'Clean & hygienic', text: 'A clean, careful routine at every appointment.' },
]

const steps = [
  { title: 'Pick a time', text: 'Choose your service, date and a time that suits you.' },
  { title: 'Get confirmed', text: 'We confirm your booking and send you the details.' },
  { title: 'Enjoy your nails', text: 'Pay only after your service, in cash or M-Pesa.' },
]

export default function Home() {
  return (
    <div>
      {/* 1. Hero */}
      <section className="bg-pink-50">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-mauve">{BUSINESS.values}</p>
            </div>

            <h1 className="mt-6 font-display text-6xl font-bold leading-none text-ink md:text-7xl">
              Nailed
              <span className="block font-script text-5xl font-normal text-pink-600 md:text-6xl">
                by Atoti
              </span>
            </h1>
            <p className="mt-6 font-display text-xl italic text-mauve">{BUSINESS.tagline}</p>
            <p className="mt-3 max-w-md text-lg text-gray-600">
              Gel, builder gel, nail art and pedicures. Book online in under a minute.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-8">
              <Link
                to="/book"
                className="bg-pink-600 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-pink-700"
              >
                Book now
              </Link>
              <Link
                to="/services"
                className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-pink-700"
              >
                View services
                <span aria-hidden="true" className="transition group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Photo with a thin gold frame sitting slightly behind it */}
          <div className="relative">
            <div className="absolute -bottom-3 -right-3 h-full w-full border border-gold" />
            <img
              src="/gallery/cherry-french-tips.jpg"
              alt="Stiletto nails with purple zebra tips, 3D flowers and white bows"
              className="relative aspect-4/5 w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 2. Trust strip */}
      <section className="border-y border-pink-200">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-y-8 px-4 py-10 md:grid-cols-4 md:divide-x md:divide-pink-200">
          {trust.map((t) => (
            <div key={t.title} className="px-4 text-center">
              <span className="mx-auto mb-3 block h-px w-6 bg-gold" />
              <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-ink">{t.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{t.text}</p>
            </div>
          ))}
        </div>
      </section>
      <VideoReel />
      {/* 3. How it works */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="text-center font-display text-3xl uppercase tracking-wide text-ink md:text-4xl">
          How it works
        </h2>
        <div className="mx-auto mt-4 h-px w-16 bg-gold" />
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="text-center">
              <p className="font-display text-6xl text-gold">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-3 font-display text-xl text-ink">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Closing block */}
      <section className="bg-pink-600">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-pink-200">Pay after your service</p>
          <h2 className="mt-4 font-display text-3xl uppercase tracking-wide text-cream md:text-4xl">
            Ready for fresh nails?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-pink-100">
            Nothing to pay to book. Settle in cash or M-Pesa once you love your nails.
          </p>
          <Link
            to="/book"
            className="mt-8 inline-block bg-cream px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-pink-600 hover:bg-white"
          >
            Book your appointment
          </Link>
        </div>
      </section>
    </div>
  )
}