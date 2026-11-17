// cspell:ignore Atoti
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
]

// Every link has a bottom border. It is transparent unless the link is the current page,
// so the text never jumps when the gold underline appears.
const linkClass = ({ isActive }) =>
  `border-b pb-1 text-xs font-medium uppercase tracking-[0.2em] ${
    isActive ? 'border-gold text-ink' : 'border-transparent text-gray-600 hover:text-ink'
  }`

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-pink-200 bg-cream/95 backdrop-blur">
      <nav className="mx-auto grid max-w-5xl grid-cols-[1fr_auto_1fr] items-center px-4 py-4">
        {/* Left: links on desktop, menu button on phones */}
        <div>
          <div className="hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </div>
          <button
            className="text-2xl text-ink md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

        {/* Centre: the brand name, like her logo */}
        <Link to="/" onClick={() => setOpen(false)} className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="font-display text-lg font-bold uppercase tracking-[0.18em] text-ink md:text-xl">
            Nailed
          </span>
          <span className="font-script text-2xl text-pink-600 md:text-3xl">by Atoti</span>
        </Link>

        {/* Right: the main action */}
        <div className="flex justify-end">
          <Link
            to="/book"
            className="bg-pink-600 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-pink-700 md:px-6 md:text-xs"
          >
            Book
          </Link>
        </div>
      </nav>

      {/* Phone menu */}
      {open && (
        <div className="flex flex-col items-center gap-5 border-t border-pink-200 bg-cream px-4 py-6 md:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}