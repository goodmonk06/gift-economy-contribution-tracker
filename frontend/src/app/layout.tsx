import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gift Economy Tracker',
  description: 'Track and visualize gifts, favors, and contributions in your community',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-gift-primary text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <a href="/" className="text-2xl font-bold">
                  🎁 Gift Economy Tracker
                </a>
              </div>
              <div className="flex gap-4">
                <a href="/" className="hover:text-gift-accent transition">
                  Communities
                </a>
                <a href="/about" className="hover:text-gift-accent transition">
                  About
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">{children}</main>
        <footer className="bg-slate-800 text-white py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm">
              Gift Economy Tracker - Visualizing generosity and mutual aid
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
