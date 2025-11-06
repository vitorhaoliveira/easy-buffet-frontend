import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { DashboardService } from '@core/services/dashboard.service'
import { firstValueFrom } from 'rxjs'
import type { DashboardStats, DashboardInstallment, DashboardEvent } from '@shared/models/api.types'
import { parseDateIgnoringTimezone, formatDateBR, getDaysUntil, isSameDayAsDate } from '@shared/utils/date.utils'

interface CalendarDay {
  date: number
  events: DashboardEvent[]
  isCurrentMonth: boolean
  isToday: boolean
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null
  upcomingInstallments: DashboardInstallment[] = []
  upcomingEvents: DashboardEvent[] = []
  isLoading = true
  error = ''
  
  // Calendar properties
  currentDate = new Date()
  calendarDays: CalendarDay[] = []
  monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  
  // Pagination
  installmentsLimit = 5

  constructor(
    private readonly dashboardService: DashboardService
  ) {}

  /**
   * @Function - ngOnInit
   * @description - Load dashboard data on component initialization
   * @author - Vitor Hugo
   * @param - void
   * @returns - Promise<void>
   */
  async ngOnInit(): Promise<void> {
    await this.loadDashboardData()
    this.generateCalendar()
  }

  /**
   * @Function - loadDashboardData
   * @description - Load all dashboard data from API
   * @author - Vitor Hugo
   * @param - void
   * @returns - Promise<void>
   */
  private async loadDashboardData(): Promise<void> {
    try {
      // Load stats
      const statsResponse = await firstValueFrom(this.dashboardService.getStats())
      if (statsResponse.success && statsResponse.data) {
        const data = statsResponse.data
        this.stats = {
          ...data,
          monthlyRevenue: typeof data.monthlyRevenue === 'string' 
            ? parseFloat(data.monthlyRevenue) 
            : data.monthlyRevenue,
          totalRevenue: typeof data.totalRevenue === 'string'
            ? parseFloat(data.totalRevenue)
            : data.totalRevenue
        }
      } else {
        this.loadMockData()
      }

      // Load upcoming installments
      const installmentsResponse = await firstValueFrom(
        this.dashboardService.getUpcomingInstallments(this.installmentsLimit)
      )
      if (installmentsResponse.success && installmentsResponse.data) {
        this.upcomingInstallments = installmentsResponse.data
      }

      // Load upcoming events
      const eventsResponse = await firstValueFrom(
        this.dashboardService.getUpcomingEvents(10)
      )
      if (eventsResponse.success && eventsResponse.data) {
        this.upcomingEvents = eventsResponse.data as DashboardEvent[]
      }

    } catch (err: any) {
      console.error('Error loading dashboard:', err)
      this.error = 'Não foi possível conectar ao servidor. Usando dados de demonstração.'
      this.loadMockData()
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - loadMockData
   * @description - Load mock data for development
   * @author - Vitor Hugo
   * @param - void
   * @returns - void
   */
  private loadMockData(): void {
    this.stats = {
      upcomingInstallments7Days: 0,
      upcomingInstallments30Days: 0,
      overdueInstallments: 0,
      monthlyRevenue: 20000,
      upcomingEvents: 0
    }

    // Mock installments
    this.upcomingInstallments = Array(5).fill(null).map((_, i) => ({
      id: `mock-${i}`,
      contractId: 'mock-contract',
      clientName: 'Vitor Hugo Alves de Oliveira',
      eventName: 'Casamento Maria e Vitor',
      amount: '5000',
      dueDate: new Date(2026, 2 + i, 10).toISOString(),
      status: 'pending' as const,
      daysUntilDue: 139 + (i * 31)
    }))

    // Mock events
    this.upcomingEvents = [{
      id: 'mock-event-1',
      clientName: 'Vitor Hugo Alves de Oliveira',
      eventName: 'Casamento Maria e Vitor',
      eventDate: new Date(2025, 10, 18).toISOString(),
      status: 'Pendente',
      daysUntilEvent: 26
    }]
  }

  /**
   * @Function - generateCalendar
   * @description - Generate calendar days for current month
   * @author - Vitor Hugo
   * @param - void
   * @returns - void
   */
  private generateCalendar(): void {
    const year = this.currentDate.getFullYear()
    const month = this.currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    
    this.calendarDays = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      this.calendarDays.push({
        date: 0,
        events: [],
        isCurrentMonth: false,
        isToday: false
      })
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = date.toDateString() === today.toDateString()
      
      // Filter events for this day
      const dayEvents = this.upcomingEvents.filter(event => {
        return isSameDayAsDate(event.eventDate, date)
      })
      
      this.calendarDays.push({
        date: day,
        events: dayEvents,
        isCurrentMonth: true,
        isToday
      })
    }
  }

  /**
   * @Function - previousMonth
   * @description - Navigate to previous month
   * @author - Vitor Hugo
   * @param - void
   * @returns - void
   */
  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
    this.generateCalendar()
  }

  /**
   * @Function - nextMonth
   * @description - Navigate to next month
   * @author - Vitor Hugo
   * @param - void
   * @returns - void
   */
  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
    this.generateCalendar()
  }

  /**
   * @Function - getCurrentMonthYear
   * @description - Get formatted current month and year
   * @author - Vitor Hugo
   * @param - void
   * @returns - string - Formatted month and year
   */
  getCurrentMonthYear(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`
  }

  /**
   * @Function - formatCurrency
   * @description - Format currency value
   * @author - Vitor Hugo
   * @param - value: number | string | undefined
   * @returns - string - Formatted currency value
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
   * @description - Format date string ignoring timezone to prevent off-by-one day errors
   * @author - Vitor Hugo
   * @param - dateString: string
   * @returns - string - Formatted date
   */
  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }

  /**
   * @Function - getDaysUntil
   * @description - Calculate days until a date or return from installment/event, ignoring timezone
   * @author - Vitor Hugo
   * @param - dateString: string
   * @param - daysUntilDue: number | undefined - Days until due from installment or event
   * @returns - number - Days until date
   */
  getDaysUntil(dateString: string, daysUntilDue?: number): number {
    if (daysUntilDue !== undefined) {
      return daysUntilDue
    }
    
    return getDaysUntil(dateString)
  }

  /**
   * @Function - getDaysUntilEvent
   * @description - Get days until event from DashboardEvent object
   * @author - Vitor Hugo
   * @param - event: DashboardEvent
   * @returns - number - Days until event
   */
  getDaysUntilEvent(event: DashboardEvent): number {
    return event.daysUntilEvent ?? this.getDaysUntil(event.eventDate)
  }

  /**
   * @Function - translateStatus
   * @description - Translate status from English to Portuguese
   * @author - Vitor Hugo
   * @param - status: string
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
   * @description - Get status badge color
   * @author - Vitor Hugo
   * @param - status: string
   * @returns - string - CSS classes for status
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Pago': 'bg-green-100 text-green-800',
      'Atrasado': 'bg-red-100 text-red-800',
      'Confirmado': 'bg-green-100 text-green-800',
      'Preparação': 'bg-blue-100 text-blue-800',
      'Cancelado': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  /**
   * @Function - onInstallmentsLimitChange
   * @description - Update installments limit and reload data
   * @author - Vitor Hugo
   * @param - event: any
   * @returns - Promise<void>
   */
  async onInstallmentsLimitChange(event: any): Promise<void> {
    const target = event.target as HTMLSelectElement
    this.installmentsLimit = parseInt(target.value, 10)
    
    try {
      const response = await firstValueFrom(
        this.dashboardService.getUpcomingInstallments(this.installmentsLimit)
      )
      if (response.success && response.data) {
        this.upcomingInstallments = response.data
      }
    } catch (err) {
      console.error('Error loading installments:', err)
    }
  }
}
