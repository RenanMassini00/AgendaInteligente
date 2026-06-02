import { useEffect, useState } from 'react'
import PageCard from '../../components/ui/PageCard'
import SectionHeader from '../../components/ui/SectionHeader'
import { api } from '../../utils/api'
import type { AdminBilling } from '../../types/admin.types'

function getCurrentMonthValue() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function AdminBillingPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue())
  const [billings, setBillings] = useState<AdminBilling[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadBillings()
  }, [selectedMonth])

  async function loadBillings() {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const response = await api.get<AdminBilling[]>(
        `/api/admin/billing?month=${selectedMonth}`
      )

      setBillings(response)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as cobranças.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleMarkPaid(id: number) {
    try {
      setErrorMessage('')
      setSuccessMessage('')

      await api.patch(`/api/admin/billing/${id}/mark-paid`, {
        paymentMethod: 'manual',
      } as never)

      setSuccessMessage('Cobrança marcada como paga.')
      await loadBillings()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar a cobrança.'
      )
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Cobranças"
        description="Acompanhe a mensalidade das empresas."
        action={
          <div className="dashboard-top-actions">
            <input
              type="month"
              className="dashboard-filter-select"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            />
          </div>
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
      {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

      <PageCard className="table-card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Mês</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Pago em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="table-feedback">
                    Carregando cobranças...
                  </td>
                </tr>
              ) : billings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-feedback">
                    Nenhuma cobrança encontrada.
                  </td>
                </tr>
              ) : (
                billings.map((billing) => (
                  <tr key={billing.id}>
                    <td>{billing.companyName}</td>
                    <td>{billing.referenceMonth}</td>
                    <td>{billing.amountFormatted}</td>
                    <td>{billing.dueDate}</td>
                    <td>{billing.status}</td>
                    <td>{billing.paidAt || '-'}</td>
                    <td>
                      {billing.status !== 'paid' ? (
                        <button
                          type="button"
                          className="secondary-button small-button"
                          onClick={() => handleMarkPaid(billing.id)}
                        >
                          Marcar como pago
                        </button>
                      ) : (
                        <span className="soft-pill">Pago</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  )
}