export function formatPrice(amount) {
  return `KSh ${amount.toLocaleString()}`
}

export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours && mins) return `${hours} hr ${mins} min`
  if (hours) return `${hours} hr`
  return `${mins} min`
}

// "14:30" -> "2:30 PM"
export function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${suffix}`
}

// Today's date as YYYY-MM-DD in the visitor's own timezone
export function todayStr() {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}