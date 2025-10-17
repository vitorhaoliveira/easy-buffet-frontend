import { type DashboardData, type DashboardStats, type UpcomingInstallment, type UpcomingEvent, type MonthlyEvolution } from './types'

// Função para gerar datas dinâmicas
const getDateInDays = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}


// Dados mock para parcelas próximas
export const mockUpcomingInstallments: UpcomingInstallment[] = [
  {
    id: '1',
    contractId: 'CT001',
    clientName: 'João Silva',
    eventName: 'Casamento João & Maria',
    amount: 2500.00,
    dueDate: getDateInDays(3),
    status: 'pending',
    daysUntilDue: 3
  },
  {
    id: '2',
    contractId: 'CT002',
    clientName: 'Ana Costa',
    eventName: 'Aniversário 50 anos',
    amount: 1800.00,
    dueDate: getDateInDays(7),
    status: 'pending',
    daysUntilDue: 7
  },
  {
    id: '3',
    contractId: 'CT003',
    clientName: 'Pedro Santos',
    eventName: 'Formatura Medicina',
    amount: 3200.00,
    dueDate: getDateInDays(15),
    status: 'pending',
    daysUntilDue: 15
  },
  {
    id: '4',
    contractId: 'CT004',
    clientName: 'Maria Oliveira',
    eventName: 'Batizado do Lucas',
    amount: 1200.00,
    dueDate: getDateInDays(22),
    status: 'pending',
    daysUntilDue: 22
  },
  {
    id: '5',
    contractId: 'CT005',
    clientName: 'Carlos Mendes',
    eventName: 'Festa de 15 anos da Sofia',
    amount: 2200.00,
    dueDate: getDateInDays(28),
    status: 'pending',
    daysUntilDue: 28
  },
  {
    id: '6',
    contractId: 'CT006',
    clientName: 'Fernanda Lima',
    eventName: 'Chá de Bebê',
    amount: 800.00,
    dueDate: getDateInDays(-5),
    status: 'overdue',
    daysUntilDue: -5
  },
  {
    id: '7',
    contractId: 'CT007',
    clientName: 'Roberto Alves',
    eventName: 'Aniversário de 60 anos',
    amount: 1500.00,
    dueDate: getDateInDays(-12),
    status: 'overdue',
    daysUntilDue: -12
  },
  {
    id: '8',
    contractId: 'CT008',
    clientName: 'Patricia Costa',
    eventName: 'Formatura de Direito',
    amount: 1800.00,
    dueDate: getDateInDays(35),
    status: 'pending',
    daysUntilDue: 35
  }
]

// Dados mock para eventos próximos
export const mockUpcomingEvents: UpcomingEvent[] = [
  {
    id: 'EV001',
    clientName: 'João Silva',
    eventName: 'Casamento João & Maria',
    eventDate: getDateInDays(5),
    status: 'confirmed',
    daysUntilEvent: 5
  },
  {
    id: 'EV002',
    clientName: 'Ana Costa',
    eventName: 'Aniversário 50 anos',
    eventDate: getDateInDays(12),
    status: 'preparation',
    daysUntilEvent: 12
  },
  {
    id: 'EV003',
    clientName: 'Pedro Santos',
    eventName: 'Formatura Medicina',
    eventDate: getDateInDays(18),
    status: 'confirmed',
    daysUntilEvent: 18
  },
  {
    id: 'EV004',
    clientName: 'Maria Oliveira',
    eventName: 'Batizado do Lucas',
    eventDate: getDateInDays(25),
    status: 'pending',
    daysUntilEvent: 25
  },
  {
    id: 'EV005',
    clientName: 'Carlos Mendes',
    eventName: 'Festa de 15 anos da Sofia',
    eventDate: getDateInDays(30),
    status: 'preparation',
    daysUntilEvent: 30
  },
  {
    id: 'EV006',
    clientName: 'Fernanda Lima',
    eventName: 'Chá de Bebê',
    eventDate: getDateInDays(45),
    status: 'confirmed',
    daysUntilEvent: 45
  }
]

// Dados mock para evolução mensal (últimos 6 meses)
export const mockMonthlyEvolution: MonthlyEvolution[] = [
  {
    month: 'Jul',
    year: 2024,
    revenue: 12500.00,
    expenses: 8200.00,
    profit: 4300.00
  },
  {
    month: 'Ago',
    year: 2024,
    revenue: 15200.00,
    expenses: 9800.00,
    profit: 5400.00
  },
  {
    month: 'Set',
    year: 2024,
    revenue: 13800.00,
    expenses: 9200.00,
    profit: 4600.00
  },
  {
    month: 'Out',
    year: 2024,
    revenue: 16800.00,
    expenses: 11200.00,
    profit: 5600.00
  },
  {
    month: 'Nov',
    year: 2024,
    revenue: 14200.00,
    expenses: 9600.00,
    profit: 4600.00
  },
  {
    month: 'Dez',
    year: 2024,
    revenue: 18900.00,
    expenses: 12800.00,
    profit: 6100.00
  }
]

// Função para calcular estatísticas do dashboard
export const calculateDashboardStats = (): DashboardStats => {
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const upcoming7Days = mockUpcomingInstallments.filter(installment => {
    const dueDate = new Date(installment.dueDate)
    return dueDate <= sevenDaysFromNow && installment.status === 'pending'
  }).length

  const upcoming30Days = mockUpcomingInstallments.filter(installment => {
    const dueDate = new Date(installment.dueDate)
    return dueDate <= thirtyDaysFromNow && installment.status === 'pending'
  }).length

  const overdue = mockUpcomingInstallments.filter(installment => 
    installment.status === 'overdue'
  ).length

  const upcomingEvents = mockUpcomingEvents.filter(event => {
    const eventDate = new Date(event.eventDate)
    return eventDate <= thirtyDaysFromNow
  }).length

  // Receita do mês atual (usando dados do último mês da evolução)
  const currentMonthRevenue = mockMonthlyEvolution[mockMonthlyEvolution.length - 1].revenue

  return {
    upcomingInstallments7Days: upcoming7Days,
    upcomingInstallments30Days: upcoming30Days,
    overdueInstallments: overdue,
    monthlyRevenue: currentMonthRevenue,
    upcomingEvents
  }
}

// Função para obter dados completos do dashboard
export const getDashboardData = (): DashboardData => {
  return {
    stats: calculateDashboardStats(),
    upcomingInstallments: mockUpcomingInstallments,
    upcomingEvents: mockUpcomingEvents,
    monthlyEvolution: mockMonthlyEvolution
  }
}
