import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { clearToken } from '../../auth'
import { BUSINESS } from '../../config'
import { formatPrice, formatTime } from '../../format'

// The tabs along the top. Each tab shows bookings with these statuses.
const TABS = [
  { key: 'pending', label: 'Pending', statuses: ['pending'] },
  { key: 'confirmed', label: 'Confirmed', statuses: ['confirmed'] },
  { key: 'completed', label: 'Completed', statuses: ['completed'] },
  { key: 'other', label: 'Cancelled', statuses: ['declined', 'cancelled', 'no_show'] },
]

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  declined: 'bg-gray-200 text-gray-700',
  cancelled: 'bg-gray-200 text-gray-700',
  no_show: 'bg-red-100 text-red-700',
}

function statusLabel(status) {
  if (status === 'no_show') return 'No-show'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00`).toLocaleDateString('en-KE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const smallButton = 'rounded-full px-4 py-1.5 text-sm font-semibold disabled:opacity-50'

// One booking, with its action buttons
function BookingCard({ booking, onUpdated }) {
  const [panel, setPanel] = useState('') // '', 'complete' or 'noshow'
  const [method, setMethod] = useState('cash')
  const [amount, setAmount] = useState(String(booking.service.price))
  const [blocklist, setBlocklist] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Sends the new status to the backend, then tells the dashboard to update this booking
  async function changeStatus(status, extra = {}) {
    setBusy(true)
    setError('')
    try {
      const updated = await api(`/api/admin/bookings/${booking.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, ...extra }),
      })
      onUpdated(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function askThenChange(message, status) {
    if (window.confirm(message)) changeStatus(status)
  }

  function submitComplete(e) {
    e.preventDefault()
    changeStatus('completed', {
      payment_method: method,
      amount_paid: Number.parseInt(amount, 10),
    })
  }

  function submitNoShow(e) {
    e.preventDefault()
    changeStatus('no_show', { blocklist })
  }

  const waNumber = booking.phone.replace('+', '')

  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-gray-900">{booking.client_name}</p>
          <p className="text-gray-700">
            {booking.service.name} · {formatPrice(booking.service.price)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[booking.status]}`}>
          {statusLabel(booking.status)}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-sm text-gray-700">
        <p>
          📅 <span className="font-semibold">{formatDate(booking.date)}</span> at {formatTime(booking.time)}
        </p>
        <p>
          📍 {booking.area}, {booking.address}
        </p>
        {booking.notes && <p>📝 {booking.notes}</p>}
        {booking.status === 'completed' && (
          <p className="font-semibold text-green-700">
            💰 Paid {formatPrice(booking.amount_paid)} by {booking.payment_method === 'mpesa' ? 'M-Pesa' : 'cash'}
          </p>
        )}
      </div>

      {/* Contact the client */}
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <a href={`tel:${booking.phone}`} className="rounded-full border border-gray-300 px-3 py-1 hover:bg-gray-50">
          📞 {booking.phone}
        </a>
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-green-300 px-3 py-1 text-green-700 hover:bg-green-50"
        >
          WhatsApp
        </a>
      </div>

      {/* Actions depend on the booking's current status */}
      {booking.status === 'pending' && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            disabled={busy}
            onClick={() => changeStatus('confirmed')}
            className={`${smallButton} bg-green-600 text-white hover:bg-green-700`}
          >
            Confirm
          </button>
          <button
            disabled={busy}
            onClick={() => askThenChange(`Decline ${booking.client_name}'s booking?`, 'declined')}
            className={`${smallButton} border border-gray-300 text-gray-700 hover:bg-gray-50`}
          >
            Decline
          </button>
        </div>
      )}

      {booking.status === 'confirmed' && panel === '' && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setPanel('complete')}
            className={`${smallButton} bg-pink-600 text-white hover:bg-pink-700`}
          >
            Mark completed
          </button>
          <button
            onClick={() => setPanel('noshow')}
            className={`${smallButton} border border-red-300 text-red-700 hover:bg-red-50`}
          >
            No-show
          </button>
          <button
            disabled={busy}
            onClick={() => askThenChange(`Cancel ${booking.client_name}'s booking?`, 'cancelled')}
            className={`${smallButton} border border-gray-300 text-gray-700 hover:bg-gray-50`}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Payment details, filled in after the service */}
      {panel === 'complete' && (
        <form onSubmit={submitComplete} className="mt-4 space-y-3 rounded-xl bg-pink-50 p-4">
          <p className="font-semibold text-gray-900">How did the client pay?</p>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked={method === 'cash'} onChange={() => setMethod('cash')} />
              Cash
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={method === 'mpesa'} onChange={() => setMethod('mpesa')} />
              M-Pesa
            </label>
          </div>
          <div>
            <label className="text-sm text-gray-700">Amount paid (KSh)</label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className={`${smallButton} bg-pink-600 text-white hover:bg-pink-700`}>
              {busy ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setPanel('')}
              className={`${smallButton} border border-gray-300 text-gray-700`}
            >
              Back
            </button>
          </div>
        </form>
      )}

      {panel === 'noshow' && (
        <form onSubmit={submitNoShow} className="mt-4 space-y-3 rounded-xl bg-red-50 p-4">
          <p className="font-semibold text-gray-900">Mark as no-show?</p>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={blocklist} onChange={(e) => setBlocklist(e.target.checked)} />
            Also block this phone number from booking online
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className={`${smallButton} bg-red-600 text-white hover:bg-red-700`}>
              {busy ? 'Saving...' : 'Yes, no-show'}
            </button>
            <button
              type="button"
              onClick={() => setPanel('')}
              className={`${smallButton} border border-gray-300 text-gray-700`}
            >
              Back
            </button>
          </div>
        </form>
      )}

      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState(null) // null means "still loading"
  const [error, setError] = useState('')
  const [tab, setTab] = useState('pending')
  const [reload, setReload] = useState(0)

  // Load all bookings (again whenever "reload" changes)
  useEffect(() => {
    let ignore = false
    api('/api/admin/bookings')
      .then((data) => {
        if (!ignore) setBookings(data)
      })
      .catch((err) => {
        console.error('Bookings request failed:', err)
        if (!ignore) setError(err.message)
      })
    return () => {
      ignore = true
    }
  }, [reload])

  function logout() {
    clearToken()
    navigate('/admin/login')
  }

  // Swap the updated booking into the list without reloading everything
  function handleUpdated(updated) {
    setBookings((list) => list.map((b) => (b.id === updated.id ? updated : b)))
  }

  const currentTab = TABS.find((t) => t.key === tab)
  const countFor = (t) => (bookings ? bookings.filter((b) => t.statuses.includes(b.status)).length : 0)

  let visible = bookings ? bookings.filter((b) => currentTab.statuses.includes(b.status)) : []
  // Upcoming tabs show the soonest first. History tabs show the newest first.
  if (tab === 'completed' || tab === 'other') visible = [...visible].reverse()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-pink-600 sm:text-2xl">{BUSINESS.name} · Admin</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setReload((n) => n + 1)}
            className="rounded-full border border-pink-300 px-4 py-1.5 text-sm text-pink-700 hover:bg-pink-50"
          >
            Refresh
          </button>
          <button
            onClick={logout}
            className="rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
              tab === t.key ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
            }`}
          >
            {t.label} ({countFor(t)})
          </button>
        ))}
      </div>

      {bookings === null && !error && <p className="mt-8 text-gray-500">Loading bookings...</p>}
      {error && <p className="mt-8 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
      {bookings && visible.length === 0 && (
        <p className="mt-8 text-gray-500">No {currentTab.label.toLowerCase()} bookings.</p>
      )}

      <div className="mt-6 space-y-4">
        {visible.map((b) => (
          <BookingCard key={b.id} booking={b} onUpdated={handleUpdated} />
        ))}
      </div>
    </div>
  )
}