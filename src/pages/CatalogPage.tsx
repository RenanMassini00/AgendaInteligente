import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { Product } from '../types/product.types'

type ProfileResponse = {
  id: number
  fullName: string
  businessName?: string | null
  publicSlug?: string | null
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [publicSlug, setPublicSlug] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const publicCatalogUrl = useMemo(() => {
    if (!publicSlug) return ''
    return `${window.location.origin}/catalogo/${publicSlug}`
  }, [publicSlug])

  useEffect(() => {
    loadPage()
  }, [])

  async function loadPage() {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const userId = getCurrentUserId()

      const [productsResponse, profileResponse] = await Promise.all([
        api.get<Product[]>(`/api/products?userId=${userId}`),
        api.get<ProfileResponse>(`/api/profile?userId=${userId}`),
      ])

      setProducts(productsResponse)
      setPublicSlug(profileResponse.publicSlug ?? '')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar o catálogo.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm('Deseja remover este produto?')
    if (!confirmed) return

    try {
      setErrorMessage('')
      setSuccessMessage('')
      setDeletingProductId(id)

      await api.delete(`/api/products/${id}?userId=${getCurrentUserId()}`)
      setProducts((current) => current.filter((product) => product.id !== id))
      setSuccessMessage('Produto removido com sucesso.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível remover o produto.')
    } finally {
      setDeletingProductId(null)
    }
  }

  async function handleCopyPublicLink() {
    if (!publicCatalogUrl) return

    try {
      await navigator.clipboard.writeText(publicCatalogUrl)
      setSuccessMessage('Link do catálogo copiado com sucesso.')
    } catch {
      setSuccessMessage(`Link do catálogo: ${publicCatalogUrl}`)
    }
  }

  function renderPrice(product: Product) {
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

  async function handleRegisterSale(product: Product) {
    try {
      setErrorMessage('')
      setSuccessMessage('')

      await api.post(
        `/api/products/${product.id}/register-sale?userId=${getCurrentUserId()}`,
        { quantity: 1 }
      )

      setSuccessMessage('Venda registrada com sucesso.')
      await loadPage()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar a venda.'
      )
    }
  }

  return (
    <div className="page-stack catalog-management-page">
      <SectionHeader
        title="Catálogo"
        description="Cadastre e gerencie seus produtos para venda no catálogo público."
        action={
          <div className="section-actions">
            {publicCatalogUrl ? (
              <>
                <button type="button" className="secondary-button" onClick={handleCopyPublicLink}>
                  Copiar link
                </button>
                <a
                  href={publicCatalogUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-button"
                >
                  Ver catálogo
                </a>
              </>
            ) : null}

            <Link to={ROUTE_PATHS.createProduct} className="primary-button">
              Novo produto
            </Link>
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
                <h3>Seu catálogo público</h3>
                <p>Compartilhe este link com seus clientes.</p>
              </div>
            </div>

            <div className="soft-panel">
              <strong>{publicCatalogUrl}</strong>
            </div>
          </div>
        </PageCard>
      ) : null}

      <div className="public-catalog-grid premium catalog-management-grid">
        {isLoading ? (
          <div className="feedback-card full-width">Carregando produtos...</div>
        ) : products.length === 0 ? (
          <div className="feedback-card full-width">Nenhum produto cadastrado.</div>
        ) : (
          products.map((product) => (
            <article key={product.id} className="public-catalog-card premium catalog-management-card">
              <div className="public-catalog-image-wrap premium">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="public-catalog-image" />
                ) : (
                  <div className="public-catalog-image-placeholder">Sem imagem</div>
                )}
              </div>

              <div className="public-catalog-card-body premium">
                <div className="public-catalog-card-badges">
                  {product.isFeatured ? <span className="catalog-badge badge-new">Destaque</span> : null}
                  {product.stockQuantity > 0 && product.stockQuantity <= 3 ? (
                    <span className="catalog-badge badge-warning">Últimas unidades</span>
                  ) : null}
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
                  <span className="soft-pill">Vendidos: {product.soldQuantity}</span>

                  <span
                    className={`soft-pill ${product.stockQuantity > 0
                        ? 'public-catalog-pill-success'
                        : 'public-catalog-pill-warning'
                      }`}
                  >
                    {product.stockQuantity > 0 ? 'Disponível no catálogo' : 'Sem estoque'}
                  </span>
                </div>

                <div className="item-actions">
                  <Link to={`/catalog/${product.id}/edit`} className="secondary-button small-button">
                    Editar
                  </Link>

                  {!product.isSold ? (
                    <button
                      type="button"
                      className="secondary-button small-button"
                      onClick={() => handleRegisterSale(product)}
                      disabled={product.stockQuantity <= 0}
                    >
                      Registrar venda
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className="danger-button small-button"
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingProductId === product.id}
                  >
                    {deletingProductId === product.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
