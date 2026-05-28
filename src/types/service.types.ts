export type Service = {
  id: number
  name: string
  description?: string | null
  durationMinutes: number
  duration: string
  price: number
  priceFormatted: string
  colorHex?: string | null
}

export type ServiceItem = Service
