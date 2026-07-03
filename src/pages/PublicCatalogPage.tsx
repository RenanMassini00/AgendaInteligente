import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ArrowUpDown,
  BadgeCheck,
  MessageCircle,
  PackageCheck,
  RotateCcw,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
} from 'lucide-react'
import { api } from '../utils/api'
import {
  applyAccentColor,
  applyTheme,
  getStoredAccentColor,
  getStoredTheme,
} from '../utils/theme'
import { applyVisualSettings } from '../utils/visualSettings'
import type { Settings } from '../types/settings.types'
import type { PublicCatalog, PublicCatalogProduct } from '../types/product.types'

type SortOption = 'featured' | 'name-asc' | 'price-asc' | 'price-desc'
type CatalogFilter = 'all' | 'featured' | 'new' | 'under-100' | 'over-100' | 'low-stock'

function normalizePhone(phone?: string | null) {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

function buildStoreWhatsAppUrl(catalog: PublicCatalog | null) {
  if (!catalog?.phone) return ''

  const phone = normalizePhone(catalog.phone)
  if (!phone) return ''

  const message = `Olá! Vim pelo catálogo e gostaria de saber mais sobre os produtos da loja ${catalog.businessName || catalog.professionalName}.`
  return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`
}

function buildProductWhatsAppUrl(catalog: PublicCatalog | null, product: PublicCatalogProduct) {
  if (product.whatsappUrl) return product.whatsappUrl
  if (!catalog?.phone) return ''

  const phone = normalizePhone(catalog.phone)
  if (!phone) return ''

  const storeName = catalog.businessName || catalog.professionalName
  const customMessage = product.whatsAppMessage?.trim()
  const message =
    customMessage ||
    `Olá! Vim pelo catálogo da loja ${storeName} e tenho interesse no produto: ${product.name} (${product.effectivePriceFormatted}).`

  return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`
}

export default function PublicCatalogPage() {
  const { slug } = useParams()

  const [catalog, setCatalog] = useState<PublicCatalog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [selectedFilter, setSelectedFilter] = useState<CatalogFilter>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    let isMounted = true

    if (!slug) {
      setIsLoading(false)
      return () => {
        isMounted = false
      }
    }

    async function loadCatalog() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const response = await api.get<PublicCatalog>(`/api/public/catalog/${slug}`)
        let visualSettings: PublicCatalog | Settings = response

        if (!response.theme || !response.accentColor) {
          try {
            visualSettings = await api.get<Settings>(`/api/settings?userId=${response.userId}`)
          } catch {
            visualSettings = response
          }
        }

        if (isMounted) {
          applyVisualSettings(visualSettings, { includeLogo: false, fallback: true })
          setCatalog(response)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Não foi possível carregar o catálogo.'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCatalog()

    return () => {
      isMounted = false
      applyTheme(getStoredTheme())
      applyAccentColor(getStoredAccentColor())
    }
  }, [slug])

  const newestIds = useMemo(() => {
    if (!catalog) return new Set<number>()

    const newest = [...catalog.products]
      .sort((a, b) => b.id - a.id)
      .slice(0, 4)
      .map((item) => item.id)

    return new Set(newest)
  }, [catalog])

  const categories = useMemo(() => {
    if (!catalog) return []

    const values = Array.from(
      new Set(
        catalog.products
          .map((item) => item.category?.trim())
          .filter((item): item is string => !!item)
      )
    )

    return values.sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [catalog])

  const storeWhatsAppUrl = useMemo(() => buildStoreWhatsAppUrl(catalog), [catalog])

  const filteredProducts = useMemo(() => {
    if (!catalog) return []

    const normalizedSearch = searchTerm.trim().toLowerCase()

    let result = catalog.products.filter((product) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        (product.description ?? '').toLowerCase().includes(normalizedSearch)

      const matchesCategory =
        selectedCategory === 'all' ||
        (product.category ?? '').toLowerCase() === selectedCategory.toLowerCase()

      if (!matchesSearch || !matchesCategory) {
        return false
      }

      switch (selectedFilter) {
        case 'featured':
          return product.isFeatured

        case 'new':
          return newestIds.has(product.id)

        case 'under-100':
          return product.effectivePrice <= 100

        case 'over-100':
          return product.effectivePrice > 100

        case 'low-stock':
          return product.stockQuantity > 0 && product.stockQuantity <= 3

        case 'all':
        default:
          return true
      }
    })

    switch (sortBy) {
      case 'name-asc':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        break

      case 'price-asc':
        result = [...result].sort((a, b) => a.effectivePrice - b.effectivePrice)
        break

      case 'price-desc':
        result = [...result].sort((a, b) => b.effectivePrice - a.effectivePrice)
        break

      case 'featured':
      default:
        result = [...result].sort((a, b) => {
          const aFeatured = a.isFeatured ? 1 : 0
          const bFeatured = b.isFeatured ? 1 : 0

          if (aFeatured !== bFeatured) {
            return bFeatured - aFeatured
          }

          const aIsNew = newestIds.has(a.id) ? 1 : 0
          const bIsNew = newestIds.has(b.id) ? 1 : 0

          if (aIsNew !== bIsNew) {
            return bIsNew - aIsNew
          }

          return a.name.localeCompare(b.name, 'pt-BR')
        })
        break
    }

    return result
  }, [catalog, newestIds, searchTerm, selectedFilter, selectedCategory, sortBy])

  const totalVisible = filteredProducts.length
  const totalProducts = catalog?.products.length ?? 0
  const availableCount = catalog?.products.filter((item) => item.stockQuantity > 0).length ?? 0
  const catalogName = catalog?.businessName || catalog?.professionalName || ''

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    sortBy !== 'featured' ||
    selectedFilter !== 'all' ||
    selectedCategory !== 'all'

  function clearFilters() {
    setSearchTerm('')
    setSortBy('featured')
    setSelectedFilter('all')
    setSelectedCategory('all')
  }

  function renderBadge(product: PublicCatalogProduct) {
    if (product.isFeatured) {
      return <span className="catalog-badge badge-new">Destaque</span>
    }

    if (newestIds.has(product.id)) {
      return <span className="catalog-badge badge-new">Novo</span>
    }

    if (product.stockQuantity > 0 && product.stockQuantity <= 3) {
      return <span className="catalog-badge badge-warning">Últimas unidades</span>
    }

    return null
  }

  function renderPrice(product: PublicCatalogProduct) {
    const showOldPrice =
      product.originalPriceFormatted ||
      (product.promotionalPrice ? product.priceFormatted : null)

    return (
      <div className="catalog-price-block">
        {showOldPrice ? (
          <span className="catalog-old-price">
            {product.originalPriceFormatted || product.priceFormatted}
          </span>
        ) : null}

        <strong className="catalog-current-price">{product.effectivePriceFormatted}</strong>
      </div>
    )
  }

  function renderAction(product: PublicCatalogProduct) {
    const productWhatsAppUrl = buildProductWhatsAppUrl(catalog, product)

    if (!productWhatsAppUrl) {
      return null
    }

    return (
      <a
        href={productWhatsAppUrl}
        target="_blank"
        rel="noreferrer"
        className="primary-button public-catalog-action"
      >
        <MessageCircle size={16} />
        Tenho interesse
      </a>
    )
  }

  return (
    <div className="public-catalog-shell premium marketplace-catalog-shell">
      <div className="public-catalog-container premium">
        {isLoading ? (
          <div className="feedback-card">Carregando catálogo...</div>
        ) : errorMessage ? (
          <div className="feedback-card error-box">{errorMessage}</div>
        ) : !catalog ? (
          <div className="feedback-card">Catálogo não encontrado.</div>
        ) : (
          <>
            <section className="public-catalog-hero premium">
              <div className="public-catalog-hero-main">
                <div className="public-catalog-title-block">
                  <div className="public-catalog-brand-row">
                    <div
                      className={`public-catalog-brand-mark ${
                        catalog.companyLogoUrl ? 'public-catalog-brand-mark--logo' : ''
                      }`.trim()}
                    >
                      {catalog.companyLogoUrl ? (
                        <img src={catalog.companyLogoUrl} alt="" />
                      ) : (
                        <Store size={22} aria-hidden="true" />
                      )}
                    </div>

                    <div>
                      <span className="public-catalog-kicker">Catálogo online</span>
                      <span className="public-catalog-status">
                        <BadgeCheck size={14} />
                        Vitrine ativa
                      </span>
                    </div>
                  </div>

                  <h1>{catalogName}</h1>
                  <p>
                    {catalog.specialty ||
                      'Escolha seus produtos favoritos e fale direto no WhatsApp.'}
                  </p>

                  <div className="public-catalog-hero-pills">
                    {storeWhatsAppUrl ? (
                      <span>
                        <MessageCircle size={15} />
                        Atendimento direto
                      </span>
                    ) : null}

                    <span>
                      <PackageCheck size={15} />
                      Estoque atualizado
                    </span>
                  </div>
                </div>

                <div className="public-catalog-summary premium">
                  <div className="public-catalog-summary-card premium">
                    <span>produtos</span>
                    <strong>{totalProducts}</strong>
                  </div>

                  <div className="public-catalog-summary-card premium">
                    <span>disponíveis</span>
                    <strong>{availableCount}</strong>
                  </div>
                </div>
              </div>

              <div className="public-catalog-toolbar premium">
                <div className="public-catalog-search premium">
                  <Search size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar por nome ou descrição"
                    className="form-input"
                  />
                </div>

                <div className="public-catalog-select-wrap premium">
                  <ArrowUpDown size={16} />
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortOption)}
                    className="form-input"
                  >
                    <option value="featured">Mais relevantes</option>
                    <option value="name-asc">Nome A-Z</option>
                    <option value="price-asc">Menor preço</option>
                    <option value="price-desc">Maior preço</option>
                  </select>
                </div>
              </div>

              <div className="public-catalog-chips">
                <button
                  type="button"
                  className={`catalog-chip ${selectedFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('all')}
                >
                  Todos
                </button>

                <button
                  type="button"
                  className={`catalog-chip ${selectedFilter === 'featured' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('featured')}
                >
                  <Sparkles size={14} />
                  Destaques
                </button>

                <button
                  type="button"
                  className={`catalog-chip ${selectedFilter === 'new' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('new')}
                >
                  <Sparkles size={14} />
                  Novidades
                </button>

                <button
                  type="button"
                  className={`catalog-chip ${selectedFilter === 'under-100' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('under-100')}
                >
                  <Tag size={14} />
                  Até R$ 100
                </button>

                <button
                  type="button"
                  className={`catalog-chip ${selectedFilter === 'over-100' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('over-100')}
                >
                  Acima de R$ 100
                </button>

                <button
                  type="button"
                  className={`catalog-chip ${selectedFilter === 'low-stock' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('low-stock')}
                >
                  Últimas unidades
                </button>
              </div>

              {categories.length > 0 ? (
                <div className="public-catalog-chips secondary">
                  <button
                    type="button"
                    className={`catalog-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    Todas as categorias
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`catalog-chip ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="public-catalog-results-line premium">
                <div className="public-catalog-results-left">
                  <span>
                    Exibindo <strong>{totalVisible}</strong> de <strong>{totalProducts}</strong>{' '}
                    produtos
                  </span>
                </div>

                {hasActiveFilters ? (
                  <button type="button" className="catalog-clear-button" onClick={clearFilters}>
                    <RotateCcw size={15} />
                    Limpar filtros
                  </button>
                ) : null}
              </div>
            </section>

            {filteredProducts.length === 0 ? (
              <div className="feedback-card">
                Nenhum produto encontrado com os filtros informados.
              </div>
            ) : (
              <div
                className={`public-catalog-grid premium ${
                  filteredProducts.length === 1 ? 'single-product' : ''
                }`}
              >
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className={`public-catalog-card premium ${
                      product.stockQuantity > 0 && product.stockQuantity <= 3 ? 'low-stock' : ''
                    }`}
                  >
                    <div className="public-catalog-image-wrap premium">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          loading="lazy"
                          className="public-catalog-image"
                        />
                      ) : (
                        <div className="public-catalog-image-placeholder">
                          <ShoppingBag size={24} />
                          <span>Sem imagem</span>
                        </div>
                      )}
                    </div>

                    <div className="public-catalog-card-body premium">
                      <div className="public-catalog-card-badges">
                        {renderBadge(product)}
                        {product.category ? <span className="soft-pill">{product.category}</span> : null}
                      </div>

                      <div className="public-catalog-card-head premium">
                        <h3>{product.name}</h3>
                        {renderPrice(product)}
                      </div>

                      <p className="public-catalog-description">
                        {product.description || 'Sem descrição cadastrada.'}
                      </p>

                      <div className="public-catalog-meta-row premium">
                        <span className="soft-pill">Estoque: {product.stockQuantity}</span>

                        <span
                          className={`soft-pill ${
                            product.stockQuantity <= 3
                              ? 'public-catalog-pill-warning'
                              : 'public-catalog-pill-success'
                          }`}
                        >
                          {product.stockQuantity <= 3 ? 'Poucas unidades' : 'Disponível'}
                        </span>
                      </div>

                      <div className="public-catalog-card-footer premium">
                        {renderAction(product)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {storeWhatsAppUrl ? (
        <a
          href={storeWhatsAppUrl}
          target="_blank"
          rel="noreferrer"
          className="catalog-mobile-whatsapp-cta"
        >
          <MessageCircle size={18} />
          Falar no WhatsApp
        </a>
      ) : null}
    </div>
  )
}
