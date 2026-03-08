import type React from "react"
import type { Metadata, Viewport } from "next"
import { Space_Grotesk } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ClientBottomNavigation, BottomNavPadding } from "@/components/client-bottom-navigation"
import { SessionCleanup } from "@/components/session-cleanup"
import { SessionProvider } from "next-auth/react"
import { SessionGuard } from "@/components/session-guard"
import { Toaster } from "sonner"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
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
    "msapplication-TileColor": "#0f0f0f",
    "msapplication-config": "/browserconfig.xml",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f0f0f",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --font-space-grotesk: ${spaceGrotesk.style.fontFamily};
              }
              html {
                font-family: var(--font-space-grotesk), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
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
        <link rel="mask-icon" href="/fittracker-mask-icon.png" color="#aaff00" />
        <meta name="msapplication-TileColor" content="#0f0f0f" />
        <meta name="theme-color" content="#0f0f0f" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  // Clear all old caches from previous SW versions
                  if (window.caches) {
                    caches.keys().then(function(keys) {
                      keys.forEach(function(key) {
                        if (!key.includes('v3')) caches.delete(key);
                      });
                    });
                  }
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      // Force the new SW to activate immediately
                      if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    })
                    .catch(function(err) {
                      console.log('SW registration failed: ', err);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionCleanup />
          <SessionGuard />
          <BottomNavPadding>
            {children}
          </BottomNavPadding>
          <ClientBottomNavigation />
          <Toaster richColors position="top-center" />
        </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
