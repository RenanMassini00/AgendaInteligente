export type ThemeMode = 'light' | 'dark'

export type AccentColor =
  | 'blue'
  | 'pink'
  | 'violet'
  | 'emerald'
  | 'cyan'
  | 'amber'
  | 'rose'
  | 'slate'

export type Settings = {
  userId: number
  theme: ThemeMode
  accentColor: AccentColor
  companyLogoUrl?: string | null
}

export type AdminBrandingUser = {
  userId: number
  fullName: string
  businessName?: string | null
  email: string
  theme: ThemeMode
  accentColor: AccentColor
  companyLogoUrl?: string | null
}