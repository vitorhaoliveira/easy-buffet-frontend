import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink, Router } from '@angular/router'
import { DashboardService } from '@core/services/dashboard.service'
import { EventService } from '@core/services/event.service'
import { UnitService } from '@core/services/unit.service'
import { firstValueFrom } from 'rxjs'
import type { DashboardStats, DashboardInstallment, DashboardEvent, Event, Unit } from '@shared/models/api.types'
import { parseDateIgnoringTimezone, formatDateBR, getDaysUntil, isSameDayAsDate } from '@shared/utils/date.utils'
import { EventDetailModalComponent } from '@shared/components/ui/event-detail-modal/event-detail-modal.component'
import { SkeletonComponent } from '@shared/components/ui/skeleton/skeleton.component'
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component'

interface CalendarDay {
  date: number
  events: DashboardEvent[]
  isCurrentMonth: boolean
  isToday: boolean
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EventDetailModalComponent, SkeletonComponent, EmptyStateComponent],
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService)
  private readonly eventService = inject(EventService)
  private readonly unitService = inject(UnitService)
  private readonly router = inject(Router)

  stats: DashboardStats | null = null
  upcomingInstallments: DashboardInstallment[] = []
  upcomingEvents: DashboardEvent[] = []
  allEventsForCalendar: DashboardEvent[] = []
  units: Unit[] = []
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

  // Event detail modal
  showEventModal = false
  selectedEvent: Event | null = null
  isLoadingEventDetails = false
  eventDetailsError: string | null = null

  /**
   * @Function - ngOnInit
   * @description - Load dashboard data on component initialization
   * @author - Vitor Hugo
   * @param - void
   * @returns - Promise<void>
   */
  async ngOnInit(): Promise<void> {
    await this.loadDashboardData()
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

      // Load upcoming events for list
      const eventsResponse = await firstValueFrom(
        this.dashboardService.getUpcomingEvents(10)
      )
      const upcomingEventsList: DashboardEvent[] = []
      if (eventsResponse.success && eventsResponse.data) {
        upcomingEventsList.push(...eventsResponse.data as DashboardEvent[])
      }

      // Load all events for calendar (including past events)
      const allEventsResponse = await firstValueFrom(
        this.eventService.getEvents()
      )
      if (allEventsResponse.success && allEventsResponse.data) {
        // Convert Event[] to DashboardEvent[] for calendar
        const allEvents = allEventsResponse.data.map(event => ({
          id: event.id,
          clientName: event.client?.name || 'Cliente não informado',
          eventName: event.name,
          eventDate: event.eventDate,
          status: event.status,
          daysUntilEvent: this.getDaysUntil(event.eventDate),
          unit: event.unit
        }))
        // Merge with upcoming events, avoiding duplicates
        const eventMap = new Map<string, DashboardEvent>()
        allEvents.forEach(event => eventMap.set(event.id, event))
        upcomingEventsList.forEach(event => eventMap.set(event.id, event))
        
        // Store all events for calendar (including past events)
        this.allEventsForCalendar = Array.from(eventMap.values())
        
        // Filter to show only future events in the list
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        this.upcomingEvents = this.allEventsForCalendar.filter(event => {
          const eventDate = parseDateIgnoringTimezone(event.eventDate)
          return eventDate >= today
        })
      } else {
        // Fallback to upcoming events only if all events request fails
        this.upcomingEvents = upcomingEventsList
      }

      // Load units for legend
      const unitsResponse = await firstValueFrom(
        this.unitService.getUnits(true)
      )
      if (unitsResponse.success && unitsResponse.data) {
        this.units = unitsResponse.data
      }

    } catch (err: unknown) {
      console.error('Error loading dashboard:', err)
      this.error = 'Não foi possível conectar ao servidor. Usando dados de demonstração.'
      this.loadMockData()
    } finally {
      this.isLoading = false
      // Regenerate calendar after loading all events
      this.generateCalendar()
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
    const mockEvent = {
      id: 'mock-event-1',
      clientName: 'Vitor Hugo Alves de Oliveira',
      eventName: 'Casamento Maria e Vitor',
      eventDate: new Date(2025, 10, 18).toISOString(),
      status: 'Pendente',
      daysUntilEvent: 26
    }
    this.upcomingEvents = [mockEvent]
    this.allEventsForCalendar = [mockEvent]
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
      
      // Filter events for this day (use all events for calendar, not just upcoming)
      const dayEvents = this.allEventsForCalendar.filter(event => {
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
   * @param - event: DOM Event
   * @returns - Promise<void>
   */
  async onInstallmentsLimitChange(event: unknown): Promise<void> {
    const domEvent = event as globalThis.Event
    const target = domEvent.target as HTMLSelectElement
    this.installmentsLimit = parseInt(target.value, 10)
    
    try {
      const response = await firstValueFrom(
        this.dashboardService.getUpcomingInstallments(this.installmentsLimit)
      )
      if (response.success && response.data) {
        this.upcomingInstallments = response.data
      }
    } catch (err: unknown) {
      console.error('Error loading installments:', err)
    }
  }

  /**
   * @Function - getEventColor
   * @description - Get event color from unit (always use unit color if available) - applies to background
   * @author - Vitor Hugo
   * @param - event: DashboardEvent
   * @returns - string - CSS style string with background color or empty string
   */
  getEventColor(event: DashboardEvent): string {
    if (event.unit?.color) {
      // Ensure color has # prefix if not present
      const color = event.unit.color.startsWith('#') ? event.unit.color : `#${event.unit.color}`
      // Apply unit color as background, white text, no border
      return `background-color: ${color} !important; color: #fff !important; border: none !important;`
    }
    // Return empty string - will use status color via getStatusColorStyle
    return ''
  }

  /**
   * @Function - getStatusColorStyle
   * @description - Get inline style for status color (fallback when no unit color)
   * @author - Vitor Hugo
   * @param - event: DashboardEvent
   * @returns - string - CSS style string with status-based background color
   */
  getStatusColorStyle(event: DashboardEvent): string {
    // Only use status color if no unit color
    if (event.unit?.color) {
      return ''
    }
    
    // Map status to color
    const statusColors: Record<string, string> = {
      'Pendente': '#fef3c7', // yellow-100
      'Confirmado': '#d1fae5', // green-100
      'Concluído': '#e9d5ff', // purple-100
      'Cancelado': '#f3f4f6', // gray-100
      'Preparação': '#dbeafe' // blue-100
    }
    
    const bgColor = statusColors[event.status] || '#f3f4f6'
    const textColor = event.status === 'Pendente' ? '#92400e' : 
      event.status === 'Confirmado' ? '#065f46' :
        event.status === 'Concluído' ? '#6b21a8' :
          event.status === 'Cancelado' ? '#374151' : '#1e40af'
    
    return `background-color: ${bgColor}; color: ${textColor};`
  }

  /**
   * @Function - getEventColorClasses
   * @description - Get CSS classes for event - always use base classes, color comes from style
   * @author - Vitor Hugo
   * @returns - string - CSS classes
   */
  getEventColorClasses(): string {
    // Always return base classes - color is applied via inline style
    // Remove any border classes to ensure unit color shows as background
    return 'text-xs px-2 py-1 rounded font-medium border-0'
  }

  /**
   * @Function - getUnitColor
   * @description - Get formatted unit color with # prefix if needed
   * @author - Vitor Hugo
   * @param - color: string | undefined
   * @returns - string - Formatted color
   */
  getUnitColor(color: string | undefined): string {
    if (!color) return '#6c757d'
    return color.startsWith('#') ? color : `#${color}`
  }

  /**
   * @Function - onEventClick
   * @description - Handle event click in calendar to show details
   * @author - Vitor Hugo
   * @param - event: DashboardEvent
   * @returns - Promise<void>
   */
  async onEventClick(event: DashboardEvent): Promise<void> {
    this.showEventModal = true
    this.selectedEvent = null
    this.isLoadingEventDetails = true
    this.eventDetailsError = null

    try {
      const response = await firstValueFrom(
        this.eventService.getEventById(event.id)
      )
      if (response.success && response.data) {
        this.selectedEvent = response.data
      } else {
        this.eventDetailsError = 'Não foi possível carregar os detalhes do evento'
      }
    } catch (err: unknown) {
      console.error('Error loading event details:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar detalhes do evento'
      this.eventDetailsError = errorMessage
    } finally {
      this.isLoadingEventDetails = false
    }
  }

  /**
   * @Function - closeEventModal
   * @description - Close event detail modal
   * @author - Vitor Hugo
   * @param - void
   * @returns - void
   */
  closeEventModal(): void {
    this.showEventModal = false
    this.selectedEvent = null
    this.eventDetailsError = null
  }

  /**
   * @Function - onEditEvent
   * @description - Navigate to event edit page
   * @author - Vitor Hugo
   * @param - void
   * @returns - void
   */
  onEditEvent(): void {
    if (this.selectedEvent) {
      this.router.navigate(['/cadastros/eventos/editar', this.selectedEvent.id])
      this.closeEventModal()
    }
  }
}
