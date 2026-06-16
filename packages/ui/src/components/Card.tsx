import React from "react"

export interface CardProps {
  image?: string
  imageAlt?: string
  title: string
  subtitle?: string
  badges?: React.ReactNode
  footer?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  children?: React.ReactNode
  className?: string
}

export function Card({
  image,
  imageAlt,
  title,
  subtitle,
  badges,
  footer,
  onClick,
  disabled,
  children,
  className,
}: CardProps) {
  const clickable = !!onClick
  const classes = [
    "ui-card",
    clickable ? "ui-card--clickable" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      className={classes}
      onClick={disabled ? undefined : onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? (disabled ? -1 : 0) : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" && !disabled && onClick) onClick()
            }
          : undefined
      }
      aria-disabled={disabled || undefined}
      style={disabled ? { opacity: 0.6 } : undefined}
    >
      {image && (
        <img className="ui-card__img" src={image} alt={imageAlt ?? title} />
      )}
      <div className="ui-card__body">
        <p className="ui-card__title">{title}</p>
        {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
        {badges && <div className="ui-card__badges">{badges}</div>}
        {children}
      </div>
      {footer && <div className="ui-card__footer">{footer}</div>}
    </div>
  )
}
