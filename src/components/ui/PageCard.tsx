import type { ReactNode } from 'react'

type PageCardProps = {
  children: ReactNode
  className?: string
}

export default function PageCard({ children, className = '' }: PageCardProps) {
  return <div className={`card ${className}`.trim()}>{children}</div>
}
