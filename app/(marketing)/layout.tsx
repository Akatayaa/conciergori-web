import { Suez_One, Alkatra, Quicksand } from 'next/font/google'

const suezOne = Suez_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-suez',
  display: 'swap',
})

const alkatra = Alkatra({
  subsets: ['latin'],
  variable: '--font-alkatra',
  display: 'swap',
})

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
  display: 'swap',
})

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${suezOne.variable} ${alkatra.variable} ${quicksand.variable} font-[var(--font-quicksand)]`}>
      {children}
    </div>
  )
}
