import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ImagePlus, UploadCloud, X } from 'lucide-react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { Product } from '../types/product.types'

const commonCategories = [
  'Roupas',
  'Acessórios',
  'Calçados',
  'Beleza',
  'Cosméticos',
  'Presentes',
  'Artesanato',
  'Joias',
]

const maxProductImageEdge = 1400
const productImageQuality = 0.86

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Não foi possível ler a imagem selecionada.'))
        return
      }

      if (file.type === 'image/svg+xml') {
        resolve(reader.result)
        return
      }

      const image = new Image()

      image.onload = () => {
        const originalWidth = image.naturalWidth || image.width
        const originalHeight = image.naturalHeight || image.height
        const scale = Math.min(1, maxProductImageEdge / Math.max(originalWidth, originalHeight))
        const width = Math.max(1, Math.round(originalWidth * scale))
        const height = Math.max(1, Math.round(originalHeight * scale))
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        if (!context) {
          resolve(reader.result as string)
          return
        }

        canvas.width = width
        canvas.height = height
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, width, height)
        context.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', productImageQuality))
      }

      image.onerror = () => reject(new Error('Não foi possível preparar a imagem selecionada.'))
      image.src = reader.result
    }

    reader.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'))
    reader.readAsDataURL(file)
  })
}

export default function CreateProductPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [promotionalPrice, setPromotionalPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFileName, setImageFileName] = useState('')
  const [stockQuantity, setStockQuantity] = useState('0')
  const [whatsAppMessage, setWhatsAppMessage] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isSold, setIsSold] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isEditMode || !id) return

    async function loadProduct() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const response = await api.get<Product>(`/api/products/${id}?userId=${getCurrentUserId()}`)

        setName(response.name)
        setCategory(response.category ?? '')
        setDescription(response.description ?? '')
        setPrice(String(response.price))
        setOriginalPrice(response.originalPrice != null ? String(response.originalPrice) : '')
        setPromotionalPrice(response.promotionalPrice != null ? String(response.promotionalPrice) : '')
        setImageUrl(response.imageUrl ?? '')
        setImageFileName(response.imageUrl ? 'Imagem cadastrada' : '')
        setStockQuantity(String(response.stockQuantity))
        setWhatsAppMessage(response.whatsAppMessage ?? '')
        setIsActive(response.isActive)
        setIsSold(response.isSold)
        setIsFeatured(response.isFeatured)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar o produto.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id, isEditMode])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const payload = {
        userId: getCurrentUserId(),
        name,
        category: category || null,
        description: description || null,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        promotionalPrice: promotionalPrice ? Number(promotionalPrice) : null,
        imageUrl: imageUrl || null,
        stockQuantity: Number(stockQuantity),
        isActive,
        isSold,
        isFeatured,
        whatsAppMessage: whatsAppMessage || null,
      }

      if (isEditMode && id) {
        await api.put(`/api/products/${id}`, payload as never)
      } else {
        await api.post('/api/products', payload as never)
      }

      navigate(ROUTE_PATHS.catalog)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar o produto.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Selecione um arquivo de imagem válido.')
      event.target.value = ''
      return
    }

    try {
      setErrorMessage('')
      const imageDataUrl = await readImageFile(file)
      setImageUrl(imageDataUrl)
      setImageFileName(file.name)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível anexar a imagem.')
    } finally {
      event.target.value = ''
    }
  }

  function handleRemoveImage() {
    setImageUrl('')
    setImageFileName('')
  }

  return (
    <div className="page-stack product-editor-page">
      <SectionHeader
        title={isEditMode ? 'Editar produto' : 'Novo produto'}
        description={
          isEditMode
            ? 'Atualize as informações do produto.'
            : 'Cadastre um novo produto para o catálogo.'
        }
        action={
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate(ROUTE_PATHS.catalog)}
          >
            Voltar
          </button>
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}

      <PageCard className="product-editor-card">
        {isLoading ? (
          <div className="feedback-card">Carregando produto...</div>
        ) : (
          <form onSubmit={handleSubmit} className="form-grid two-column-grid product-editor-form">
            <div className="form-field">
              <label className="label" htmlFor="name">Nome do produto</label>
              <input
                id="name"
                className="form-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nome do produto"
              />
            </div>

            <div className="form-field">
              <label className="label" htmlFor="category">Categoria</label>
              <input
                id="category"
                className="form-input"
                list="product-categories"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Selecione ou digite"
              />
              <datalist id="product-categories">
                {commonCategories.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div className="form-field">
              <label className="label" htmlFor="price">Preço base</label>
              <input
                id="price"
                type="number"
                step="0.01"
                className="form-input"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="form-field">
              <label className="label" htmlFor="originalPrice">Preço original</label>
              <input
                id="originalPrice"
                type="number"
                step="0.01"
                className="form-input"
                value={originalPrice}
                onChange={(event) => setOriginalPrice(event.target.value)}
                placeholder="Ex: 199.90"
              />
            </div>

            <div className="form-field">
              <label className="label" htmlFor="promotionalPrice">Preço promocional</label>
              <input
                id="promotionalPrice"
                type="number"
                step="0.01"
                className="form-input"
                value={promotionalPrice}
                onChange={(event) => setPromotionalPrice(event.target.value)}
                placeholder="Ex: 149.90"
              />
            </div>

            <div className="form-field">
              <label className="label" htmlFor="stockQuantity">Quantidade em estoque</label>
              <input
                id="stockQuantity"
                type="number"
                className="form-input"
                value={stockQuantity}
                onChange={(event) => setStockQuantity(event.target.value)}
                placeholder="0"
              />
            </div>

            <div className="form-field full-width">
              <span className="label">Imagem do produto</span>

              <div className="product-image-uploader">
                <label className="product-image-dropzone" htmlFor="productImage">
                  <input
                    id="productImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  <span className="product-image-dropzone-icon">
                    <UploadCloud size={22} />
                  </span>

                  <span>
                    <strong>{imageFileName || 'Anexar imagem'}</strong>
                    <small>PNG, JPG ou WEBP direto do computador.</small>
                  </span>
                </label>

                {imageUrl ? (
                  <div className="product-image-preview-card">
                    <div className="product-image-preview">
                      <img src={imageUrl} alt="Prévia do produto" />
                    </div>

                    <button
                      type="button"
                      className="secondary-button small-button"
                      onClick={handleRemoveImage}
                    >
                      <X size={15} />
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="product-image-empty-preview">
                    <ImagePlus size={24} />
                    <span>Prévia da imagem</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-field full-width">
              <label className="label" htmlFor="description">Descrição</label>
              <textarea
                id="description"
                className="form-input"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descreva o produto"
              />
            </div>

            <div className="form-field full-width">
              <label className="label" htmlFor="whatsAppMessage">Mensagem do WhatsApp</label>
              <textarea
                id="whatsAppMessage"
                className="form-input"
                value={whatsAppMessage}
                onChange={(event) => setWhatsAppMessage(event.target.value)}
                placeholder="Olá! Tenho interesse neste produto."
              />
            </div>

            <div className="toggle-row">
              <div>
                <strong>Produto em destaque</strong>
                <p className="muted-text">Aparece com prioridade no catálogo.</p>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(event) => setIsFeatured(event.target.checked)}
              />
            </div>

            <div className="toggle-row">
              <div>
                <strong>Produto ativo</strong>
                <p className="muted-text">Se desativar, ele não aparece no catálogo.</p>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
              />
            </div>

            {isEditMode ? (
              <div className="toggle-row">
                <div>
                  <strong>Produto vendido</strong>
                  <p className="muted-text">Produto vendido sai do catálogo público.</p>
                </div>
                <input
                  type="checkbox"
                  checked={isSold}
                  onChange={(event) => setIsSold(event.target.checked)}
                />
              </div>
            ) : null}

            <div className="actions-row full-width">
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Salvando...'
                  : isEditMode
                    ? 'Salvar alterações'
                    : 'Cadastrar produto'}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate(ROUTE_PATHS.catalog)}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </PageCard>
    </div>
  )
}
