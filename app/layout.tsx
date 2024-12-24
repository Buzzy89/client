import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Mystical Object Emporium',
  description: 'A website for mystical object creation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-b from-dark-100 to-dark-300">
            <Navbar />
            <main className="container mx-auto px-4 py-8 font-body">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

