"use client"

import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"

interface StatsCardProps {
  title: string
  value: number | string
  icon: ReactNode
  color?: string
  subtitle?: string
}

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 120, damping: 25 })
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString("he-IL"))
  const [displayVal, setDisplayVal] = useState(
    Math.round(value).toLocaleString("he-IL")
  )

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    const unsub = display.on("change", (v) => setDisplayVal(v))
    return unsub
  }, [display])

  return <motion.span>{displayVal}</motion.span>
}

export default function StatsCard({
  title,
  value,
  icon,
  color = "#FF006E",
  subtitle,
}: StatsCardProps) {
  const isNumber = typeof value === "number"

  return (
    <div className="bg-h-card border border-h-border rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden">
      {/* Subtle glow in top-left corner */}
      <div
        className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-5 pointer-events-none"
        style={{
          background: color,
          transform: "translate(-40%, -40%)",
          filter: "blur(40px)",
        }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between">
        <p className="text-h-muted text-sm font-medium">{title}</p>
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg"
          style={{
            background: `${color}18`,
            color: color,
            border: `1px solid ${color}30`,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <div>
        <div className="text-4xl font-bold text-h-text leading-none">
          {isNumber ? (
            <AnimatedNumber value={value as number} />
          ) : (
            <span>{value}</span>
          )}
        </div>
        {subtitle && (
          <p className="text-h-muted text-xs mt-1.5">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
