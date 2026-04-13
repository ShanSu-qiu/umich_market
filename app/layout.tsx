import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Header } from '@/components/wolverine/header'
import { Footer } from '@/components/wolverine/footer'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'WolverineMarket - Campus Marketplace for UMich Students',
  description: 'Buy and sell with verified University of Michigan students. Furniture, textbooks, electronics and more. Pre-book items before move-in day.',
  keywords: ['UMich', 'University of Michigan', 'marketplace', 'student', 'buy', 'sell', 'furniture', 'textbooks'],
}

export const viewport: Viewport = {
  themeColor: '#00274C',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
