const BRANDING_STORAGE_KEY = 'scheduler_branding'

export type BrandingSettings = {
  companyName: string
  subtitle: string
  logoUrl: string
}

const defaultBranding: BrandingSettings = {
  companyName: 'Meu Agendamento',
  subtitle: 'Profissional Autônomo',
  logoUrl: '',
}

export function getBranding(): BrandingSettings {
  const raw = localStorage.getItem(BRANDING_STORAGE_KEY)

  if (!raw) {
    return defaultBranding
  }

  try {
    return {
      ...defaultBranding,
      ...JSON.parse(raw),
    }
  } catch {
    return defaultBranding
  }
}

export function saveBranding(data: BrandingSettings) {
  localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(data))
}

export function getInitials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean)

  if (parts.length === 0) {
    return 'M'
  }

  if (parts.length === 1) {
    return parts[0][0].toUpperCase()
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}