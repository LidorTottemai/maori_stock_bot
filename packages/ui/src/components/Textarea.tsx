"use client"

import React from "react"

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  label?: string
  error?: string
  className?: string
}

export function Textarea({ label, error, id, className = "", ...rest }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
  const cls = `ui-textarea${error ? " ui-textarea--error" : ""} ${className}`.trim()
  return (
    <div className="ui-field">
      {label && (
        <label className="ui-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <textarea id={inputId} className={cls} {...rest} />
      {error && <span className="ui-field-error">{error}</span>}
    </div>
  )
}
