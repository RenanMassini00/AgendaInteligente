const COMPANY_LOGO_STORAGE_KEY = 'scheduler_company_logo'

export function getCompanyLogo() {
  return localStorage.getItem(COMPANY_LOGO_STORAGE_KEY) ?? ''
}

export function saveCompanyLogo(logoUrl: string) {
  if (!logoUrl) {
    localStorage.removeItem(COMPANY_LOGO_STORAGE_KEY)
    return
  }

  localStorage.setItem(COMPANY_LOGO_STORAGE_KEY, logoUrl)
}

export function clearCompanyLogo() {
  localStorage.removeItem(COMPANY_LOGO_STORAGE_KEY)
}