import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageCard from '../ui/PageCard'
import SectionHeader from '../ui/SectionHeader'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { api } from '../../utils/api'
import { getCurrentUser, getCurrentUserId } from '../../utils/auth'
import type { Product } from '../../types/product.types'

type ProfileResponse = {
  id: number
  fullName: string
  businessName?: string | null
  publicSlug?: string | null
  specialty?: string | null
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default function CatalogDashboard() {
  const user = getCurrentUser()
  const [products, setProducts] = useState<Product[]>([])
  const [publicSlug, setPublicSlug] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const userId = getCurrentUserId()

        const [productsResponse, profileResponse] = await Promise.all([
          api.get<Product[]>(`/api/products?userId=${userId}`),
          api.get<ProfileResponse>(`/api/profile?userId=${userId}`),
        ])

        if (!isMounted) return

        setProducts(productsResponse)
        setPublicSlug(profileResponse.publicSlug ?? '')
      } catch (error) {
        if (!isMounted) return

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar o dashboard do catálogo.'
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const publicCatalogUrl = useMemo(() => {
    if (!publicSlug) return ''
    return `${window.location.origin}/catalogo/${publicSlug}`
  }, [publicSlug])

  const stats = useMemo(() => {
    const totalProducts = products.length
    const activeProducts = products.filter((item) => item.isActive).length
    const publicProducts = products.filter((item) => item.isAvailablePublic).length
    const soldProducts = products.filter((item) => item.isSold).length

    const outOfStockProducts = products.filter(
      (item) => !item.isSold && item.stockQuantity <= 0
    ).length

    const lowStockProducts = products.filter(
      (item) => !item.isSold && item.stockQuantity > 0 && item.stockQuantity <= 3
    ).length

    const totalStockUnits = products
      .filter((item) => item.isActive && !item.isSold)
      .reduce((sum, item) => sum + item.stockQuantity, 0)

    const stockValue = products
      .filter((item) => item.isActive && !item.isSold)
      .reduce((sum, item) => sum + item.price * item.stockQuantity, 0)

    const soldValue = products
      .filter((item) => item.isSold)
      .reduce((sum, item) => sum + item.price, 0)

    return {
      totalProducts,
      activeProducts,
      publicProducts,
      soldProducts,
      outOfStockProducts,
      lowStockProducts,
      totalStockUnits,
      stockValue,
      soldValue,
    }
  }, [products])

  const lowStockList = useMemo(() => {
    return [...products]
      .filter((item) => !item.isSold && item.stockQuantity > 0 && item.stockQuantity <= 3)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .slice(0, 6)
  }, [products])

  const soldList = useMemo(() => {
    return [...products]
      .filter((item) => item.isSold)
      .sort((a, b) => b.id - a.id)
      .slice(0, 6)
  }, [products])

  const recentProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.id - a.id)
      .slice(0, 8)
  }, [products])

  async function handleCopyCatalogLink() {
    if (!publicCatalogUrl) return

    try {
      await navigator.clipboard.writeText(publicCatalogUrl)
      setSuccessMessage('Link do catálogo copiado com sucesso.')
    } catch {
      setSuccessMessage(`Link do catálogo: ${publicCatalogUrl}`)
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Dashboard catálogo"
        description="Acompanhe seus produtos, estoque e vendas realizadas."
        action={
          <div className="section-actions">
            <Link to={ROUTE_PATHS.catalog} className="secondary-button">
              Meus produtos
            </Link>

            <Link to={ROUTE_PATHS.createProduct} className="primary-button">
              Novo produto
            </Link>

            {publicCatalogUrl ? (
              <>
                <a
                  href={publicCatalogUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-button"
                >
                  Ver catálogo
                </a>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCopyCatalogLink}
                >
                  Copiar link
                </button>
              </>
            ) : null}
          </div>
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
      {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

      {publicCatalogUrl ? (
        <PageCard>
          <div className="card-stack">
            <div className="card-heading">
              <div>
                <h3>Catálogo público</h3>
                <p>Compartilhe este link com seus clientes.</p>
              </div>
            </div>

            <div className="soft-panel">
              <strong>{publicCatalogUrl}</strong>
              <p className="muted-text">
                Loja: {user?.businessName || user?.fullName || 'Catálogo'}
              </p>
            </div>
          </div>
        </PageCard>
      ) : null}

      <div className="cards-grid two-cols catalog-dashboard-stats">
        <PageCard>
          <div className="dashboard-stat-card">
            <div>
              <span className="muted-text">Produtos cadastrados</span>
              <h2>{isLoading ? '--' : stats.totalProducts}</h2>
            </div>
            <div className="dashboard-stat-icon">📦</div>
          </div>
        </PageCard>

        <PageCard>
          <div className="dashboard-stat-card">
            <div>
              <span className="muted-text">Produtos visíveis no catálogo</span>
              <h2>{isLoading ? '--' : stats.publicProducts}</h2>
            </div>
            <div className="dashboard-stat-icon">🛍️</div>
          </div>
        </PageCard>

        <PageCard>
          <div className="dashboard-stat-card">
            <div>
              <span className="muted-text">Produtos vendidos</span>
              <h2>{isLoading ? '--' : stats.soldProducts}</h2>
            </div>
            <div className="dashboard-stat-icon">✅</div>
          </div>
        </PageCard>

        <PageCard>
          <div className="dashboard-stat-card">
            <div>
              <span className="muted-text">Itens em estoque</span>
              <h2>{isLoading ? '--' : stats.totalStockUnits}</h2>
            </div>
            <div className="dashboard-stat-icon">📚</div>
          </div>
        </PageCard>

        <PageCard>
          <div className="dashboard-stat-card">
            <div>
              <span className="muted-text">Valor total em estoque</span>
              <h2>{isLoading ? '--' : formatCurrency(stats.stockValue)}</h2>
            </div>
            <div className="dashboard-stat-icon">💰</div>
          </div>
        </PageCard>

        <PageCard>
          <div className="dashboard-stat-card">
            <div>
              <span className="muted-text">Valor total vendido</span>
              <h2>{isLoading ? '--' : formatCurrency(stats.soldValue)}</h2>
            </div>
            <div className="dashboard-stat-icon">📈</div>
          </div>
        </PageCard>
      </div>

      <div className="cards-grid two-cols">
        <PageCard>
          <div className="card-stack">
            <div className="card-heading">
              <div>
                <h3>Status do estoque</h3>
                <p>Veja como está a saúde do seu catálogo.</p>
              </div>
            </div>

            <div className="catalog-health-grid">
              <div className="soft-panel">
                <strong>{isLoading ? '--' : stats.activeProducts}</strong>
                <span className="muted-text">Produtos ativos</span>
              </div>

              <div className="soft-panel">
                <strong>{isLoading ? '--' : stats.lowStockProducts}</strong>
                <span className="muted-text">Baixo estoque</span>
              </div>

              <div className="soft-panel">
                <strong>{isLoading ? '--' : stats.outOfStockProducts}</strong>
                <span className="muted-text">Sem estoque</span>
              </div>
            </div>
          </div>
        </PageCard>

        <PageCard>
          <div className="card-stack">
            <div className="card-heading">
              <div>
                <h3>Produtos vendidos</h3>
                <p>Últimos itens marcados como vendidos.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="feedback-card">Carregando...</div>
            ) : soldList.length === 0 ? (
              <div className="feedback-card">Nenhuma venda registrada ainda.</div>
            ) : (
              <div className="card-stack">
                {soldList.map((product) => (
                  <div key={product.id} className="catalog-list-item">
                    <div>
                      <strong>{product.name}</strong>
                      <p className="muted-text">{product.priceFormatted}</p>
                    </div>

                    <Link
                      to={`/catalog/${product.id}/edit`}
                      className="secondary-button small-button"
                    >
                      Ver
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PageCard>
      </div>

      <div className="cards-grid two-cols">
        <PageCard>
          <div className="card-stack">
            <div className="card-heading">
              <div>
                <h3>Produtos com baixo estoque</h3>
                <p>Itens que precisam de reposição mais rápido.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="feedback-card">Carregando...</div>
            ) : lowStockList.length === 0 ? (
              <div className="feedback-card">Nenhum produto com baixo estoque.</div>
            ) : (
              <div className="card-stack">
                {lowStockList.map((product) => (
                  <div key={product.id} className="catalog-list-item">
                    <div>
                      <strong>{product.name}</strong>
                      <p className="muted-text">Estoque: {product.stockQuantity}</p>
                    </div>

                    <Link
                      to={`/catalog/${product.id}/edit`}
                      className="secondary-button small-button"
                    >
                      Repor / editar
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PageCard>

        <PageCard>
          <div className="card-stack">
            <div className="card-heading">
              <div>
                <h3>Produtos recentes</h3>
                <p>Resumo rápido do que está cadastrado.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="feedback-card">Carregando...</div>
            ) : recentProducts.length === 0 ? (
              <div className="feedback-card">Nenhum produto cadastrado ainda.</div>
            ) : (
              <div className="card-stack">
                {recentProducts.map((product) => (
                  <div key={product.id} className="catalog-list-item">
                    <div>
                      <strong>{product.name}</strong>
                      <p className="muted-text">
                        {product.priceFormatted} • Estoque: {product.stockQuantity}
                      </p>
                    </div>

                    <span className="soft-pill">
                      {product.isSold
                        ? 'Vendido'
                        : product.isAvailablePublic
                          ? 'No catálogo'
                          : 'Oculto'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PageCard>
      </div>
    </div>
  )
}