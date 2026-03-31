"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

function VerifyEmailContent() {
  const router = useRouter()
  const params = useSearchParams()
  const email  = params.get("email") ?? ""

  const [otp, setOtp]                   = useState("")
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [success, setSuccess]           = useState(false)
  const [cooldown, setCooldown]         = useState(0)
  const [resendLoading, setResendLoading] = useState(false)

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleVerify = async (value?: string) => {
    const code = value ?? otp
    if (code.length < 6 || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Verification failed.")
        setOtp("")
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/sign-in"), 2000)
    } catch {
      setError("Something went wrong. Please try again.")
      setOtp("")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return
    setResendLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.status === 429) {
        setCooldown(data.secondsLeft ?? 60)
      } else {
        setOtp("")
        setCooldown(60)
      }
    } catch {
      setError("Could not send a new code. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  if (!email) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <p className="text-muted-foreground text-sm mb-4">Invalid verification link.</p>
        <Link href="/sign-in" className="text-sm font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div
      className="h-screen overflow-hidden bg-background flex flex-col items-center justify-center px-6"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <Image src="/fittracker-app-icon.png" alt="FitTracker" width={56} height={56} className="rounded-2xl mb-3 shadow-lg" />
        <h1 className="text-2xl font-bold text-foreground">Verify your email</h1>
        <p className="text-muted-foreground text-sm mt-1 text-center max-w-xs">
          We sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>
        </p>
      </div>

      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-card border border-border p-6">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="h-12 w-12" style={{ color: "hsl(80 100% 50%)" }} />
              <p className="text-base font-semibold text-foreground">Email verified!</p>
              <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
            </div>
          ) : (
            <div className="space-y-5">
              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-center">
                  {error}
                </p>
              )}

              {/* OTP Input */}
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  onComplete={handleVerify}
                  disabled={loading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-12 w-11 text-lg font-bold" />
                    <InputOTPSlot index={1} className="h-12 w-11 text-lg font-bold" />
                    <InputOTPSlot index={2} className="h-12 w-11 text-lg font-bold" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} className="h-12 w-11 text-lg font-bold" />
                    <InputOTPSlot index={4} className="h-12 w-11 text-lg font-bold" />
                    <InputOTPSlot index={5} className="h-12 w-11 text-lg font-bold" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {/* Verify button */}
              <button
                type="button"
                onClick={() => handleVerify()}
                disabled={otp.length < 6 || loading}
                className="w-full h-11 rounded-xl font-semibold text-sm active:scale-95 transition-all disabled:opacity-50"
                style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[hsl(0_0%_6%)] border-t-transparent rounded-full animate-spin" />
                    Verifying…
                  </span>
                ) : "Verify Email"}
              </button>

              {/* Resend */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Didn't receive a code?</p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resendLoading}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading
                    ? "Sending…"
                    : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend code"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-4">
          <Link href="/sign-in" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
