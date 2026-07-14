"use client"

import type React from "react"

import { FeedbackBadge } from "./feedback-badge"

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FeedbackBadge />
    </>
  )
}
