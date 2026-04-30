import { useEffect, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { getCurrentUser, getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { AuthUser } from '../types/auth.types'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="muted-text strong">{label}</p>
      <div className="field-box">{value}</div>
    </div>
  )
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<AuthUser | null>(getCurrentUser())
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      try {
        setIsLoading(true)
        const response = await api.get<AuthUser>(`/api/profile?userId=${getCurrentUserId()}`)
        if (isMounted) {
          setProfile(response)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar o perfil.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading && !profile) {
    return <div className="feedback-card">Carregando perfil...</div>
  }

  if (errorMessage && !profile) {
    return <div className="feedback-card error-box">{errorMessage}</div>
  }

  if (!profile) {
    return <div className="feedback-card">Perfil não encontrado.</div>
  }

  return (
    <div className="page-stack">
      <SectionHeader title="Perfil" description="Informações principais do profissional." />
      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
      <PageCard>
        <div className="cards-grid two-cols">
          <Field label="Nome" value={profile.fullName} />
          <Field label="Negócio" value={profile.businessName || '-'} />
          <Field label="Especialidade" value={profile.specialty || '-'} />
          <Field label="E-mail" value={profile.email} />
          <Field label="Telefone" value={profile.phone || '-'} />
          <Field label="Fuso horário" value={profile.timezone} />
        </div>
      </PageCard>
    </div>
  )
}
