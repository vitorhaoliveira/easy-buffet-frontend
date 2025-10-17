import { type UpcomingInstallment, type UpcomingEvent, type MonthlyEvolution } from './types'

// Função para formatar moeda
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Função para formatar data
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

// Função para formatar data relativa (ex: "em 3 dias", "há 5 dias")
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Amanhã'
  if (diffDays === -1) return 'Ontem'
  if (diffDays > 0) return `Em ${diffDays} dias`
  if (diffDays < 0) return `Há ${Math.abs(diffDays)} dias`
  
  return formatDate(dateString)
}

// Função para obter parcelas próximas (7 dias)
export const getUpcomingInstallments7Days = (installments: UpcomingInstallment[]): UpcomingInstallment[] => {
  return installments
    .filter(installment => installment.daysUntilDue <= 7 && installment.daysUntilDue >= 0)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
}

// Função para obter parcelas próximas (30 dias)
export const getUpcomingInstallments30Days = (installments: UpcomingInstallment[]): UpcomingInstallment[] => {
  return installments
    .filter(installment => installment.daysUntilDue <= 30 && installment.daysUntilDue >= 0)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
}

// Função para obter parcelas atrasadas
export const getOverdueInstallments = (installments: UpcomingInstallment[]): UpcomingInstallment[] => {
  return installments
    .filter(installment => installment.status === 'overdue')
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
}

// Função para obter eventos próximos
export const getUpcomingEvents = (events: UpcomingEvent[]): UpcomingEvent[] => {
  return events
    .filter(event => event.daysUntilEvent <= 30)
    .sort((a, b) => a.daysUntilEvent - b.daysUntilEvent)
}

// Função para obter evolução mensal
export const getMonthlyEvolution = (evolution: MonthlyEvolution[]): MonthlyEvolution[] => {
  return evolution.slice(-6) // Últimos 6 meses
}

// Função para obter cor do status da parcela
export const getInstallmentStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Função para obter cor do status do evento
export const getEventStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800'
    case 'preparation':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Função para obter texto do status do evento
export const getEventStatusText = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return 'Confirmado'
    case 'preparation':
      return 'Preparação'
    case 'pending':
      return 'Pendente'
    default:
      return 'Desconhecido'
  }
}

// Função para calcular altura máxima do gráfico
export const getMaxChartValue = (evolution: MonthlyEvolution[]): number => {
  const maxRevenue = Math.max(...evolution.map(item => item.revenue))
  const maxExpenses = Math.max(...evolution.map(item => item.expenses))
  return Math.max(maxRevenue, maxExpenses)
}

// Função para calcular altura da barra do gráfico
export const getBarHeight = (value: number, maxValue: number, maxHeight: number = 180): number => {
  if (maxValue === 0) return 0
  const height = (value / maxValue) * maxHeight
  return Math.max(height, 2) // Altura mínima de 2px para barras muito pequenas
}
