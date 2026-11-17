import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, PHOTOS } from '../galleryData'
import VideoReel from '../components/VideoReel'

const PLACEHOLDER_ICONS = {
  'Tips & Gel': '💅',
  'Builder Gel': '✨',
  Designs: '🌸',
  Pedicure: '🦶',
}

export default function Gallery() {
  const [category, setCategory] = useState('All')
  const [open, setOpen] = useState(null) // the photo shown full-screen, or null

  const shown = category === 'All' ? PHOTOS : PHOTOS.filter((p) => p.category === category)

  // Close the full-screen photo when Escape is pressed.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div>
      {/* Page heading */}
      <section className="mx-auto max-w-3xl px-4 pt-14 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gold" />
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-mauve">Our work</p>
          <span className="h-px w-8 bg-gold" />
        </div>
        <h1 className="mt-5 font-display text-4xl uppercase tracking-wide text-ink md:text-5xl">Gallery</h1>
        <div className="mx-auto mt-5 h-px w-16 bg-gold" />
        <p className="mt-5 text-gray-600">Tap a photo to see it bigger.</p>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        {/* Category filter, shown as underlined text tabs */}
        <div className="flex justify-center gap-8 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`whitespace-nowrap border-b pb-1 text-xs font-medium uppercase tracking-[0.2em] ${
                category === c ? 'border-gold text-ink' : 'border-transparent text-gray-500 hover:text-ink'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Photo grid */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
          {shown.map((p) =>
            p.src ? (
              <button
                key={p.id}
                onClick={() => setOpen(p)}
                className="overflow-hidden"
                aria-label={`View photo: ${p.alt}`}
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition duration-500 hover:scale-105"
                />
              </button>
            ) : (
              <div
                key={p.id}
                className="flex aspect-[4/5] flex-col items-center justify-center bg-pink-100 text-pink-400"
              >
                <span className="text-4xl">{PLACEHOLDER_ICONS[p.category]}</span>
                <span className="mt-1 text-xs">{p.category}</span>
              </div>
            ),
          )}
        </div>
      </section>

      
      <VideoReel />
      {/* Closing block */}
      <section className="bg-pink-600">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="font-display text-3xl uppercase tracking-wide text-cream">Love a look?</h2>
          <p className="mx-auto mt-4 max-w-md text-pink-100">We can recreate it for you.</p>
          <Link
            to="/book"
            className="mt-8 inline-block bg-cream px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-pink-600 hover:bg-white"
          >
            Book now
          </Link>
        </div>
      </section>

      {/* Full-screen viewer */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(null)}
        >
          <button
            className="absolute right-4 top-4 text-3xl text-white"
            onClick={() => setOpen(null)}
            aria-label="Close photo"
          >
            ✕
          </button>
          <img
            src={open.src}
            alt={open.alt}
            className="max-h-[85vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}