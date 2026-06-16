"use client"

import React from "react"

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  label?: string
  error?: string
  className?: string
}

export function Input({ label, error, id, className = "", ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
  const inputCls = `ui-input${error ? " ui-input--error" : ""} ${className}`.trim()
  return (
    <div className="ui-field">
      {label && (
        <label className="ui-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input id={inputId} className={inputCls} {...rest} />
      {error && <span className="ui-field-error">{error}</span>}
    </div>
  )
}
