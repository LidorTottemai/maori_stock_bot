"use client"

import React from "react"

export interface StepperProps {
  steps: string[]
  current: number
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="ui-stepper" role="list">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        const cls = [
          "ui-stepper__item",
          done ? "ui-stepper__item--done" : "",
          active ? "ui-stepper__item--active" : "",
        ]
          .filter(Boolean)
          .join(" ")

        return (
          <div key={i} className={cls} role="listitem" aria-current={active ? "step" : undefined}>
            <div className="ui-stepper__circle">{done ? "✓" : i + 1}</div>
            <span className="ui-stepper__label">{label}</span>
          </div>
        )
      })}
    </div>
  )
}
