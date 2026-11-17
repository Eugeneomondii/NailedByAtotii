import { BUSINESS } from '../config'

export default function WhatsAppButton() {
  const message = encodeURIComponent('Hi! I would like to ask about a nail appointment.')
  return (
    <a
      href={`https://wa.me/${BUSINESS.whatsapp}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-lg hover:bg-green-600"
    >
      💬
    </a>
  )
}