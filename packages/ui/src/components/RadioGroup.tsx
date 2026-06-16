"use client"

import React from "react"

export interface RadioOption {
  value: string
  label: string
}

export interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
}

export function RadioGroup({ name, options, value, onChange, label, className = "" }: RadioGroupProps) {
  return (
    <div className={`ui-field ${className}`.trim()}>
      {label && <span className="ui-label">{label}</span>}
      <div className="ui-radio-group">
        {options.map((opt) => (
          <label key={opt.value} className="ui-radio-option">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  )
}
