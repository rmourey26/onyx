"use client"

import { toast as sonnerToast } from "sonner"

export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

// Simple wrapper function that mimics the old toast API but uses Sonner
function toast({ title, description, variant = "default", duration }: ToastProps) {
  const message = title || description || ""
  const options = {
    description: title && description ? description : undefined,
    duration,
  }

  if (variant === "destructive") {
    return sonnerToast.error(message, options)
  } else {
    return sonnerToast(message, options)
  }
}

// Hook that returns the toast function to maintain compatibility
export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  }
}

export { toast }
