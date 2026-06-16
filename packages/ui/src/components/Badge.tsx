"use client"

import React from "react"

export interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info"
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = "default", className = "", children }: BadgeProps) {
  return (
    <span className={`ui-badge ui-badge--${variant} ${className}`.trim()}>
      {children}
    </span>
  )
}
