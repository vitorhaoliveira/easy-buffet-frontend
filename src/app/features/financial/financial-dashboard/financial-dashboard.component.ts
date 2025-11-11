import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { LucideAngularModule, TrendingUp, TrendingDown, Clock, DollarSign, AlertCircle, Calendar } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { DashboardService } from '@core/services/dashboard.service'
import { 
  TableComponent,
  TableHeaderComponent,
  TableBodyComponent,
  TableRowComponent,
  TableHeadComponent,
  TableCellComponent
} from '@shared/components/ui/table/table.component'
import { ButtonComponent } from '@shared/components/ui/button/button.component'
import type { DashboardStats, DashboardInstallment, MonthlyEvolution } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-financial-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    TableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent,
    ButtonComponent
  ],
  templateUrl: './financial-dashboard.component.html'
})
export class FinancialDashboardComponent implements OnInit {
  readonly TrendingUpIcon = TrendingUp
  readonly TrendingDownIcon = TrendingDown
  readonly ClockIcon = Clock
  readonly DollarSignIcon = DollarSign
  readonly AlertCircleIcon = AlertCircle
  readonly CalendarIcon = Calendar

  stats: DashboardStats | null = null
  upcomingInstallments: DashboardInstallment[] = []
  monthlyEvolution: MonthlyEvolution[] = []
  isLoading = true
  error = ''

  constructor(
    private readonly dashboardService: DashboardService
  ) {}

  /**
   * @Function - ngOnInit
   * @description - Initialize component and load dashboard data
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async ngOnInit(): Promise<void> {
    await this.loadDashboardData()
  }

  /**
   * @Function - loadDashboardData
   * @description - Load all financial dashboard data from API
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  private async loadDashboardData(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''

      // Load stats
      const statsResponse = await firstValueFrom(this.dashboardService.getStats())
      if (statsResponse.success && statsResponse.data) {
        this.stats = statsResponse.data
      }

      // Load upcoming installments
      const installmentsResponse = await firstValueFrom(
        this.dashboardService.getUpcomingInstallments(10)
      )
      if (installmentsResponse.success && installmentsResponse.data) {
        this.upcomingInstallments = installmentsResponse.data
      }

      // Load monthly evolution
      const evolutionResponse = await firstValueFrom(
        this.dashboardService.getMonthlyEvolution()
      )
      if (evolutionResponse.success && evolutionResponse.data) {
        this.monthlyEvolution = evolutionResponse.data
      }

    } catch (err: any) {
      console.error('Error loading financial dashboard:', err)
      this.error = err.message || 'Erro ao carregar dados do dashboard financeiro'
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - formatCurrency
   * @description - Format number to Brazilian currency format
   * @author - Vitor Hugo
   * @param - value: number | string | undefined - Value to format
   * @returns - string - Formatted currency string
   */
  formatCurrency(value: number | string | undefined): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : (value || 0)
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue)
  }

  /**
   * @Function - formatDate
   * @description - Format date string to Brazilian format
   * @author - Vitor Hugo
   * @param - dateString: string - Date string to format
   * @returns - string - Formatted date string
   */
  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }

  /**
   * @Function - translateStatus
   * @description - Translate installment status to Portuguese
   * @author - Vitor Hugo
   * @param - status: string - Status to translate
   * @returns - string - Translated status
   */
  translateStatus(status: string): string {
    const translations: Record<string, string> = {
      'pending': 'Pendente',
      'paid': 'Pago',
      'overdue': 'Atrasado'
    }
    return translations[status] || status
  }

  /**
   * @Function - getStatusColor
   * @description - Get CSS classes for status badge
   * @author - Vitor Hugo
   * @param - status: string - Installment status
   * @returns - string - CSS classes
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  /**
   * @Function - getMaxValue
   * @description - Get maximum value from monthly evolution data for chart scaling
   * @author - Vitor Hugo
   * @returns - number - Maximum value
   */
  getMaxValue(): number {
    if (!this.monthlyEvolution.length) return 0
    
    const values = this.monthlyEvolution.flatMap(item => [
      typeof item.revenue === 'string' ? parseFloat(item.revenue) : item.revenue,
      typeof item.expenses === 'string' ? parseFloat(item.expenses) : item.expenses,
      typeof item.profit === 'string' ? parseFloat(item.profit) : item.profit
    ])
    
    return Math.max(...values, 0)
  }

  /**
   * @Function - getBarHeight
   * @description - Calculate bar height percentage for chart
   * @author - Vitor Hugo
   * @param - value: number | string - Value to calculate height for
   * @returns - number - Height percentage
   */
  getBarHeight(value: number | string): number {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    const maxValue = this.getMaxValue()
    return maxValue > 0 ? (numValue / maxValue) * 100 : 0
  }
}


