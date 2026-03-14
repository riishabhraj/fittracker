"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"

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

// ─── Forgot password form (email entry) ───────────────────────────────────────

function ForgotForm() {
  const [email, setEmail]     = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address."); return
    }
    setLoading(true)
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      // Always show success to prevent email enumeration
      setSent(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <span className="text-2xl">📬</span>
        </div>
        <p className="text-sm font-medium text-foreground">Check your email</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          If an account exists for <span className="text-foreground font-medium">{email}</span>, we've sent a password reset link. It expires in 1 hour.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">
          {error}
        </p>
      )}
      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        autoComplete="email"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl font-semibold text-sm active:scale-95 transition-all disabled:opacity-60"
        style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
      >
        {loading ? "Sending…" : "Send Reset Link"}
      </button>
    </form>
  )
}

// ─── Reset password form (new password entry) ─────────────────────────────────

function ResetForm({ token }: { token: string }) {
  const router = useRouter()
  const [password, setPassword]   = useState("")
  const [confirm, setConfirm]     = useState("")
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError("Password must be at least 8 characters."); return }
    if (password !== confirm)  { setError("Passwords do not match."); return }

    setLoading(true)
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return }
      setDone(true)
      setTimeout(() => router.push("/sign-in"), 2500)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <span className="text-2xl">✅</span>
        </div>
        <p className="text-sm font-medium text-foreground">Password updated!</p>
        <p className="text-xs text-muted-foreground">Redirecting you to sign in…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">
          {error}
        </p>
      )}
      <InputField
        label="New Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="Min. 8 characters"
        autoComplete="new-password"
      />
      <InputField
        label="Confirm Password"
        type="password"
        value={confirm}
        onChange={setConfirm}
        placeholder="Repeat password"
        autoComplete="new-password"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl font-semibold text-sm active:scale-95 transition-all disabled:opacity-60"
        style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
      >
        {loading ? "Saving…" : "Set New Password"}
      </button>
    </form>
  )
}

// ─── Page shell ───────────────────────────────────────────────────────────────

function ResetPasswordContent() {
  const params = useSearchParams()
  const token  = params.get("token")

  return (
    <div
      className="h-screen overflow-hidden bg-background flex flex-col items-center justify-center px-6"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex flex-col items-center mb-6">
        <Image src="/fittracker-app-icon.png" alt="FitTracker" width={56} height={56} className="rounded-2xl mb-3 shadow-lg" />
        <h1 className="text-2xl font-bold text-foreground">FitTracker</h1>
        <p className="text-muted-foreground text-sm mt-1 text-center">
          {token ? "Choose a new password" : "Forgot your password?"}
        </p>
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-4">
        {token ? <ResetForm token={token} /> : <ForgotForm />}
      </div>

      <a
        href="/sign-in"
        className="text-xs text-muted-foreground mt-4 hover:text-foreground transition-colors"
      >
        Back to sign in
      </a>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  )
}
