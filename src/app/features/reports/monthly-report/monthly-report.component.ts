import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, DollarSign, TrendingUp, TrendingDown, PieChart, Calendar, AlertCircle, CheckCircle, Clock, FileText, Printer, Download } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ReportService } from '@core/services/report.service'
import type { MonthlyReport } from '@shared/models/api.types'

@Component({
  selector: 'app-monthly-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './monthly-report.component.html'
})
export class MonthlyReportComponent implements OnInit {
  // Lucide icons
  readonly DollarSignIcon = DollarSign
  readonly TrendingUpIcon = TrendingUp
  readonly TrendingDownIcon = TrendingDown
  readonly PieChartIcon = PieChart
  readonly CalendarIcon = Calendar
  readonly AlertCircleIcon = AlertCircle
  readonly CheckCircleIcon = CheckCircle
  readonly ClockIcon = Clock
  readonly FileTextIcon = FileText
  readonly PrinterIcon = Printer
  readonly DownloadIcon = Download

  reportData: MonthlyReport | null = null
  isLoading = false
  error = ''

  selectedMonth: number
  selectedYear: number
  currentDate = new Date()

  months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ]

  years: number[] = []

  constructor(
    private readonly reportService: ReportService
  ) {
    this.selectedMonth = this.currentDate.getMonth() + 1
    this.selectedYear = this.currentDate.getFullYear()
    this.generateYears()
  }

  /**
   * @Function - ngOnInit
   * @description - Initialize component and load report data
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async ngOnInit(): Promise<void> {
    await this.loadReport()
  }

  /**
   * @Function - generateYears
   * @description - Generate array of years for dropdown (5 years back, current year, 5 years forward)
   * @author - Vitor Hugo
   * @returns - void
   */
  private generateYears(): void {
    const currentYear = this.currentDate.getFullYear()
    this.years = []
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      this.years.push(i)
    }
  }

  /**
   * @Function - loadReport
   * @description - Load monthly report data from API
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadReport(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''

      const response = await firstValueFrom(
        this.reportService.getMonthlyReport({
          month: this.selectedMonth.toString(),
          year: this.selectedYear.toString()
        })
      )

      if (response.success && response.data) {
        this.reportData = response.data
      } else {
        this.error = 'Não foi possível carregar o relatório'
      }
    } catch (err: any) {
      console.error('Error loading monthly report:', err)
      this.error = err.error?.error?.message || 'Erro ao carregar relatório mensal'
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - printReport
   * @description - Print the current report using browser print
   * @author - Vitor Hugo
   * @returns - void
   */
  printReport(): void {
    window.print()
  }

  /**
   * @Function - exportToPDF
   * @description - Export report to PDF (placeholder implementation)
   * @author - Vitor Hugo
   * @returns - void
   */
  exportToPDF(): void {
    // TODO: Implement PDF export functionality
    alert('Funcionalidade de exportação para PDF será implementada em breve')
  }

  /**
   * @Function - exportToExcel
   * @description - Export report to Excel (placeholder implementation)
   * @author - Vitor Hugo
   * @returns - void
   */
  exportToExcel(): void {
    // TODO: Implement Excel export functionality
    alert('Funcionalidade de exportação para Excel será implementada em breve')
  }

  /**
   * @Function - formatCurrency
   * @description - Format number to Brazilian currency format
   * @author - Vitor Hugo
   * @param - value: number | undefined
   * @returns - string - Formatted currency string
   */
  formatCurrency(value: number | undefined): string {
    const numValue = value || 0
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue)
  }

  /**
   * @Function - formatPercentage
   * @description - Format number to percentage format
   * @author - Vitor Hugo
   * @param - value: number | undefined
   * @returns - string - Formatted percentage string
   */
  formatPercentage(value: number | undefined): string {
    const numValue = value || 0
    return `${numValue.toFixed(2)}%`
  }

  /**
   * @Function - getRealizationRateColor
   * @description - Get CSS class for realization rate based on value
   * @author - Vitor Hugo
   * @param - rate: number
   * @returns - string - CSS classes
   */
  getRealizationRateColor(rate: number): string {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  /**
   * @Function - getOverdueRateColor
   * @description - Get CSS class for overdue rate based on value
   * @author - Vitor Hugo
   * @param - rate: number
   * @returns - string - CSS classes
   */
  getOverdueRateColor(rate: number): string {
    if (rate <= 5) return 'text-green-600'
    if (rate <= 15) return 'text-yellow-600'
    return 'text-red-600'
  }

  /**
   * @Function - getProfitColor
   * @description - Get CSS class for profit value based on positive/negative
   * @author - Vitor Hugo
   * @param - profit: number
   * @returns - string - CSS classes
   */
  getProfitColor(profit: number): string {
    return profit >= 0 ? 'text-green-600' : 'text-red-600'
  }

  /**
   * @Function - getProfitIcon
   * @description - Get icon for profit based on positive/negative
   * @author - Vitor Hugo
   * @param - profit: number
   * @returns - typeof TrendingUpIcon | typeof TrendingDownIcon
   */
  getProfitIcon(profit: number): typeof TrendingUp | typeof TrendingDown {
    return profit >= 0 ? TrendingUp : TrendingDown
  }
}

