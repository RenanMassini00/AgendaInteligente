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

      await api.delete(`/api/products/${id}?userId=${getCurrentUserId()}`)
      setSuccessMessage('Produto removido com sucesso.')
      await loadPage()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível remover o produto.')
    }
  }

  async function handleMarkSold(product: Product) {
    try {
      setErrorMessage('')
      setSuccessMessage('')

      await api.put(`/api/products/${product.id}`, {
        userId: getCurrentUserId(),
        name: product.name,
        description: product.description ?? null,
        price: product.price,
        imageUrl: product.imageUrl ?? null,
        stockQuantity: product.stockQuantity,
        isActive: product.isActive,
        isSold: true,
        whatsAppMessage: product.whatsAppMessage ?? null,
      } as never)

      setSuccessMessage('Produto marcado como vendido.')
      await loadPage()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível atualizar o produto.')
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

  return (
    <div className="page-stack">
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

      <div className="cards-grid three-cols">
        {isLoading ? (
          <div className="feedback-card full-width">Carregando produtos...</div>
        ) : products.length === 0 ? (
          <div className="feedback-card full-width">Nenhum produto cadastrado.</div>
        ) : (
          products.map((product) => (
            <PageCard key={product.id}>
              <div className="catalog-product-card">
                <div className="catalog-product-image-wrap">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="catalog-product-image" />
                  ) : (
                    <div className="catalog-product-image-placeholder">Sem imagem</div>
                  )}
                </div>

                <div className="card-stack">
                  <div>
                    <h3>{product.name}</h3>
                    <p className="muted-text">{product.description || 'Sem descrição cadastrada.'}</p>
                  </div>

                  <div className="catalog-product-meta">
                    <span className="soft-pill">{product.priceFormatted}</span>
                    <span className="soft-pill">Estoque: {product.stockQuantity}</span>
                    <span className="soft-pill">{product.isActive ? 'Ativo' : 'Inativo'}</span>
                    <span className="soft-pill">{product.isSold ? 'Vendido' : 'Disponível'}</span>
                    <span className="soft-pill">{product.isAvailablePublic ? 'Visível no catálogo' : 'Oculto do catálogo'}</span>
                  </div>

                  <div className="item-actions">
                    <Link to={`/catalog/${product.id}/edit`} className="secondary-button small-button">
                      Editar
                    </Link>

                    {!product.isSold ? (
                      <button
                        type="button"
                        className="secondary-button small-button"
                        onClick={() => handleMarkSold(product)}
                      >
                        Marcar vendido
                      </button>
                    ) : null}

                    <button
                      type="button"
                      className="danger-button small-button"
                      onClick={() => handleDelete(product.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </PageCard>
          ))
        )}
      </div>
    </div>
  )
}