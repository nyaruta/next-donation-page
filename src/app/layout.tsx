import './globals.css'
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Donation Project',
  description: 'Support our cause with custom donations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
