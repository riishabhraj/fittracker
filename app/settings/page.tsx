"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Lock, Download, Shield, LogOut, Info, ChevronRight } from "lucide-react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { exportWorkoutData } from "@/lib/workout-storage"
import { exportGoalData } from "@/lib/goal-storage"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect } from "react"

function SettingsRow({
  icon: Icon,
  label,
  sublabel,
  onClick,
  destructive,
  href,
  iconColor,
  iconBg,
  right,
}: {
  icon: React.ElementType
  label: string
  sublabel?: string
  onClick?: () => void
  destructive?: boolean
  href?: string
  iconColor?: string
  iconBg?: string
  right?: React.ReactNode
}) {
  const inner = (
    <div
      className="flex items-center gap-3 px-1 py-3 rounded-xl hover:bg-muted/10 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: destructive ? "rgba(239,68,68,0.12)" : (iconBg ?? "hsl(0 0% 14%)") }}
      >
        <Icon className="h-4 w-4" style={{ color: destructive ? "#ef4444" : (iconColor ?? "hsl(0 0% 55%)") }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${destructive ? "text-red-400" : "text-foreground"}`}>{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      {right ?? <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4 bg-card border-border">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
      <div className="divide-y divide-border/40">{children}</div>
    </Card>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isOAuthUser, setIsOAuthUser] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" })
  const [pwSaving, setPwSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetch("/api/user")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => { if (u) setIsOAuthUser(u.isOAuthUser ?? false) })
      .catch(() => {})
  }, [])

  const changePassword = async () => {
    if (pwForm.next !== pwForm.confirm) { toast.error("New passwords don't match"); return }
    if (pwForm.next.length < 8) { toast.error("Password must be at least 8 characters"); return }
    setPwSaving(true)
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(data.error ?? "Failed to change password"); return }
      toast.success("Password changed!")
      setPwOpen(false)
      setPwForm({ current: "", next: "", confirm: "" })
    } catch {
      toast.error("Something went wrong")
    } finally {
      setPwSaving(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const [workoutData, goalData] = await Promise.all([exportWorkoutData(), exportGoalData()])
      const combined = {
        workouts: JSON.parse(workoutData).workouts,
        goals: JSON.parse(goalData).goals,
        exportDate: new Date().toISOString(),
        version: "2.0.0",
        app: "FitTracker",
      }
      const blob = new Blob([JSON.stringify(combined, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `fittracker-export-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Data exported!")
    } catch {
      toast.error("Export failed")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header
        className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="px-5 pt-4 pb-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="px-5 py-5 pb-8 space-y-4">
        {/* Account */}
        <SectionCard title="Account">
          {!isOAuthUser && (
            <SettingsRow
              icon={Lock}
              label="Change Password"
              sublabel="Update your login password"
              onClick={() => setPwOpen(true)}
              iconColor="#60a5fa"
              iconBg="rgba(96,165,250,0.12)"
            />
          )}
          <SettingsRow
            icon={Download}
            label={exporting ? "Exporting…" : "Export My Data"}
            sublabel="Download workouts & goals as JSON"
            onClick={handleExport}
            iconColor="#4ade80"
            iconBg="rgba(74,222,128,0.12)"
          />
        </SectionCard>

        {/* App */}
        <SectionCard title="App">
          <SettingsRow
            icon={Shield}
            label="Privacy Policy"
            href="/privacy-policy"
            iconColor="#a855f7"
            iconBg="rgba(168,85,247,0.12)"
          />
          <SettingsRow
            icon={Info}
            label="Version"
            iconColor="hsl(0 0% 55%)"
            right={<span className="text-xs text-muted-foreground">v2.0.0</span>}
          />
        </SectionCard>

        {/* Danger */}
        <SectionCard title="Session">
          <SettingsRow
            icon={LogOut}
            label="Sign Out"
            sublabel={session?.user?.email ?? undefined}
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            destructive
          />
        </SectionCard>
      </main>

      {/* Change Password Dialog */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            {[
              { key: "current", label: "Current Password", placeholder: "••••••••" },
              { key: "next",    label: "New Password",     placeholder: "Min. 8 characters" },
              { key: "confirm", label: "Confirm New Password", placeholder: "••••••••" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <p className="text-sm font-medium text-foreground mb-1.5">{label}</p>
                <Input
                  type="password"
                  placeholder={placeholder}
                  value={pwForm[key as keyof typeof pwForm]}
                  onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="bg-background"
                  onKeyDown={(e) => e.key === "Enter" && changePassword()}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setPwOpen(false)} disabled={pwSaving}>Cancel</Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
                onClick={changePassword}
                disabled={pwSaving}
              >
                {pwSaving ? "Saving…" : "Update"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
