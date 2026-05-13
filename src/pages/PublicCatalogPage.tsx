import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'
import type { PublicCatalog } from '../types/product.types'

export default function PublicCatalogPage() {
  const { slug } = useParams()
  const [catalog, setCatalog] = useState<PublicCatalog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!slug) return

    async function loadCatalog() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const response = await api.get<PublicCatalog>(`/api/public/catalog/${slug}`)
        setCatalog(response)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar o catálogo.')
      } finally {
        setIsLoading(false)
      }
    }

    loadCatalog()
  }, [slug])

  return (
    <div className="public-catalog-shell">
      <div className="public-catalog-container">
        {isLoading ? (
          <div className="feedback-card">Carregando catálogo...</div>
        ) : errorMessage ? (
          <div className="feedback-card error-box">{errorMessage}</div>
        ) : !catalog ? (
          <div className="feedback-card">Catálogo não encontrado.</div>
        ) : (
          <>
            <div className="public-catalog-hero">
              <span className="public-catalog-kicker">Catálogo online</span>
              <h1>{catalog.businessName || catalog.professionalName}</h1>
              <p>{catalog.specialty || 'Produtos disponíveis para venda'}</p>
            </div>

            {catalog.products.length === 0 ? (
              <div className="feedback-card">Nenhum produto disponível no momento.</div>
            ) : (
              <div className="cards-grid three-cols">
                {catalog.products.map((product) => (
                  <div key={product.id} className="public-catalog-card">
                    <div className="public-catalog-image-wrap">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="public-catalog-image" />
                      ) : (
                        <div className="public-catalog-image-placeholder">Sem imagem</div>
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
                      </div>

                      {product.whatsappUrl ? (
                        <a
                          href={product.whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="primary-button"
                        >
                          Tenho interesse
                        </a>
                      ) : (
                        <button type="button" className="secondary-button" disabled>
                          WhatsApp não configurado
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}