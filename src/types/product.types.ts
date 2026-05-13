export type Product = {
  id: number
  name: string
  description?: string | null
  price: number
  priceFormatted: string
  imageUrl?: string | null
  stockQuantity: number
  isActive: boolean
  isSold: boolean
  isAvailablePublic: boolean
  whatsAppMessage?: string | null
}

export type PublicCatalogProduct = {
  id: number
  name: string
  description?: string | null
  price: number
  priceFormatted: string
  imageUrl?: string | null
  stockQuantity: number
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