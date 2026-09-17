import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react'

type ProductImageCarouselProps = {
  imageUrl?: string | null
  imageUrls?: string[] | null
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
  placeholder?: ReactNode
}

export default function ProductImageCarousel({
  imageUrl,
  imageUrls,
  alt,
  className = '',
  loading = 'lazy',
  placeholder = 'Sem imagem',
}: ProductImageCarouselProps) {
  const images = useMemo(() => {
    return Array.from(
      new Set([...(imageUrls ?? []), imageUrl ?? ''].filter((url) => url.trim().length > 0))
    )
  }, [imageUrl, imageUrls])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, Math.max(images.length - 1, 0)))
  }, [images.length])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
      if (event.key === 'ArrowLeft') setCurrentIndex((index) => Math.max(index - 1, 0))
      if (event.key === 'ArrowRight') {
        setCurrentIndex((index) => Math.min(index + 1, Math.max(images.length - 1, 0)))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [images.length, isOpen])

  function goToImage(index: number) {
    setCurrentIndex(Math.max(0, Math.min(index, images.length - 1)))
  }

  function renderArrow(direction: 'previous' | 'next') {
    if (images.length < 2) return null
    const isPrevious = direction === 'previous'
    const disabled = isPrevious ? currentIndex === 0 : currentIndex === images.length - 1

    return (
      <button
        type="button"
        className={`product-image-carousel-arrow ${isPrevious ? 'previous' : 'next'}`}
        onClick={(event) => {
          event.stopPropagation()
          goToImage(currentIndex + (isPrevious ? -1 : 1))
        }}
        disabled={disabled}
        aria-label={isPrevious ? 'Imagem anterior' : 'Próxima imagem'}
      >
        {isPrevious ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    )
  }

  return (
    <>
      <div className={`product-image-carousel ${className}`.trim()}>
        {images.length > 0 ? (
          <>
            <div
              role="button"
              tabIndex={0}
              className="product-image-carousel-main"
              onClick={() => setIsOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setIsOpen(true)
                }
              }}
              aria-label={`Abrir imagens de ${alt}`}
            >
              <img src={images[currentIndex]} alt={alt} loading={loading} />
              {renderArrow('previous')}
              {renderArrow('next')}
              {images.length > 1 ? (
                <span className="product-image-carousel-count">
                  <Images size={14} />
                  {currentIndex + 1}/{images.length}
                </span>
              ) : null}
            </div>

            {images.length > 1 ? (
              <div className="product-image-carousel-thumbnails" aria-label="Miniaturas das imagens">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    className={index === currentIndex ? 'active' : ''}
                    onClick={() => goToImage(index)}
                    aria-label={`Ver imagem ${index + 1}`}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="product-image-carousel-placeholder">{placeholder}</div>
        )}
      </div>

      {isOpen && images.length > 0
        ? createPortal(
        <div className="product-image-lightbox" role="dialog" aria-modal="true" aria-label={alt} onClick={() => setIsOpen(false)}>
          <div className="product-image-lightbox-content" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="product-image-lightbox-close"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar imagens"
            >
              <X size={22} />
            </button>
            <img src={images[currentIndex]} alt={alt} />
            {renderArrow('previous')}
            {renderArrow('next')}
            <span className="product-image-lightbox-counter">
              {currentIndex + 1} de {images.length}
            </span>
          </div>
        </div>,
        document.body
      )
        : null}
    </>
  )
}
