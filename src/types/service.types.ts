export type ServiceItem = {
  id: number
  name: string
  description?: string | null
  durationMinutes: number
  duration: string
  price: number
  priceFormatted: string
  colorHex?: string | null
}
