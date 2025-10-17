export interface MonthlyReport {
  month: number
  year: number
  revenue: number
  expenses: number
  commissions: number
  netProfit: number
  paidInstallments: number
  totalInstallments: number
  commissionRate: number
}

export interface ReportInstallment {
  id: string
  contractId: string
  clientName: string
  eventName: string
  amount: number
  paymentDate: string
  commissionAmount: number
  commissionRate: number
}

export interface ReportCost {
  id: string
  eventName: string
  description: string
  amount: number
  category: 'food' | 'staff' | 'equipment' | 'transport' | 'other'
  createdAt: string
}

export interface ReportFilters {
  month: number
  year: number
}

export interface CSVExportData {
  revenue: ReportInstallment[]
  expenses: ReportCost[]
  summary: MonthlyReport
}
