import { useEffect, useRef, useState } from 'react'

// To add a clip: copy the .mp4 and a poster .jpg into "public/videos", then add a line here.
const CLIPS = [
  {
    src: '/videos/black-tips-gold-charms.mp4',
    poster: '/videos/black-tips-gold-charms.jpg',
    caption: 'Black tips with gold charms',
  },
  {
    src: '/videos/pink-glitter-gel.mp4',
    poster: '/videos/pink-glitter-gel.jpg',
    caption: 'Soft pink with glitter',
  },
  {
    src: '/videos/purple-stiletto-bows.mp4',
    poster: '/videos/purple-stiletto-bows.jpg',
    caption: 'Purple stilettos with bows',
  },
]

function ReelVideo({ clip }) {
  const ref = useRef(null)
  // People who ask their device to reduce motion get a normal play button instead of autoplay
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  // Play the clip only while at least half of it is on screen, and pause it otherwise.
  // This is a proper effect: it connects React to a browser feature (IntersectionObserver).
  useEffect(() => {
    const video = ref.current
    if (!video || reduceMotion) return
    video.muted = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.5 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [reduceMotion])

  return (
    <figure>
      <video
        ref={ref}
        src={clip.src}
        poster={clip.poster}
        muted
        loop
        playsInline
        preload="none"
        controls={reduceMotion}
        className="aspect-[9/16] w-full bg-pink-100 object-cover"
      >
        Your browser can't play this video.
      </video>
      <figcaption className="mt-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-gray-600">
        {clip.caption}
      </figcaption>
    </figure>
  )
}

export default function VideoReel() {
  return (
    <section className="bg-pink-50">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-mauve">In motion</p>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h2 className="mt-5 font-display text-3xl uppercase tracking-wide text-ink md:text-4xl">
            Watch her work
          </h2>
          <div className="mx-auto mt-5 h-px w-16 bg-gold" />
        </div>

        {/* A swipeable row on phones, three columns on bigger screens */}
        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
          {CLIPS.map((clip) => (
            <div key={clip.src} className="w-[72%] shrink-0 snap-center md:w-auto">
              <ReelVideo clip={clip} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}