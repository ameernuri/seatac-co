import Link from "next/link"

import { cn } from "@/lib/utils"

type HomeGradientCardProps = {
  href: string
  eyebrow: string
  title: string
  className?: string
}

export function HomeGradientCard({
  href,
  eyebrow,
  title,
  className,
}: HomeGradientCardProps) {
  return (
    <Link href={href} className={cn("quick-fact-card", className)}>
      <span>{eyebrow}</span>
      <strong className="text-[#f5efe5]">{title}</strong>
    </Link>
  )
}

type HomeGradientMetricCardProps = {
  eyebrow: string
  title: string
  className?: string
  href?: string
}

export function HomeGradientMetricCard({
  eyebrow,
  title,
  className,
  href,
}: HomeGradientMetricCardProps) {
  const content = (
    <>
      <span>{eyebrow}</span>
      <strong className="text-[#123b33]">{title}</strong>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cn("quick-fact-card", className)}>
        {content}
      </Link>
    )
  }

  return <article className={cn("quick-fact-card", className)}>{content}</article>
}

type HomeGradientPanelProps = {
  eyebrow: string
  title?: string
  className?: string
  children: React.ReactNode
  "aria-label"?: string
}

export function HomeGradientPanel({
  eyebrow,
  title,
  className,
  children,
  "aria-label": ariaLabel,
}: HomeGradientPanelProps) {
  return (
    <div
      className={cn("hero-card-frame hero-card-compact home-gradient-panel", className)}
      aria-label={ariaLabel}
    >
      <div className="hero-card-topline">
        <span className="section-kicker">{eyebrow}</span>
        {title ? <strong>{title}</strong> : null}
      </div>
      {children}
    </div>
  )
}

type HomeGradientRowLinkProps = {
  href: string
  eyebrow: string
  title: string
  className?: string
}

export function HomeGradientRowLink({
  href,
  eyebrow,
  title,
  className,
}: HomeGradientRowLinkProps) {
  return (
    <Link href={href} className={cn("route-pill home-gradient-row", className)}>
      <span>{eyebrow}</span>
      <strong className="text-[#f5efe5]">{title}</strong>
    </Link>
  )
}

type HomeSurfaceNoteCardProps = {
  title: string
  body: React.ReactNode
  className?: string
}

export function HomeSurfaceNoteCard({
  title,
  body,
  className,
}: HomeSurfaceNoteCardProps) {
  return (
    <article className={cn("compact-note-card", className)}>
      <h3 className="font-sans font-semibold text-[#123b33]">{title}</h3>
      <p>{body}</p>
    </article>
  )
}
