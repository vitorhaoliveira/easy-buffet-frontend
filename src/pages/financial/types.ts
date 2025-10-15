export interface FinancialInstallment {
  id: string
  contractId: string
  clientName: string
  eventName: string
  eventDate: string
  installmentNumber: number
  totalInstallments: number
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  paymentDate?: string
  createdAt: string
}

export interface FinancialCost {
  id: string
  eventId: string
  eventName: string
  eventDate: string
  description: string
  amount: number
  category: 'food' | 'staff' | 'equipment' | 'transport' | 'other'
  createdAt: string
}

export interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  paidInstallments: number
  pendingInstallments: number
  overdueInstallments: number
}

export interface FinancialFilters {
  month: number
  year: number
  status?: 'pending' | 'paid' | 'overdue'
}

export type FinancialTab = 'income' | 'expenses' | 'summary'
