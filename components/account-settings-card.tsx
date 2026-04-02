"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LogOut, Lock, Download, Shield, ChevronRight } from "lucide-react"
import { robustSignOut } from "@/lib/auth-utils"
import { toast } from "sonner"
import { exportWorkoutData } from "@/lib/workout-storage"
import { exportGoalData } from "@/lib/goal-storage"
import Link from "next/link"

interface AccountSettingsCardProps {
  /** True for Google OAuth users — hides change-password option */
  isOAuthUser: boolean
}

function SettingsRow({
  icon: Icon,
  label,
  sublabel,
  onClick,
  destructive,
  href,
  iconColor,
}: {
  icon: React.ElementType
  label: string
  sublabel?: string
  onClick?: () => void
  destructive?: boolean
  href?: string
  iconColor?: string
}) {
  const inner = (
    <div
      className="flex items-center gap-3 px-1 py-3 rounded-xl hover:bg-muted/10 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: destructive ? "rgba(239,68,68,0.12)" : "hsl(0 0% 14%)" }}
      >
        <Icon className="h-4 w-4" style={{ color: destructive ? "#ef4444" : (iconColor ?? "hsl(0 0% 55%)") }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${destructive ? "text-red-400" : "text-foreground"}`}>{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  )

  return href ? <Link href={href}>{inner}</Link> : inner
}

export function AccountSettingsCard({ isOAuthUser }: AccountSettingsCardProps) {
  const [pwOpen, setPwOpen] = useState(false)
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" })
  const [pwSaving, setPwSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

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
      toast.success("Password changed successfully!")
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
      toast.success("Data exported successfully!")
    } catch {
      toast.error("Export failed")
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <Card className="p-4 bg-card border-border">
        <h3 className="font-semibold text-foreground mb-1">Account</h3>

        <div className="divide-y divide-border/50">
          {!isOAuthUser && (
            <SettingsRow
              icon={Lock}
              label="Change Password"
              sublabel="Update your login password"
              onClick={() => setPwOpen(true)}
              iconColor="#60a5fa"
            />
          )}
          <SettingsRow
            icon={Download}
            label={exporting ? "Exporting…" : "Export My Data"}
            sublabel="Download workouts & goals as JSON"
            onClick={handleExport}
            iconColor="#4ade80"
          />
          <SettingsRow
            icon={Shield}
            label="Privacy Policy"
            href="/privacy-policy"
            iconColor="hsl(0 0% 55%)"
          />
          <SettingsRow
            icon={LogOut}
            label="Sign Out"
            onClick={robustSignOut}
            destructive
          />
        </div>
      </Card>

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
    </>
  )
}
