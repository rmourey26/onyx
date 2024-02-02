import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { ReactQueryClientProvider } from '@/components/react-query-client-provider'
import { Toaster } from "@/components/toaster"
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Onyx',
  description: 'Occams razor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ReactQueryClientProvider>
    <html lang="en">
      <body className={inter.className}>
<ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}<Toaster/>
          </ThemeProvider>
        


</body>
    </html>
    </ReactQueryClientProvider>
  )
}
