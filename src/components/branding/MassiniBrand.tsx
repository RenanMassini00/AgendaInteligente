import { MASSINI_BRANDING } from '../../config/branding'

type MassiniBrandProps = {
  compact?: boolean
  caption?: string
  subtitle?: string
  className?: string
}

export default function MassiniBrand({
  compact = false,
  caption = MASSINI_BRANDING.name,
  subtitle = MASSINI_BRANDING.tagline,
  className = '',
}: MassiniBrandProps) {
  return (
    <div className={`massini-brand ${compact ? 'massini-brand--compact' : ''} ${className}`.trim()}>
      <img
        src={MASSINI_BRANDING.logo}
        alt={MASSINI_BRANDING.name}
        className="massini-brand-logo"
      />

      <div className="massini-brand-copy">
        <span className="massini-brand-caption">{caption}</span>
        <strong className="massini-brand-title">{MASSINI_BRANDING.name}</strong>
        <small className="massini-brand-tagline">{subtitle}</small>
      </div>
    </div>
  )
}