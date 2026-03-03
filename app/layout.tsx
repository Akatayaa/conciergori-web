import type { Metadata } from 'next'
import { Suez_One, Alkatra, Quicksand } from 'next/font/google'
import './globals.css'

const suezOne = Suez_One({ subsets: ['latin'], weight: '400', variable: '--font-suez' })
const alkatra = Alkatra({ subsets: ['latin'], variable: '--font-alkatra' })
const quicksand = Quicksand({ subsets: ['latin'], variable: '--font-quicksand' })

export const metadata: Metadata = {
  title: {
    default: "Concierg'ori — Locations courte durée à Caen",
    template: "%s | Concierg'ori",
  },
  description: "Réservez directement vos séjours à Caen et en Normandie. Appartements et maisons de qualité, sans frais Airbnb. Conciergerie locale et personnalisée.",
  keywords: ['location courte durée Caen', 'airbnb Caen', 'appartement Caen', 'conciergerie Caen', 'Normandie vacances'],
  authors: [{ name: "Concierg'ori" }],
  creator: "Concierg'ori",
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://conciergori-web.vercel.app',
    siteName: "Concierg'ori",
    title: "Concierg'ori — Locations courte durée à Caen",
    description: "Réservez directement vos séjours à Caen et en Normandie. Appartements et maisons de qualité, sans frais Airbnb.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: "Concierg'ori — Caen" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Concierg'ori — Locations à Caen",
    description: "Réservez directement, sans frais Airbnb. Conciergerie locale à Caen.",
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${suezOne.variable} ${alkatra.variable} ${quicksand.variable} font-[var(--font-quicksand)]`}>
        {children}
      </body>
    </html>
  )
}
