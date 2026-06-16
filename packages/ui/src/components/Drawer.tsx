"use client"

import React from "react"

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  "aria-label"?: string
}

export function Drawer({ open, onClose, title, children, "aria-label": ariaLabel }: DrawerProps) {
  if (!open) return null
  return (
    <div
      className="ui-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-label={ariaLabel ?? title}
    >
      <div className="ui-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="ui-drawer__header">
          {title && <h2 className="ui-drawer__title">{title}</h2>}
          <button className="ui-drawer__close" onClick={onClose} aria-label="סגור">
            ✕
          </button>
        </div>
        <div className="ui-drawer__body">{children}</div>
      </div>
    </div>
  )
}
