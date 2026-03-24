'use client'

import { Card } from "@/components/ui/card"
import { BackButton } from "@/components/back-button"
import { Shield, Database, Eye, Lock, Mail, Calendar, CreditCard, Cloud } from "lucide-react"

export default function PrivacyPolicyPage() {
  const lastUpdated = "March 24, 2026"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="container mx-auto px-4 pt-4 pb-6">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">How we collect, use, and protect your data</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl pb-24">
        <div className="space-y-6">

          {/* Summary banner */}
          <Card className="p-6 border-primary/20" style={{ background: "hsl(80 100% 50% / 0.06)" }}>
            <div className="flex items-start gap-4">
              <Shield className="h-7 w-7 shrink-0 mt-0.5" style={{ color: "hsl(80 100% 50%)" }} />
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Your data, handled responsibly</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  FitTracker stores your fitness data securely in the cloud so it's available on every device.
                  We never sell your data, never use it for advertising, and you can export or delete it anytime.
                </p>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Last updated: {lastUpdated}
                </p>
              </div>
            </div>
          </Card>

          {/* Key facts grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Cloud, color: "#60a5fa", label: "Cloud-synced", sub: "Secure MongoDB storage" },
              { icon: Eye, color: "#4ade80", label: "No tracking", sub: "No ad networks" },
              { icon: Lock, color: "#a855f7", label: "Never sold", sub: "Your data stays yours" },
              { icon: Database, color: "#f97316", label: "Exportable", sub: "Download anytime" },
            ].map(({ icon: Icon, color, label, sub }) => (
              <Card key={label} className="p-4 text-center bg-card border-border">
                <Icon className="h-6 w-6 mx-auto mb-2" style={{ color }} />
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </Card>
            ))}
          </div>

          {/* Sections */}
          <div className="space-y-5">

            <Card className="p-6 bg-card border-border">
              <h2 className="text-base font-bold text-foreground mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1.5">Account information</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Name and email address (used for login and communication)</li>
                    <li>Password (stored as a one-way bcrypt hash — we cannot read it)</li>
                    <li>Google profile photo and name (if you sign in with Google)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1.5">Fitness data</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Workout logs: exercises, sets, reps, weights, duration, dates</li>
                    <li>Goals and progress tracking</li>
                    <li>Fitness profile: height, weight, age, experience level, equipment</li>
                    <li>Workout templates you create</li>
                    <li>Personal records and achievements</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1.5">Subscription & billing</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Subscription plan and status (free / Pro)</li>
                    <li>Payment provider subscription ID (Razorpay or Stripe) — we never store full card numbers</li>
                    <li>Billing cycle and renewal date</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-base font-bold text-foreground mb-4">2. How We Use Your Information</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>Authenticate you and keep your account secure</li>
                  <li>Sync your fitness data across devices</li>
                  <li>Calculate stats, streaks, PRs, and achievements</li>
                  <li>Generate AI-powered workout and insight recommendations</li>
                  <li>Manage your Pro subscription and process renewals</li>
                  <li>Send transactional emails (password reset, receipts) via Resend</li>
                  <li>Respond to support requests</li>
                </ul>
                <p className="font-medium text-foreground mt-3">
                  We do not use your fitness data for advertising, profiling, or sale to third parties.
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-base font-bold text-foreground mb-4">3. Third-Party Services</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  To operate FitTracker we work with trusted third-party providers for cloud storage,
                  authentication, payment processing, email delivery, and AI features.
                  Each provider operates under its own privacy policy and industry-standard data
                  protection practices.
                </p>
                <p>
                  Payment card data is handled entirely by our payment processors —
                  FitTracker never sees or stores your full card number.
                </p>
                <p>
                  We only share the minimum data necessary with each provider to perform their function,
                  and we do not permit them to use your data for their own marketing or advertising purposes.
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-base font-bold text-foreground mb-4">4. Data Storage & Security</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Your data is stored in MongoDB Atlas (cloud), protected by encryption at rest and in transit (TLS).
                  Passwords are hashed with bcrypt and never stored in plaintext.
                  Authentication tokens are short-lived JWTs.
                </p>
                <p>
                  Active workout sessions are temporarily stored in your browser's localStorage for performance
                  and are cleared once the session is saved to the server.
                </p>
                <p>
                  We take reasonable technical measures to protect your data, but no system is 100% immune to breach.
                  If a breach occurs that affects your personal data, we will notify you promptly.
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-base font-bold text-foreground mb-4">5. Your Rights & Controls</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li><span className="font-medium text-foreground">Export</span> — download all your workouts and goals as JSON from Settings → Export My Data</li>
                  <li><span className="font-medium text-foreground">Edit / delete</span> — modify or remove individual workouts, goals, and profile data at any time</li>
                  <li><span className="font-medium text-foreground">Delete account</span> — email us to permanently delete your account and all associated data</li>
                  <li><span className="font-medium text-foreground">Cancel subscription</span> — cancel anytime from Settings; Pro access continues until your billing period ends</li>
                  <li><span className="font-medium text-foreground">Access</span> — request a copy of all personal data we hold about you</li>
                </ul>
                <p className="mt-3">
                  To exercise any of these rights, contact us at the email below.
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-base font-bold text-foreground mb-4">6. AI Features</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Pro users can generate AI workouts and insights powered by Anthropic's Claude API.
                  When you use these features, relevant profile data (fitness goal, experience level, equipment)
                  is sent to Anthropic's API to generate a response.
                </p>
                <p>
                  Anthropic processes this data under their own privacy policy. We do not send identifiable
                  personal information (name, email) to the AI model — only anonymised fitness context.
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-base font-bold text-foreground mb-4">7. Children's Privacy</h2>
              <p className="text-sm text-muted-foreground">
                FitTracker is intended for users aged 13 and older. We do not knowingly collect personal
                information from children under 13. If you believe a child has created an account,
                please contact us and we will delete it promptly.
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-base font-bold text-foreground mb-4">8. Changes to This Policy</h2>
              <p className="text-sm text-muted-foreground">
                We may update this policy as the app evolves. The "Last updated" date at the top will always
                reflect the current version. For significant changes we will notify you via email or an
                in-app notice before they take effect.
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-base font-bold text-foreground mb-4">9. Contact</h2>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>Questions, data requests, or concerns about this policy:</p>
                <div className="rounded-xl border border-border bg-background p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">privacy@fittracker.app</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">We aim to respond within 48 hours.</p>
                </div>
              </div>
            </Card>

            {/* Footer summary */}
            <Card className="p-5 border-border" style={{ background: "hsl(0 0% 9%)" }}>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">tl;dr —</span> FitTracker stores your fitness data
                securely in the cloud. We use it only to run the app for you. We never sell it, never use it for ads,
                and you can export or delete it at any time.
              </p>
            </Card>

          </div>
        </div>
      </main>
    </div>
  )
}
