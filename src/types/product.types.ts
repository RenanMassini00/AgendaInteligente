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

export type PublicCatalogProduct = {
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
  isFeatured: boolean
  whatsappUrl?: string | null
}

export type PublicCatalog = {
  userId: number
  professionalName: string
  businessName?: string | null
  specialty?: string | null
  publicSlug?: string | null
  phone?: string | null
  products: PublicCatalogProduct[]
}