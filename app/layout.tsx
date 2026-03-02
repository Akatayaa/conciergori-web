import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Conciergori — Plateforme de conciergerie Airbnb',
  description: 'Gérez vos locations courte durée à Caen et partout en France.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={geist.className}>{children}</body>
    </html>
  )
}
