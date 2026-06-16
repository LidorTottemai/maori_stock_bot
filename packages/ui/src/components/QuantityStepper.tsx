import React from "react"
import { Button } from "./Button"

export interface QuantityStepperProps {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  disabled?: boolean
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled,
}: QuantityStepperProps) {
  return (
    <div className="ui-qty-stepper">
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="הפחת כמות"
      >
        −
      </Button>
      <span className="ui-qty-stepper__value">{value}</span>
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        aria-label="הוסף כמות"
      >
        +
      </Button>
    </div>
  )
}
