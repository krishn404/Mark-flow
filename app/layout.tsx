import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Markflow',
  description: 'Readme generator',
  generator: 'krishn404',
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
