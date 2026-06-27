import type { Metadata } from 'next'
import '../styles/style.css'

export const metadata: Metadata = {
  title: 'Angkringan Ajai',
  description: 'Angkringan Ajai - Pesan makanan & minuman khas angkringan secara online',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
