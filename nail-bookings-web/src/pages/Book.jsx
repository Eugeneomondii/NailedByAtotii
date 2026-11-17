import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { BUSINESS } from '../config'
import { formatDuration, formatPrice, formatTime, todayStr } from '../format'

const inputClass =
  'w-full border border-pink-200 bg-white px-3 py-3 text-ink placeholder:text-gray-400 focus:border-pink-600 focus:outline-none'

const smallCaps = 'text-xs font-semibold uppercase tracking-[0.2em]'

export default function Book() {
  const [searchParams] = useSearchParams()

  const [services, setServices] = useState([])
  const [serviceId, setServiceId] = useState(searchParams.get('service') || '')
  const [date, setDate] = useState('')
  const [slotsResult, setSlotsResult] = useState({ key: '', slots: [] })
  const [time, setTime] = useState('')
  const [form, setForm] = useState({ client_name: '', phone: '', area: '', address: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(null)
  const [refresh, setRefresh] = useState(0)

  // Load the list of services once
  useEffect(() => {
    api('/api/services')
      .then(setServices)
      .catch((err) => {
        console.error('Services request failed:', err)
        setError("We couldn't load the services. Please refresh or message us on WhatsApp.")
      })
  }, [])

  // Describes the question we are asking the backend right now
  const slotsKey = serviceId && date ? `${serviceId}|${date}|${refresh}` : ''
  // Calculated values, so they don't need their own state
  const slotsLoading = slotsKey !== '' && slotsResult.key !== slotsKey
  const slots = slotsResult.key === slotsKey ? slotsResult.slots : []

  // Ask the backend which times are free for this service and date
  useEffect(() => {
    if (!slotsKey) return
    let ignore = false
    api(`/api/availability?date=${date}&service_id=${serviceId}`)
      .then((data) => {
        if (!ignore) setSlotsResult({ key: slotsKey, slots: data.slots })
      })
      .catch((err) => {
        console.error('Availability request failed:', err)
        if (!ignore) {
          setSlotsResult({ key: slotsKey, slots: [] })
          setError("We couldn't check available times. Please try again.")
        }
      })
    return () => {
      ignore = true
    }
  }, [slotsKey, date, serviceId])

  const selected = services.find((s) => String(s.id) === String(serviceId))

  function handleServiceChange(e) {
    setServiceId(e.target.value)
    setTime('')
  }

  function handleDateChange(e) {
    setDate(e.target.value)
    setTime('')
  }

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = await api('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ ...form, service_id: Number(serviceId), date, time }),
      })
      setConfirmed(data.booking)
    } catch (err) {
      setError(err.message)
      setTime('')
      setRefresh((n) => n + 1) // reload the slots in case someone just took this one
    } finally {
      setSubmitting(false)
    }
  }

  const ready =
    serviceId && date && time && form.client_name && form.phone && form.area && form.address

  // ---- Confirmation screen ----
  if (confirmed) {
    const niceDate = new Date(`${confirmed.date}T00:00`).toLocaleDateString('en-KE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gold" />
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-mauve">Request received</p>
          <span className="h-px w-8 bg-gold" />
        </div>
        <h1 className="mt-5 font-display text-4xl uppercase tracking-wide text-ink">
          Thank you, {confirmed.client_name}
        </h1>
        <p className="mt-3 text-gray-600">She'll confirm your booking shortly.</p>

        <div className="mt-8 border border-gold bg-white p-6 text-left">
          <p className="font-display text-xl text-ink">{confirmed.service.name}</p>
          <p className="mt-2 text-gray-700">
            {niceDate} at {formatTime(confirmed.time)}
          </p>
          <p className="text-gray-700">{confirmed.area}</p>
          <p className="mt-4 border-t border-pink-200 pt-4 text-sm text-gray-600">
            Total {formatPrice(confirmed.service.price)}. Pay after your service, in cash or mobile money.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
          <a
            href={`https://wa.me/${BUSINESS.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className={`${smallCaps} bg-pink-600 px-8 py-3.5 text-white hover:bg-pink-700`}
          >
            Message on WhatsApp
          </a>
          <Link to="/" className={`${smallCaps} group inline-flex items-center gap-2 text-pink-700`}>
            Back to home
            <span aria-hidden="true" className="transition group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    )
  }

  // ---- The form ----
  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gold" />
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-mauve">Online booking</p>
          <span className="h-px w-8 bg-gold" />
        </div>
        <h1 className="mt-5 font-display text-4xl uppercase tracking-wide text-ink md:text-5xl">
          Book an appointment
        </h1>
        <div className="mx-auto mt-5 h-px w-16 bg-gold" />
        <p className="mt-5 text-gray-600">Pay after your service, in cash or mobile money.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-12 space-y-10">
        {/* 1. Service */}
        <section>
          <h2 className="mb-3 flex items-baseline gap-3 font-display text-xl text-ink">
            <span className="text-gold">01</span> Choose a service
          </h2>
          <select value={serviceId} onChange={handleServiceChange} className={inputClass}>
            <option value="">Select a service...</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {formatPrice(s.price)}
              </option>
            ))}
          </select>
          {selected && (
            <p className="mt-2 text-sm text-gray-500">About {formatDuration(selected.duration_min)}</p>
          )}
        </section>

        {/* 2. Date and time */}
        <section>
          <h2 className="mb-3 flex items-baseline gap-3 font-display text-xl text-ink">
            <span className="text-gold">02</span> Pick a date and time
          </h2>
          <input
            type="date"
            min={todayStr()}
            value={date}
            onChange={handleDateChange}
            className={inputClass}
          />

          {!serviceId && <p className="mt-3 text-sm text-gray-500">Choose a service first.</p>}
          {slotsLoading && <p className="mt-3 text-sm text-gray-500">Checking available times...</p>}
          {serviceId && date && !slotsLoading && slots.length === 0 && (
            <p className="mt-3 text-sm text-amber-700">
              No times available on this day. Please try another date.
            </p>
          )}

          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTime(t)}
                className={`border px-2 py-2.5 text-sm ${
                  time === t
                    ? 'border-pink-600 bg-pink-600 text-white'
                    : 'border-pink-200 bg-white text-gray-700 hover:border-pink-600'
                }`}
              >
                {formatTime(t)}
              </button>
            ))}
          </div>
        </section>

        {/* 3. Details */}
        <section className="space-y-3">
          <h2 className="mb-3 flex items-baseline gap-3 font-display text-xl text-ink">
            <span className="text-gold">03</span> Your details
          </h2>
          <input name="client_name" value={form.client_name} onChange={updateField} placeholder="Your name" className={inputClass} />
          <input name="phone" type="tel" value={form.phone} onChange={updateField} placeholder="Phone, e.g. 0712 345 678" className={inputClass} />
          <input name="area" value={form.area} onChange={updateField} placeholder="Area, e.g. city center" className={inputClass} />
          <input name="address" value={form.address} onChange={updateField} placeholder="Address or landmark" className={inputClass} />
          <textarea
            name="notes"
            value={form.notes}
            onChange={updateField}
            rows={3}
            placeholder="Notes (optional): design ideas, how many nails with designs, etc."
            className={inputClass}
          />
        </section>

        {error && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={!ready || submitting}
          className={`${smallCaps} w-full bg-pink-600 py-4 text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-pink-300`}
        >
          {submitting ? 'Sending...' : 'Request booking'}
        </button>
      </form>
    </div>
  )
}