"use client"

import { signIn } from "next-auth/react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { Capacitor } from "@capacitor/core"

const OAUTH_ERRORS: Record<string, string> = {
  OAuthAccountNotLinked: "This email is linked to a different sign-in method.",
  OAuthCallbackError:    "Google sign-in failed. Please try again.",
  OAuthSignin:           "Could not start Google sign-in. Please try again.",
  OAuthAccount:          "This email is registered with Google. Please use the Google sign-in button below.",
  CredentialsSignin:     "Invalid email or password.",
  Default:               "Something went wrong. Please try again.",
}

function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      if (Capacitor.isNativePlatform()) {
        // Native path: use Capacitor plugin to avoid WebView OAuth block
        const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth")
        await GoogleAuth.initialize({
          clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
          scopes: ["profile", "email"],
          grantOfflineAccess: true,
        })
        const googleUser = await GoogleAuth.signIn()
        const idToken = googleUser.authentication.idToken

        // next-auth/react's signIn() skips credentials providers from /api/auth/providers,
        // falling back to OAuth GET path → UnknownAction. POST directly instead.
        const csrfRes = await fetch("/api/auth/csrf")
        const { csrfToken } = await csrfRes.json()

        const callbackRes = await fetch("/api/auth/callback/google-native", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ csrfToken, idToken, callbackUrl: "/", json: "true" }),
        })
        const callbackData = await callbackRes.json().catch(() => ({}))
        if (callbackData?.url) {
          window.location.href = callbackData.url
        } else {
          setError("Google sign-in failed. Please try again.")
          setLoading(false)
        }
      } else {
        // Web path: standard OAuth redirect
        window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent("/")}`
      }
    } catch (err: unknown) {
      // User cancelled or plugin error — don't show error for cancellation
      const msg = err instanceof Error ? err.message : ""
      if (!msg.includes("cancel") && !msg.includes("Cancel") && !msg.includes("dismissed")) {
        setError("Google sign-in failed. Please try again.")
      }
      setLoading(false)
    }
  }

  return (
    <>
    {error && (
      <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">
        {error}
      </p>
    )}
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full h-11 rounded-xl font-medium text-sm flex items-center justify-center gap-3 border border-border bg-card hover:bg-muted/20 active:scale-95 transition-all text-foreground disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
      )}
      {loading ? "Redirecting…" : label}
    </button>
    </>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground">or</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

function InputField({
  label, type = "text", value, onChange, placeholder, autoComplete,
}: {
  label: string; type?: string; value: string
  onChange: (v: string) => void; placeholder?: string; autoComplete?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full h-9 px-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
      />
    </div>
  )
}

function SignInForm({ oauthError }: { oauthError: string | null }) {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address."); return
    }
    if (!password) {
      setError("Enter your password."); return
    }

    setLoading(true)
    const result = await signIn("credentials", { email, password, callbackUrl: "/", redirect: false })
    setLoading(false)

    if (result?.error) {
      const code = result.error
      setError(OAUTH_ERRORS[code] ?? "Invalid email or password.")
    } else if (result?.url) {
      window.location.href = result.url
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {(error || oauthError) && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-center">
          {error ?? oauthError}
        </p>
      )}
      <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
      <InputField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" />
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl font-semibold text-sm active:scale-95 transition-all disabled:opacity-60"
        style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
      <Divider />
      <GoogleButton />
    </form>
  )
}

function RegisterForm() {
  const [name, setName]                   = useState("")
  const [email, setEmail]                 = useState("")
  const [password, setPassword]           = useState("")
  const [confirm, setConfirm]             = useState("")
  const [error, setError]                 = useState<string | null>(null)
  const [loading, setLoading]             = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim())                                              { setError("Name is required."); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))               { setError("Enter a valid email address."); return }
    if (password.length < 8)                                      { setError("Password must be at least 8 characters."); return }
    if (password !== confirm)                                      { setError("Passwords do not match."); return }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Registration failed."); setLoading(false); return }

      // Auto sign-in after successful registration
      const result = await signIn("credentials", { email, password, callbackUrl: "/", redirect: false })
      if (result?.url) window.location.href = result.url
      else setError("Account created but sign-in failed. Please sign in manually.")
    } catch {
      setError("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">
          {error}
        </p>
      )}
      <InputField label="Name"             type="text"     value={name}     onChange={setName}     placeholder="Your name"          autoComplete="name" />
      <InputField label="Email"            type="email"    value={email}    onChange={setEmail}    placeholder="you@example.com"    autoComplete="email" />
      <InputField label="Password"         type="password" value={password} onChange={setPassword} placeholder="Min. 8 characters"  autoComplete="new-password" />
      <InputField label="Confirm Password" type="password" value={confirm}  onChange={setConfirm}  placeholder="Repeat password"    autoComplete="new-password" />
      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 rounded-xl font-semibold text-sm active:scale-95 transition-all disabled:opacity-60"
        style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
      >
        {loading ? "Creating account…" : "Create Account"}
      </button>
      <Divider />
      <GoogleButton label="Sign up with Google" />
    </form>
  )
}

function SignInContent() {
  const params     = useSearchParams()
  const errorCode  = params.get("error")
  const oauthError = errorCode ? (OAUTH_ERRORS[errorCode] ?? OAUTH_ERRORS.Default) : null

  const [mode, setMode] = useState<"signin" | "register">("signin")

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col items-center justify-center px-6" style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {/* Logo */}
      <div className="flex flex-col items-center mb-5">
        <Image src="/fittracker-app-icon.png" alt="FitTracker" width={56} height={56} className="rounded-2xl mb-3 shadow-lg" />
        <h1 className="text-2xl font-bold text-foreground">FitTracker</h1>
        <p className="text-muted-foreground text-sm mt-1 text-center">Track workouts, hit PRs, build habits.</p>
      </div>

      <div className="w-full max-w-sm">
        {/* Tab switcher */}
        <div className="flex rounded-xl bg-card border border-border p-1 mb-4">
          {(["signin", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="flex-1 h-9 rounded-lg text-sm font-medium transition-all"
              style={
                mode === m
                  ? { backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }
                  : { color: "hsl(0 0% 55%)" }
              }
            >
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-card border border-border p-4">
          {mode === "signin"
            ? <SignInForm oauthError={oauthError} />
            : <RegisterForm />
          }
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mt-4 text-center">
        Your data is private and stored securely.
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  )
}
