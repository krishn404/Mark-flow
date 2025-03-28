import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Markflow',
  description: 'AI-Powered README Generator',
  generator: 'krishn404',
  metadataBase: new URL('https://mark-flow.vercel.app'), // Replace with your actual domain
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mark-flow.vercel.app',
    siteName: 'Markflow',
    title: 'Markflow - AI README Generator',
    description: 'Create comprehensive, professional README files for your GitHub repositories with AI.',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Markflow - AI README Generator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Markflow - AI README Generator',
    description: 'Create comprehensive, professional README files for your GitHub repositories with AI.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
