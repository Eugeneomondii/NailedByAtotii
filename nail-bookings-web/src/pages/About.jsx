// cspell:ignore Atoti
import { Link } from 'react-router-dom'
import { BUSINESS } from '../config'

// TODO: replace this with Atoti's own words once she writes her story,
// and swap the photo for one of her.
const STORY = `${BUSINESS.name} offers tips and gel, builder gel, nail art and pedicures, with one goal: nails that are clean, classy and durable.`

const faqs = [
  {
    q: 'How do I book?',
    a: 'Choose a service, date and time on the Book page. Your request stays pending until she confirms it.',
  },
  {
    q: 'When is she available?',
    a: 'Monday to Sunday, by appointment only.',
  },
  {
    q: 'How do I pay?',
    a: 'After your service, in cash or M-Pesa. You do not pay anything to book.',
  },
  {
    q: 'Can I change or cancel my booking?',
    a: 'Yes. Message her on WhatsApp as early as you can so she can free up the slot.',
  },
  {
    q: 'How do I ask for a specific design?',
    a: 'Describe it in the notes when you book. Design prices are on the Services page.',
  },
]

export default function About() {
  return (
    <div>
      {/* Story */}
      <section className="mx-auto grid max-w-5xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-20">
        <div className="relative">
          <div className="absolute -bottom-3 -left-3 h-full w-full border border-gold" />
          <img
            src="/gallery/polka-zebra-nails.jpg"
            alt="Square nails with burgundy polka dots and zebra accents"
            className="relative aspect-[4/5] w-full object-cover"
          />
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-mauve">Our story</p>
          </div>
          <h1 className="mt-5 font-display text-4xl uppercase tracking-wide text-ink md:text-5xl">
            About
            <span className="mt-1 block font-script text-5xl font-normal normal-case tracking-normal text-pink-600 md:text-6xl">
              Nailed by Atoti
            </span>
          </h1>
          <p className="mt-6 font-display text-xl italic text-mauve">{BUSINESS.values}</p>
          <p className="mt-4 text-lg text-gray-600">{STORY}</p>
          <Link
            to="/book"
            className="mt-8 inline-block bg-pink-600 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-pink-700"
          >
            Book now
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-pink-200 bg-pink-50">
        <div className="mx-auto max-w-2xl px-4 py-16">
          <h2 className="text-center font-display text-3xl uppercase tracking-wide text-ink">Good to know</h2>
          <div className="mx-auto mt-4 h-px w-16 bg-gold" />

          <div className="mt-10 border-t border-pink-200">
            {faqs.map((f) => (
              <details key={f.q} className="group border-b border-pink-200 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden="true" className="text-2xl text-gold transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>

          <p className="mt-10 text-center text-gray-600">
            Still have a question?{' '}
            <a
              href={`https://wa.me/${BUSINESS.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-pink-600 underline underline-offset-4"
            >
              Message her on WhatsApp
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}