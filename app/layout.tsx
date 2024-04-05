import type {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Simulation Demo',
  description: 'Demo of a live-running agent-based model.',
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
