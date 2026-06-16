"use client"

import React from "react"

export interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <span
      className={`ui-spinner ui-spinner--${size} ${className}`.trim()}
      role="status"
      aria-label="טוען..."
    />
  )
}
