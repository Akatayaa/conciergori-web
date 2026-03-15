'use client'

import { useState } from 'react'

interface PropertyGalleryProps {
  photos: string[]
  title: string
}

export default function PropertyGallery({ photos, title }: PropertyGalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (!photos.length) return null

  const main = photos[0]
  const thumbs = photos.slice(1, 5) // max 4 petites

  return (
    <>
      {/* ── Grille galerie ── */}
      <div className="relative rounded-[16px] overflow-hidden">
        {photos.length === 1 ? (
          // Une seule photo : plein largeur
          <div
            className="h-[420px] cursor-pointer overflow-hidden"
            onClick={() => setLightbox(0)}
          >
            <img
              src={main}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          // Grille 1 grande + 4 petites
          <div className="grid grid-cols-[60%_40%] grid-rows-2 gap-2 h-[440px]">
            {/* Grande photo */}
            <div
              className="row-span-2 cursor-pointer overflow-hidden rounded-l-[16px]"
              onClick={() => setLightbox(0)}
            >
              <img
                src={main}
                alt={title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* 4 petites */}
            {[0, 1, 2, 3].map(i => {
              const photo = thumbs[i]
              const isLast = i === 3
              const hasMore = photos.length > 5

              return (
                <div
                  key={i}
                  className="relative cursor-pointer overflow-hidden"
                  style={{
                    borderTopRightRadius: i === 0 ? 16 : 0,
                    borderBottomRightRadius: i === 2 ? 16 : 0, // rows of 2
                  }}
                  onClick={() => setLightbox(photo ? i + 1 : 0)}
                >
                  {photo ? (
                    <>
                      <img
                        src={photo}
                        alt={`${title} ${i + 2}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      {/* Overlay "Voir toutes" sur la dernière vignette */}
                      {isLast && hasMore && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">+{photos.length - 5} photos</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full" style={{ background: '#e8d8c0' }} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Bouton "Voir toutes les photos" */}
        {photos.length > 1 && (
          <button
            onClick={() => setLightbox(0)}
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white transition-all hover:bg-gray-50"
            style={{ color: '#00243f', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
            Voir toutes les photos ({photos.length})
          </button>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2"
            onClick={() => setLightbox(null)}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          {/* Prev */}
          {lightbox > 0 && (
            <button
              className="absolute left-4 text-white/70 hover:text-white transition-colors p-3"
              onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1) }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
          )}

          {/* Image */}
          <div className="max-w-5xl max-h-[85vh] mx-20" onClick={e => e.stopPropagation()}>
            <img
              src={photos[lightbox]}
              alt={`${title} ${lightbox + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
            <p className="text-white/40 text-sm text-center mt-3">
              {lightbox + 1} / {photos.length}
            </p>
          </div>

          {/* Next */}
          {lightbox < photos.length - 1 && (
            <button
              className="absolute right-4 text-white/70 hover:text-white transition-colors p-3"
              onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1) }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          )}

          {/* Thumbnails strip */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto pb-1">
              {photos.map((p, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setLightbox(i) }}
                  className="w-14 h-10 flex-shrink-0 rounded-lg overflow-hidden transition-all"
                  style={{ opacity: i === lightbox ? 1 : 0.45, outline: i === lightbox ? '2px solid #0097b2' : 'none' }}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
