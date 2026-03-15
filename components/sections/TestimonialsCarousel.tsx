'use client'

import { useRef, useEffect } from 'react'

interface Review {
  id: string
  author_name: string
  author_location?: string
  text: string
  rating?: number
}

const FALLBACK: Review[] = [
  { id: '1', author_name: 'Frédérique', author_location: 'Bouc-Bel-Air', text: "Logement fidèle à la description ; propre, bien équipé. Notre hôte est réactive et cordiale ; je recommande sans hésiter" },
  { id: '2', author_name: 'Mohamed',    text: "Logement très agréable et très propre. C'est la 2ème fois que nous y passons et sûrement pas la dernière. À très vite" },
  { id: '3', author_name: 'Mathilda',   author_location: 'Caen', text: "Très bon logement, la literie est très agréable. Notre hôte est très arrangeante, je recommande fortement" },
  { id: '4', author_name: 'Matthieu',   author_location: 'Saint-Germain-en-Laye', text: "Très bon séjour à Caen. Studio très calme, ambiance cocooning. Les instructions d'arrivée étaient très claires" },
  { id: '5', author_name: 'Yvonne',     author_location: 'Montreuil', text: "Le logement correspond parfaitement à la description. Notre hôte est très réactive et nous a permis de rester plus longtemps. Je recommande !" },
  { id: '6', author_name: 'Alexandra',  text: "Super séjour ! Logement confortable, conforme à l'annonce. Notre hôte disponible et réactive du début à la fin. Je recommande sans hésiter !" },
  { id: '7', author_name: 'Kelly',      text: "Si vous allez à Caen, n'hésitez pas à séjourner ici. Spacieux et magnifique, comme sur les photos. Réponses claires et avec beaucoup de gentillesse" },
  { id: '8', author_name: 'Idrissa', author_location: 'Toulouse', text: "Logement somptueux et confortable" },
  { id: '9', author_name: 'Bernard', author_location: 'Saint-Palais', text: "Logement très propre, central avec vue sur les quais et silencieux" },
]

function Card({ name, location, text }: { name: string; location?: string; text: string }) {
  return (
    <div
      className="flex-none w-[300px] min-h-[220px] rounded-[20px] p-7 border flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ background: '#fff2e0', borderColor: '#e8d8c0' }}
    >
      {/* Guillemet décoratif */}
      <span
        className="absolute top-[-10px] right-[18px] text-[200px] leading-none pointer-events-none select-none"
        style={{ color: '#0097b2', opacity: 0.09, fontFamily: 'Georgia, serif' }}
        aria-hidden
      >❝</span>

      {/* Stars */}
      <div className="text-[15px] mb-3" style={{ color: '#0097b2' }}>★★★★★</div>

      {/* Text */}
      <p className="text-sm leading-[1.7] italic flex-1 relative z-10" style={{ color: '#3a3a3a' }}>{text}</p>

      {/* Author */}
      <div className="flex items-center gap-2.5 pt-4 mt-auto border-t" style={{ borderColor: 'rgba(0,151,178,0.12)' }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: '#0097b2' }}
        >
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#00243f' }}>{name}</p>
          {location && <p className="text-xs" style={{ color: '#5a5a5a' }}>{location}</p>}
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsCarousel({ reviews }: { reviews?: Review[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  // Drag-to-scroll
  useEffect(() => {
    const track = trackRef.current?.parentElement
    if (!track) return

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      startX.current = e.pageX - track.offsetLeft
      scrollLeft.current = track.scrollLeft
      track.style.animationPlayState = 'paused'
    }
    const onMouseUp = () => { isDragging.current = false }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      e.preventDefault()
      const x = e.pageX - track.offsetLeft
      track.scrollLeft = scrollLeft.current - (x - startX.current) * 1.5
    }

    track.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    track.addEventListener('mousemove', onMouseMove)
    return () => {
      track.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      track.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  const data = (reviews && reviews.length > 0) ? reviews : FALLBACK
  const doubled = [...data, ...data]

  return (
    <div className="temo-track-outer">
      <div ref={trackRef} className="temo-track">
        {doubled.map((r, i) => (
          <Card key={i} name={r.author_name} location={r.author_location} text={r.text} />
        ))}
      </div>
    </div>
  )
}
