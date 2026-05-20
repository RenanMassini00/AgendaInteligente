export type PublicProfessional = {
  id: number
  fullName: string
  businessName?: string | null
  email: string
  specialty?: string | null
  publicSlug?: string | null
}

export type AvailableSlot = {
  time: string
  endTime: string
}

export type Product = {
  id: number
  name: string
  category?: string | null
  description?: string | null
  price: number
  priceFormatted: string
  originalPrice?: number | null
  originalPriceFormatted?: string | null
  promotionalPrice?: number | null
  promotionalPriceFormatted?: string | null
  effectivePrice: number
  effectivePriceFormatted: string
  imageUrl?: string | null
  stockQuantity: number
  soldQuantity: number
  isActive: boolean
  isSold: boolean
  isFeatured: boolean
  isAvailablePublic: boolean
  whatsAppMessage?: string | null
}
