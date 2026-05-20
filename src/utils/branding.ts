const COMPANY_LOGO_STORAGE_KEY = 'scheduler_company_logo'
const BRANDING_CHANGED_EVENT = 'branding:changed'

function dispatchBrandingChanged() {
  window.dispatchEvent(new Event(BRANDING_CHANGED_EVENT))
}

export function setCompanyLogo(logoUrl?: string | null) {
  if (logoUrl && logoUrl.trim()) {
    localStorage.setItem(COMPANY_LOGO_STORAGE_KEY, logoUrl)
  } else {
    localStorage.removeItem(COMPANY_LOGO_STORAGE_KEY)
  }

  dispatchBrandingChanged()
}

export function getCompanyLogo() {
  return localStorage.getItem(COMPANY_LOGO_STORAGE_KEY) || ''
}

export function clearCompanyLogo() {
  localStorage.removeItem(COMPANY_LOGO_STORAGE_KEY)
  dispatchBrandingChanged()
}

export function getBrandingEventName() {
  return BRANDING_CHANGED_EVENT
}