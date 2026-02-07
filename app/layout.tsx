import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Construction Project Control',
  description: 'Full-stack construction project management and control system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
