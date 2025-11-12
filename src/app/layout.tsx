import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
// REMOVE IMPORTS: Header, ThemeProvider, Footer, ScrollToTop

const DMSans = DM_Sans({
  variable: '--font-DM-Sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Barcias Tech', // Set a default title
  description: 'Local Service Lead Generation Specialists.',
}

// The RootLayout must now only wrap the <html> tag and fonts/styles.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${DMSans.variable} antialiased dark:bg-darkmode`}>
          {children}
      </body>
    </html>
  )
}