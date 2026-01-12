import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { LucideAngularModule, TrendingUp, TrendingDown, Clock, DollarSign, AlertCircle, Calendar } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'
import { NgApexchartsModule } from 'ng-apexcharts'
import type { ApexOptions } from 'ng-apexcharts'

import { DashboardService } from '@core/services/dashboard.service'
import { InstallmentService } from '@core/services/installment.service'
import { 
  TableComponent,
  TableHeaderComponent,
  TableBodyComponent,
  TableRowComponent,
  TableHeadComponent,
  TableCellComponent
} from '@shared/components/ui/table/table.component'
import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { SkeletonComponent } from '@shared/components/ui/skeleton/skeleton.component'
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component'
import { MobileCardComponent } from '@shared/components/ui/mobile-card/mobile-card.component'
import type { DashboardStats, DashboardInstallment, MonthlyEvolution } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-financial-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    NgApexchartsModule,
    TableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent,
    ButtonComponent,
    SkeletonComponent,
    EmptyStateComponent,
    MobileCardComponent
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

  chartOptions: ApexOptions = {
    series: [],
    chart: {
      type: 'bar',
      height: 380,
      fontFamily: 'Inter, system-ui, sans-serif',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '70%',
        borderRadius: 8,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: [],
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value: number) => {
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(value)
        }
      }
    },
    colors: ['#22c55e', '#ef4444', '#3b82f6'],
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value: number) => {
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(value)
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '14px'
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false
        }
      }
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '90%'
            }
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  }

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly installmentService: InstallmentService
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

      // Load overdue installments count
      const overdueResponse = await firstValueFrom(
        this.installmentService.getOverdueInstallments()
      )
      if (overdueResponse.success && overdueResponse.data) {
        const overdueCount = (overdueResponse.data as any[]).length
        if (this.stats) {
          this.stats.overdueInstallments = overdueCount
        }
      }

      // Load monthly evolution
      await this.loadMonthlyEvolution()

    } catch (err: any) {
      console.error('Error loading financial dashboard:', err)
      this.error = err.message || 'Erro ao carregar dados do dashboard financeiro'
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - loadMonthlyEvolution
   * @description - Load monthly evolution data for specified number of months
   * @author - Vitor Hugo
   * @param - months: number - Number of months to fetch (default: 12)
   * @returns - Promise<void>
   */
  async loadMonthlyEvolution(months: number = 12): Promise<void> {
    try {
      const evolutionResponse = await firstValueFrom(
        this.dashboardService.getMonthlyEvolution(months)
      )
      if (evolutionResponse.success && evolutionResponse.data) {
        this.monthlyEvolution = evolutionResponse.data
        this.updateChart()
      }
    } catch (err: any) {
      console.error('Error loading monthly evolution:', err)
      throw err
    }
  }

  /**
   * @Function - updateChart
   * @description - Update chart data with monthly evolution values
   * @author - Vitor Hugo
   * @returns - void
   */
  private updateChart(): void {
    if (!this.monthlyEvolution.length) return

    const categories = this.monthlyEvolution.map(
      m => `${m.month} ${m.year}`
    )

    const revenueData = this.monthlyEvolution.map(m =>
      typeof m.revenue === 'string' ? parseFloat(m.revenue) : m.revenue
    )

    const expensesData = this.monthlyEvolution.map(m =>
      typeof m.expenses === 'string' ? parseFloat(m.expenses) : m.expenses
    )

    const profitData = this.monthlyEvolution.map(m =>
      typeof m.profit === 'string' ? parseFloat(m.profit) : m.profit
    )

    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          name: 'Receita',
          data: revenueData
        },
        {
          name: 'Despesas',
          data: expensesData
        },
        {
          name: 'Lucro',
          data: profitData
        }
      ],
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: categories
      }
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
}


