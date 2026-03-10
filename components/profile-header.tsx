"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Check, Pencil, X } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface ProfileHeaderProps {
  name: string
  email: string
  image?: string | null
  createdAt?: string | null
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
      style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
    >
      {initials}
    </div>
  )
}

export function ProfileHeader({ name: initialName, email, image, createdAt }: ProfileHeaderProps) {
  const { update } = useSession()
  const [name, setName] = useState(initialName)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initialName)
  const [saving, setSaving] = useState(false)

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null

  const saveName = async () => {
    if (!draft.trim() || draft.trim() === name) { setEditing(false); return }
    setSaving(true)
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draft.trim() }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? "Failed to update name")
        return
      }
      setName(draft.trim())
      setEditing(false)
      await update({ name: draft.trim() })
      toast.success("Name updated!")
    } catch {
      toast.error("Failed to update name")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="p-5 bg-card border-border">
      <div className="flex items-center gap-4">
        {image ? (
          <img
            src={image}
            alt={name}
            width={80}
            height={80}
            className="w-20 h-20 rounded-2xl object-cover shrink-0"
          />
        ) : (
          <InitialsAvatar name={name} />
        )}

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2 mb-1">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditing(false) }}
                className="h-8 text-base font-bold bg-background"
                autoFocus
                disabled={saving}
              />
              <button onClick={saveName} disabled={saving} className="shrink-0 text-primary hover:opacity-80">
                <Check className="h-4 w-4" />
              </button>
              <button onClick={() => { setEditing(false); setDraft(name) }} className="shrink-0 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-1">
              <p className="text-lg font-bold text-foreground truncate">{name}</p>
              <button onClick={() => { setEditing(true); setDraft(name) }} className="shrink-0 text-muted-foreground hover:text-foreground">
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <p className="text-sm text-muted-foreground truncate">{email}</p>
          {memberSince && (
            <p className="text-xs text-muted-foreground mt-1">Member since {memberSince}</p>
          )}
        </div>
      </div>
    </Card>
  )
}
