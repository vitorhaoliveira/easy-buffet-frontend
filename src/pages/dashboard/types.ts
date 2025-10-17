export interface DashboardStats {
  upcomingInstallments7Days: number
  upcomingInstallments30Days: number
  overdueInstallments: number
  monthlyRevenue: number
  upcomingEvents: number
}

export interface UpcomingInstallment {
  id: string
  contractId: string
  clientName: string
  eventName: string
  amount: number
  dueDate: string
  status: 'pending' | 'overdue'
  daysUntilDue: number
}

export interface UpcomingEvent {
  id: string
  clientName: string
  eventName: string
  eventDate: string
  status: 'confirmed' | 'pending' | 'preparation'
  daysUntilEvent: number
}

export interface MonthlyEvolution {
  month: string
  year: number
  revenue: number
  expenses: number
  profit: number
}

export interface DashboardData {
  stats: DashboardStats
  upcomingInstallments: UpcomingInstallment[]
  upcomingEvents: UpcomingEvent[]
  monthlyEvolution: MonthlyEvolution[]
}
