import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, DollarSign, TrendingUp, TrendingDown, PieChart, Calendar, AlertCircle, CheckCircle, Clock, FileText, Printer, Download, Lock } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ReportService } from '@core/services/report.service'
import { ExportService } from '@shared/utils/export.service'
import { SkeletonComponent } from '@shared/components/ui/skeleton/skeleton.component'
import type { MonthlyReport } from '@shared/models/api.types'

@Component({
  selector: 'app-monthly-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    SkeletonComponent
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
  readonly LockIcon = Lock

  reportData: MonthlyReport | null = null
  isLoading = false
  error = ''

  selectedMonth: number
  selectedYear: number
  currentDate = new Date()

  // Expose Math to template
  Math = Math

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
    private readonly reportService: ReportService,
    private readonly exportService: ExportService
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
   * @description - Export monthly report data to PDF file with formatted tables
   * @author - Vitor Hugo
   * @returns - void
   */
  exportToPDF(): void {
    if (!this.reportData) {
      return
    }

    const { period, summary, kpis, contracts } = this.reportData

    // Table 1: Financial Summary
    const summaryTable = {
      title: 'Resumo Financeiro',
      headers: ['Indicador', 'Valor'],
      rows: [
        ['Receita Total', this.formatCurrency(summary.revenue)],
        ['Despesas', this.formatCurrency(summary.expenses)],
        ['Comissões', this.formatCurrency(summary.commissions)],
        ['Taxa Média de Comissão', this.formatPercentage(summary.commissionRate)],
        ['Lucro Líquido', this.formatCurrency(summary.netProfit)],
        ['Parcelas Pagas', `${summary.paidInstallments} de ${summary.totalInstallments}`]
      ]
    }

    // Table 2: KPIs - Revenue Distribution
    const kpisRevenueTable = {
      title: 'Distribuição de Receita',
      headers: ['Indicador', 'Valor', 'Quantidade'],
      rows: [
        ['Receita Realizada', this.formatCurrency(kpis.realizedRevenue), `${kpis.paidCount} parcelas`],
        ['Receita Pendente', this.formatCurrency(kpis.pendingRevenue), `${kpis.pendingCount} parcelas`],
        ['Receita em Atraso', this.formatCurrency(kpis.overdueRevenue), `${kpis.overdueCount} parcelas`],
        ['Receita Esperada (Total)', this.formatCurrency(kpis.expectedRevenue), `${kpis.totalCount} parcelas`]
      ]
    }

    // Add additional payments if available
    if (kpis.additionalPaymentsCount && kpis.additionalPaymentsCount > 0) {
      kpisRevenueTable.rows.push([
        'Pagamentos Adicionais',
        this.formatCurrency(kpis.additionalPaymentsTotal),
        `${kpis.additionalPaymentsCount} pagamento(s)`
      ])
    }

    // Table 3: KPIs - Performance Metrics
    const kpisPerformanceTable = {
      title: 'Métricas de Performance',
      headers: ['Indicador', 'Valor'],
      rows: [
        ['Taxa de Realização', this.formatPercentage(kpis.realizationRate)],
        ['Taxa de Atraso', this.formatPercentage(kpis.overdueRate)]
      ]
    }

    // Build tables array
    const tables = [summaryTable, kpisRevenueTable, kpisPerformanceTable]

    // Table 4: Contracts Summary (if available)
    if (contracts) {
      const contractsSummaryTable = {
        title: 'Resumo de Contratos',
        headers: ['Indicador', 'Quantidade'],
        rows: [
          ['Contratos Fechados no Mês', contracts.closedInMonth.toString()],
          ['Contratos Abertos', contracts.open.toString()]
        ]
      }
      tables.push(contractsSummaryTable)

      // Table 5: Events Detail (if available)
      if (contracts.withEventsInMonth && contracts.withEventsInMonth.length > 0) {
        const eventsTable = {
          title: 'Eventos Realizados no Mês',
          headers: ['Evento', 'Cliente', 'Data do Evento', 'Data de Fechamento'],
          rows: contracts.withEventsInMonth.map(event => [
            event.eventName,
            event.clientName,
            this.formatDate(event.eventDate),
            event.closedAt ? this.formatDate(event.closedAt) : 'Não fechado'
          ])
        }
        tables.push(eventsTable)
      }
    }

    const filename = `relatorio-mensal-${period.monthName.toLowerCase()}-${period.year}`

    this.exportService.exportToPDF({
      title: 'Relatório Mensal',
      subtitle: `${period.monthName} de ${period.year}`,
      tables,
      filename,
      orientation: 'portrait'
    })
  }

  /**
   * @Function - exportToExcel
   * @description - Export monthly report data to Excel file with multiple sheets
   * @author - Vitor Hugo
   * @returns - void
   */
  exportToExcel(): void {
    if (!this.reportData) {
      return
    }

    const { period, summary, kpis, contracts } = this.reportData

    // Sheet 1: Summary (Resumo)
    const summaryData = [
      ['RELATÓRIO MENSAL - RESUMO FINANCEIRO'],
      [''],
      ['Período', `${period.monthName} de ${period.year}`],
      [''],
      ['RESUMO FINANCEIRO'],
      ['Indicador', 'Valor'],
      ['Receita Total', this.formatCurrency(summary.revenue)],
      ['Despesas', this.formatCurrency(summary.expenses)],
      ['Comissões', this.formatCurrency(summary.commissions)],
      ['Taxa Média de Comissão', this.formatPercentage(summary.commissionRate)],
      ['Lucro Líquido', this.formatCurrency(summary.netProfit)],
      [''],
      ['PARCELAS'],
      ['Parcelas Pagas', summary.paidInstallments.toString()],
      ['Total de Parcelas', summary.totalInstallments.toString()]
    ]

    // Sheet 2: KPIs
    const kpisData = [
      ['INDICADORES DE PERFORMANCE (KPIs)'],
      [''],
      ['Período', `${period.monthName} de ${period.year}`],
      [''],
      ['DISTRIBUIÇÃO DE RECEITA'],
      ['Indicador', 'Valor', 'Quantidade'],
      ['Receita Realizada', this.formatCurrency(kpis.realizedRevenue), `${kpis.paidCount} parcelas`],
      ['Receita Pendente', this.formatCurrency(kpis.pendingRevenue), `${kpis.pendingCount} parcelas`],
      ['Receita em Atraso', this.formatCurrency(kpis.overdueRevenue), `${kpis.overdueCount} parcelas`],
      ['Receita Esperada (Total)', this.formatCurrency(kpis.expectedRevenue), `${kpis.totalCount} parcelas`],
      [''],
      ['TAXAS DE PERFORMANCE'],
      ['Indicador', 'Valor'],
      ['Taxa de Realização', this.formatPercentage(kpis.realizationRate)],
      ['Taxa de Atraso', this.formatPercentage(kpis.overdueRate)]
    ]

    // Add additional payments info if available
    if (kpis.additionalPaymentsCount && kpis.additionalPaymentsCount > 0) {
      kpisData.push([''])
      kpisData.push(['PAGAMENTOS ADICIONAIS'])
      kpisData.push(['Quantidade', kpis.additionalPaymentsCount.toString()])
      kpisData.push(['Total', this.formatCurrency(kpis.additionalPaymentsTotal)])
    }

    // Sheet 3: Events (Eventos)
    const eventsData: any[][] = [
      ['EVENTOS REALIZADOS NO MÊS'],
      [''],
      ['Período', `${period.monthName} de ${period.year}`],
      ['']
    ]

    if (contracts) {
      eventsData.push(['RESUMO DE CONTRATOS'])
      eventsData.push(['Contratos Fechados no Mês', contracts.closedInMonth.toString()])
      eventsData.push(['Contratos Abertos', contracts.open.toString()])
      eventsData.push([''])

      if (contracts.withEventsInMonth && contracts.withEventsInMonth.length > 0) {
        eventsData.push(['DETALHAMENTO DOS EVENTOS'])
        eventsData.push(['Evento', 'Cliente', 'Data do Evento', 'Data de Fechamento'])

        contracts.withEventsInMonth.forEach(event => {
          eventsData.push([
            event.eventName,
            event.clientName,
            this.formatDate(event.eventDate),
            event.closedAt ? this.formatDate(event.closedAt) : 'Não fechado'
          ])
        })
      } else {
        eventsData.push(['Nenhum evento realizado neste mês.'])
      }
    }

    const filename = `relatorio-mensal-${period.monthName.toLowerCase()}-${period.year}`

    this.exportService.exportToExcel({
      filename,
      sheets: [
        {
          sheetName: 'Resumo',
          data: summaryData,
          columnWidths: [35, 25]
        },
        {
          sheetName: 'KPIs',
          data: kpisData,
          columnWidths: [35, 25, 20]
        },
        {
          sheetName: 'Eventos',
          data: eventsData,
          columnWidths: [30, 25, 20, 20]
        }
      ]
    })
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

  /**
   * @Function - formatDate
   * @description - Format date string to Brazilian format
   * @author - Vitor Hugo
   * @param - dateString: string - ISO date string
   * @returns - string - Formatted date
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }
}

