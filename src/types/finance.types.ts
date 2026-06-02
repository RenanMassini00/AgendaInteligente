export type FinanceDailyItem = {
  date: string
  amount: number
  amountFormatted: string
  appointmentsCount: number
}

export type FinanceAppointmentItem = {
  id: number
  clientName: string
  serviceName: string
  date: string
  time: string
  status: string
  amount: number
  amountFormatted: string
}

export type FinanceStatusTotal = {
  status: string
  label: string
  count: number
  amount: number
  amountFormatted: string
}

export type FinanceServiceTotal = {
  serviceName: string
  count: number
  amount: number
  amountFormatted: string
}

export type FinanceSummary = {
  month: string
  monthLabel: string
  receivedTotal: number
  receivedTotalFormatted: string
  forecastTotal: number
  forecastTotalFormatted: string
  appointmentsCount: number
  completedAppointmentsCount: number
  averageTicket: number
  averageTicketFormatted: string
  bestDayDate: string | null
  bestDayAmount: number
  bestDayAmountFormatted: string
  completionRate: number
  completionRateFormatted: string
  topServiceName: string | null
  dailyTotals: FinanceDailyItem[]
  statusTotals: FinanceStatusTotal[]
  serviceTotals: FinanceServiceTotal[]
  appointments: FinanceAppointmentItem[]
}