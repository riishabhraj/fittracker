"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface BackButtonProps {
  className?: string
  size?: "sm" | "default" | "lg"
  onClick?: () => void
}

export function BackButton({ className, size = "sm", onClick }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onClick) {
      onClick()
    } else {
      // Default behavior: go to home page
      router.push("/")
    }
  }

  return (
    <Button 
      variant="ghost" 
      size={size} 
      className={`p-2 ${className}`} 
      onClick={handleBack}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  )
}
