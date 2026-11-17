// cspell:ignore Atoti
import { Link } from 'react-router-dom'
import { BUSINESS } from '../config'

const links = [
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/book', label: 'Book' },
]

const labelClass = 'text-xs font-medium uppercase tracking-[0.2em] text-gray-600 hover:text-pink-600'

export default function Footer() {
  return (
    <footer className="border-t border-pink-200 bg-pink-50">
      <div className="mx-auto max-w-5xl px-4 py-14 text-center">
        <div className="flex items-baseline justify-center gap-2">
          <span className="font-display text-xl font-bold uppercase tracking-[0.18em] text-ink">Nailed</span>
          <span className="font-script text-3xl text-pink-600">by Atoti</span>
        </div>
        <p className="mt-3 font-display text-lg italic text-mauve">{BUSINESS.tagline}</p>
        <div className="mx-auto mt-6 h-px w-16 bg-gold" />

        <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={labelClass}>
              {l.label}
            </Link>
          ))}
        </div>

        <p className="mt-8 text-sm text-gray-600">Monday to Sunday · By appointment only</p>

        <div className="mt-4 flex justify-center gap-8">
          <a
            href={`https://wa.me/${BUSINESS.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className={labelClass}
          >
            WhatsApp
          </a>
          <a href={BUSINESS.tiktok} target="_blank" rel="noreferrer" className={labelClass}>
            TikTok
          </a>
        </div>

        <p className="mt-10 text-xs text-gray-500">
          © {new Date().getFullYear()} {BUSINESS.name}. Pay after your service.
        </p>
      </div>
    </footer>
  )
}