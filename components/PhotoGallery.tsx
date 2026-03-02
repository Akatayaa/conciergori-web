'use client'

import { useState } from 'react'

export default function PhotoGallery({ photos, title }: { photos: string[], title: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (!photos.length) return null

  return (
    <>
      {/* Photo principale */}
      <div className="rounded-3xl overflow-hidden h-72 md:h-[420px] mb-2 cursor-pointer"
           onClick={() => setLightbox(0)}>
        <img src={photos[0]} alt={title}
             className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
      </div>

      {/* Miniatures — toutes les photos sauf la 1ère */}
      {photos.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-2">
          {photos.slice(1).map((img, i) => (
            <div key={i} className="rounded-xl overflow-hidden h-20 md:h-24 cursor-pointer"
                 onClick={() => setLightbox(i + 1)}>
              <img src={img} alt={`${title} ${i + 2}`}
                   className="w-full h-full object-cover hover:scale-105 transition-transform" />
            </div>
          ))}
        </div>
      )}

      {photos.length > 1 && (
        <button onClick={() => setLightbox(0)}
          className="text-xs font-semibold underline underline-offset-2"
          style={{ color: '#0097b2' }}>
          Voir toutes les photos ({photos.length})
        </button>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
             onClick={() => setLightbox(null)}>
          {/* Fermer */}
          <button className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-light"
                  onClick={() => setLightbox(null)}>✕</button>

          {/* Précédent */}
          {lightbox > 0 && (
            <button className="absolute left-4 text-white/80 hover:text-white text-4xl font-light px-4 py-2"
                    onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1) }}>‹</button>
          )}

          {/* Image */}
          <div className="max-w-5xl max-h-[85vh] mx-16" onClick={e => e.stopPropagation()}>
            <img src={photos[lightbox]} alt={`${title} ${lightbox + 1}`}
                 className="max-w-full max-h-[80vh] object-contain rounded-xl" />
            <p className="text-white/50 text-sm text-center mt-3">
              {lightbox + 1} / {photos.length}
            </p>
          </div>

          {/* Suivant */}
          {lightbox < photos.length - 1 && (
            <button className="absolute right-4 text-white/80 hover:text-white text-4xl font-light px-4 py-2"
                    onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1) }}>›</button>
          )}
        </div>
      )}
    </>
  )
}
