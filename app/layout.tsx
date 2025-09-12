import type React from "react"
import type { Metadata, Viewport } from "next"
import { Roboto } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ClientBottomNavigation } from "@/components/client-bottom-navigation"
import { Toaster } from "sonner"
import "./globals.css"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  title: "FitTracker - Workout Logger",
  description: "Beautiful workout tracking and logging app with offline support",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitTracker",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "FitTracker",
    "application-name": "FitTracker",
    "msapplication-TileColor": "#ea580c",
    "msapplication-config": "/browserconfig.xml",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ea580c",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={roboto.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --font-roboto: ${roboto.style.fontFamily};
              }
              html {
                font-family: var(--font-roboto), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
              }
              body {
                font-family: inherit !important;
              }
              * {
                font-family: inherit;
              }
            `,
          }}
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/fittracker-app-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/fittracker-favicon.png" />
        <link rel="mask-icon" href="/fittracker-mask-icon.png" color="#ea580c" />
        <meta name="msapplication-TileColor" content="#ea580c" />
        <meta name="theme-color" content="#ea580c" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="pb-16">
            {children}
          </div>
          <ClientBottomNavigation />
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
