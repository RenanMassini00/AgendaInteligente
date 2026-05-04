const LOGO_STORAGE_KEY = 'scheduler_brand_logo'
const BRANDING_EVENT = 'scheduler-branding-updated'

export function getCompanyLogo() {
  return localStorage.getItem(LOGO_STORAGE_KEY) ?? ''
}

export function setCompanyLogo(logoUrl: string) {
  if (logoUrl) {
    localStorage.setItem(LOGO_STORAGE_KEY, logoUrl)
  } else {
    localStorage.removeItem(LOGO_STORAGE_KEY)
  }

  window.dispatchEvent(new Event(BRANDING_EVENT))
}

export function clearCompanyLogo() {
  localStorage.removeItem(LOGO_STORAGE_KEY)
  window.dispatchEvent(new Event(BRANDING_EVENT))
}

export function getBrandingEventName() {
  return BRANDING_EVENT
}
