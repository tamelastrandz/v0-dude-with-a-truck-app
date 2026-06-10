import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Oswald } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Dude With A Truck — Find a Dude With A Truck Near You',
  description:
    'Browse local truck owners across your metro for moving, hauling, pickups, and same-day delivery. Background-checked dudes with trucks in Atlanta and Houston.',
  generator: 'v0.app',
  icons: {
    icon: '/images/logo-badge.png',
    apple: '/images/logo-badge.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
