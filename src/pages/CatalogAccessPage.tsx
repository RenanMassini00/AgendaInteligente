import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CatalogAccessPage() {
  const navigate = useNavigate()
  const [slug, setSlug] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!slug.trim()) return

    navigate(`/catalogo/${slug.trim().toLowerCase()}`)
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-single-panel">
          <div className="card-stack">
            <div className="card-heading">
              <div>
                <h2>Acessar catálogo público</h2>
                <p>Digite o identificador público da loja ou profissional.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-field">
                <label className="label" htmlFor="slug">Slug do catálogo</label>
                <input
                  id="slug"
                  className="form-input"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="ex: ti-infossini"
                />
              </div>

              <button type="submit" className="primary-button">
                Acessar catálogo
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}