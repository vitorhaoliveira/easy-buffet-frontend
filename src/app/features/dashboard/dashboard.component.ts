import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink, Router } from '@angular/router'
import { EventService } from '@core/services/event.service'
import { DashboardCacheService } from '@core/services/dashboard-cache.service'
import { PageTitleService } from '@core/services/page-title.service'
import { InstallmentService } from '@core/services/installment.service'
import { ChecklistService } from '@core/services/checklist.service'
import { ReferenceDataCacheService } from '@core/services/reference-data-cache.service'
import { firstValueFrom } from 'rxjs'
import type { DashboardStats, DashboardEvent, Event, Unit, Package, EventChecklist } from '@shared/models/api.types'
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
  @ViewChild('recentEventsScroll') recentEventsScrollRef?: ElementRef<HTMLDivElement>

  private readonly dashboardCache = inject(DashboardCacheService)
  private readonly eventService = inject(EventService)
  private readonly installmentService = inject(InstallmentService)
  private readonly checklistService = inject(ChecklistService)
  private readonly referenceDataCache = inject(ReferenceDataCacheService)
  private readonly pageTitleService = inject(PageTitleService)
  private readonly router = inject(Router)

  stats: DashboardStats | null = null
  allEventsForCalendar: DashboardEvent[] = []
  recentEvents: Event[] = []
  packages: Package[] = []
  units: Unit[] = []
  upcomingChecklists: EventChecklist[] = []
  /** Progressive loading: metrics cards */
  isLoadingStats = true
  /** Progressive loading: recent events carousel */
  isLoadingRecent = true
  /** Progressive loading: calendar grid */
  isLoadingCalendar = true
  isLoadingChecklists = false
  error = ''
  
  // Calendar properties
  currentDate = new Date()
  calendarDays: CalendarDay[] = []
  monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  
  /** Set to true to show the calendar section on the dashboard */
  showCalendar = true

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
    this.pageTitleService.setTitle('Dashboard', 'Visão geral do seu negócio de buffet')
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
    this.isLoadingStats = true
    this.isLoadingRecent = true
    this.isLoadingCalendar = true
    try {
      const [stats, packagesResponse, unitsList] = await Promise.all([
        this.dashboardCache.getStatsWithSwr(fresh => {
          this.stats = { ...fresh }
          void this.applyOverdueInstallmentCountIfMissing()
        }),
        this.referenceDataCache.getPackagesResponse(),
        this.referenceDataCache.getUnitsList(true)
      ])

      this.stats = { ...stats }
      await this.applyOverdueInstallmentCountIfMissing()

      if (packagesResponse.success && packagesResponse.data) {
        this.packages = packagesResponse.data
      }

      this.units = unitsList
      this.isLoadingStats = false

      const [calendarEvents, recentEventsRaw] = await Promise.all([
        this.fetchEventsForCalendarMonth(this.currentDate),
        this.fetchRecentEventsForCarousel()
      ])

      this.allEventsForCalendar = calendarEvents.map(event => this.mapEventToDashboardEvent(event))
      this.recentEvents = recentEventsRaw

      this.isLoadingRecent = false
      this.isLoadingCalendar = false

      this.generateCalendar()

      await this.loadUpcomingChecklists()
    } catch (err: unknown) {
      console.error('Error loading dashboard:', err)
      this.error = 'Não foi possível conectar ao servidor. Usando dados de demonstração.'
      this.loadMockData()
    }
  }

  /**
   * @Function - applyOverdueInstallmentCountIfMissing
   * @description - Uses dashboard stats when API sends overdue count; otherwise requests total via pagination
   * @returns - Promise<void>
   */
  private async applyOverdueInstallmentCountIfMissing(): Promise<void> {
    if (!this.stats) return
    if (
      this.stats.overdueInstallments !== undefined
      && this.stats.overdueInstallments !== null
    ) {
      return
    }
    try {
      const res = await firstValueFrom(
        this.installmentService.getInstallmentsPaginated({ page: 1, limit: 1, status: 'overdue' })
      )
      if (res.success && res.pagination) {
        this.stats.overdueInstallments = res.pagination.total
        return
      }
    } catch {
      // fall through
    }
    try {
      const overdueResponse = await firstValueFrom(
        this.installmentService.getOverdueInstallments()
      )
      if (overdueResponse.success && overdueResponse.data) {
        this.stats.overdueInstallments = overdueResponse.data.length
      }
    } catch {
      // ignore
    }
  }

  /**
   * @Function - getMonthDateRangeISO
   * @description - Inclusive dateFrom/dateTo for the calendar month (YYYY-MM-DD) for API filters
   * @param - d: Date - Any day in the target month
   * @returns - { dateFrom: string; dateTo: string }
   */
  private getMonthDateRangeISO(d: Date): { dateFrom: string; dateTo: string } {
    const y = d.getFullYear()
    const m = d.getMonth()
    const dateFrom = `${y}-${String(m + 1).padStart(2, '0')}-01`
    const lastDay = new Date(y, m + 1, 0).getDate()
    const dateTo = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    return { dateFrom, dateTo }
  }

  /**
   * @Function - getTodayISODate
   * @description - Local calendar date as YYYY-MM-DD
   * @returns - string
   */
  private getTodayISODate(): string {
    const t = new Date()
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  }

  /**
   * @Function - addYearsToToday
   * @description - Local date string years from today
   * @param - years: number
   * @returns - string - YYYY-MM-DD
   */
  private addYearsToToday(years: number): string {
    const d = new Date()
    d.setFullYear(d.getFullYear() + years)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  /**
   * @Function - fetchEventsInDateRange
   * @description - Loads events with server-side date filters and pagination (bounded pages)
   * @param - dateFrom: string - YYYY-MM-DD
   * @param - dateTo: string - YYYY-MM-DD
   * @param - maxPages: number - Safety cap on pagination loops
   * @returns - Promise<Event[]>
   */
  private async fetchEventsInDateRange(
    dateFrom: string,
    dateTo: string,
    maxPages: number = 30
  ): Promise<Event[]> {
    const all: Event[] = []
    const limit = 100
    for (let page = 1; page <= maxPages; page++) {
      const res = await firstValueFrom(
        this.eventService.getEventsPaginated({ page, limit, dateFrom, dateTo })
      )
      if (!res.success || !res.data) break
      const list = Array.isArray(res.data) ? res.data : []
      all.push(...(list as Event[]))
      const totalPages = res.pagination?.totalPages ?? 1
      if (page >= totalPages) break
    }
    return all
  }

  /**
   * @Function - fetchEventsForCalendarMonth
   * @description - Events for a single visible calendar month (replaces loading all historical events)
   * @param - d: Date - Month to load
   * @returns - Promise<Event[]>
   */
  private async fetchEventsForCalendarMonth(d: Date): Promise<Event[]> {
    return this.dashboardCache.getCalendarMonthEventsWithSwr(d, ev => {
      this.allEventsForCalendar = ev.map(e => this.mapEventToDashboardEvent(e))
      this.generateCalendar()
    })
  }

  /**
   * @Function - buildRecentCarouselEvents
   * @description - Upcoming events within a one-year window, capped at 10 for the carousel
   * @returns - Promise<Event[]>
   */
  private async buildRecentCarouselEvents(): Promise<Event[]> {
    const dateFrom = this.getTodayISODate()
    const dateTo = this.addYearsToToday(1)
    const events = await this.fetchEventsInDateRange(dateFrom, dateTo, 5)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    return events
      .filter(event => {
        if (!event.eventDate) return false
        return parseDateIgnoringTimezone(event.eventDate) >= todayStart
      })
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, 10)
  }

  /**
   * @Function - fetchRecentEventsForCarousel
   * @description - Carousel events with stale-while-revalidate
   * @returns - Promise<Event[]>
   */
  private async fetchRecentEventsForCarousel(): Promise<Event[]> {
    return this.dashboardCache.getRecentCarouselEventsWithSwr(
      () => this.buildRecentCarouselEvents(),
      ev => {
        this.recentEvents = ev
      }
    )
  }

  /**
   * @Function - mapEventToDashboardEvent
   * @description - Maps full Event to calendar card shape
   * @param - event: Event
   * @returns - DashboardEvent
   */
  private mapEventToDashboardEvent(event: Event): DashboardEvent {
    return {
      id: event.id,
      clientName: event.client?.name || 'Cliente não informado',
      eventName: event.name,
      eventDate: event.eventDate,
      status: event.status,
      daysUntilEvent: this.getDaysUntil(event.eventDate),
      unit: event.unit
    }
  }

  /**
   * @Function - reloadCalendarForVisibleMonth
   * @description - Refetches events when the user changes the visible month
   * @returns - Promise<void>
   */
  private async reloadCalendarForVisibleMonth(): Promise<void> {
    this.isLoadingCalendar = true
    try {
      const events = await this.fetchEventsForCalendarMonth(this.currentDate)
      this.allEventsForCalendar = events.map(e => this.mapEventToDashboardEvent(e))
      this.generateCalendar()
    } catch (err: unknown) {
      console.error('Error loading calendar month:', err)
    } finally {
      this.isLoadingCalendar = false
    }
  }

  /**
   * @Function - loadUpcomingChecklists
   * @description - Load checklists for upcoming events (next 30 days) and enrich with event data
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  private async loadUpcomingChecklists(): Promise<void> {
    this.isLoadingChecklists = true
    try {
      const response = await firstValueFrom(
        this.checklistService.getUpcomingChecklists(30)
      )
      if (response.success && response.data) {
        this.upcomingChecklists = Array.isArray(response.data) ? response.data : []
        this.upcomingChecklists = this.upcomingChecklists.map(checklist => ({
          ...checklist,
          items: checklist.items || []
        }))
        const enrichmentPromises = this.upcomingChecklists.map(async (checklist) => {
          if (!checklist.event && checklist.eventId) {
            const event = this.allEventsForCalendar.find(e => e.id === checklist.eventId)
            if (event) {
              checklist.event = {
                id: event.id,
                name: event.eventName,
                eventDate: event.eventDate,
                client: { name: event.clientName }
              }
            } else {
              try {
                const eventResponse = await firstValueFrom(
                  this.eventService.getEventById(checklist.eventId)
                )
                if (eventResponse.success && eventResponse.data) {
                  const eventData = eventResponse.data
                  checklist.event = {
                    id: eventData.id,
                    name: eventData.name,
                    eventDate: eventData.eventDate,
                    client: eventData.client ? { name: eventData.client.name } : undefined
                  }
                }
              } catch (err: unknown) {
                console.error(`Error loading event ${checklist.eventId}:`, err)
              }
            }
          }
        })
        await Promise.all(enrichmentPromises)
      } else {
        this.upcomingChecklists = []
      }
    } catch (err: unknown) {
      console.error('Error loading upcoming checklists:', err)
      this.upcomingChecklists = []
    } finally {
      this.isLoadingChecklists = false
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

    // Mock events for calendar
    const mockEvent: DashboardEvent = {
      id: 'mock-event-1',
      clientName: 'Vitor Hugo Alves de Oliveira',
      eventName: 'Casamento Maria e Vitor',
      eventDate: new Date(2025, 10, 18).toISOString(),
      status: 'Pendente',
      daysUntilEvent: 26
    }
    this.allEventsForCalendar = [mockEvent]
    this.recentEvents = []
    this.isLoadingStats = false
    this.isLoadingRecent = false
    this.isLoadingCalendar = false
    this.generateCalendar()
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
    void this.reloadCalendarForVisibleMonth()
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
    void this.reloadCalendarForVisibleMonth()
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
   * @Function - getPackageName
   * @description - Get package name for event type label (same as events list)
   * @author - Vitor Hugo
   * @param - packageId: string | undefined
   * @returns - string
   */
  getPackageName(packageId: string | undefined): string {
    if (!packageId) return '-'
    const pkg = this.packages.find(p => p.id === packageId)
    return pkg?.name || '-'
  }

  /**
   * @Function - getEventTypeLabel
   * @description - Get type label for event card: package name or status
   * @author - Vitor Hugo
   * @param - event: Event
   * @returns - string
   */
  getEventTypeLabel(event: Event): string {
    const name = event.package?.name || this.getPackageName(event.packageId)
    if (name && name !== '-') return name
    return event.status
  }

  /**
   * @Function - getEventTypeEmoji
   * @description - Map event type/package name to emoji for card tag
   * @author - Vitor Hugo
   * @param - event: Event
   * @returns - string - Emoji character
   */
  getEventTypeEmoji(event: Event): string {
    const label = this.getEventTypeLabel(event).toLowerCase()
    if (label.includes('aniversário') || label.includes('aniversario')) return '🎂'
    if (label.includes('casamento')) return '💜'
    if (label.includes('15 anos') || label.includes('quinze')) return '👗'
    if (label.includes('formatura')) return '🎓'
    if (label.includes('confraternização') || label.includes('confraternizacao')) return '🎄'
    return '📅'
  }

  /**
   * @Function - getRecentEventCardStyle
   * @description - Dark background style for recent event card (unit color or fallback)
   * @author - Vitor Hugo
   * @param - event: Event
   * @param - index: number - Fallback color index when no unit color
   * @returns - string - CSS style
   */
  getRecentEventCardStyle(event: Event, index: number): string {
    if (event.unit?.color) {
      const color = event.unit.color.startsWith('#') ? event.unit.color : `#${event.unit.color}`
      return `background-color: ${color}; color: #fff;`
    }
    const fallbacks = ['#3d5a3d', '#1e3a5f', '#4a3d6b', '#5c4033', '#2d5a4a']
    const color = fallbacks[index % fallbacks.length]
    return `background-color: ${color}; color: #fff;`
  }

  /**
   * @Function - scrollRecentEvents
   * @description - Scroll the recent events carousel left or right
   * @author - Vitor Hugo
   * @param - direction: 'left' | 'right'
   * @returns - void
   */
  scrollRecentEvents(direction: 'left' | 'right'): void {
    const el = this.recentEventsScrollRef?.nativeElement
    if (!el) return
    const step = el.clientWidth * 0.8
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' })
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

  /**
   * @Function - getPendingItemsCount
   * @description - Count pending (not completed) items in a checklist
   * @author - Vitor Hugo
   * @param - checklist: EventChecklist
   * @returns - number
   */
  getPendingItemsCount(checklist: EventChecklist): number {
    if (!checklist.items || !Array.isArray(checklist.items)) return 0
    return checklist.items.filter(item => !item.isCompleted).length
  }

  /**
   * @Function - getOverdueItemsCount
   * @description - Count overdue items in a checklist
   * @author - Vitor Hugo
   * @param - checklist: EventChecklist
   * @returns - number
   */
  getOverdueItemsCount(checklist: EventChecklist): number {
    if (!checklist.items || !Array.isArray(checklist.items)) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return checklist.items.filter(item => {
      if (item.isCompleted || !item.scheduledDate) return false
      const scheduled = new Date(item.scheduledDate)
      scheduled.setHours(0, 0, 0, 0)
      return scheduled < today
    }).length
  }

  /**
   * @Function - getCriticalItemsCount
   * @description - Count critical priority items that are pending
   * @author - Vitor Hugo
   * @param - checklist: EventChecklist
   * @returns - number
   */
  getCriticalItemsCount(checklist: EventChecklist): number {
    if (!checklist.items || !Array.isArray(checklist.items)) return 0
    return checklist.items.filter(item => !item.isCompleted && item.priority === 'critical').length
  }

  /**
   * @Function - navigateToChecklist
   * @description - Navigate to the checklist page for an event
   * @author - Vitor Hugo
   * @param - eventId: string
   * @returns - void
   */
  navigateToChecklist(eventId: string): void {
    this.router.navigate(['/cadastros/eventos', eventId, 'checklist'])
  }

  /**
   * @Function - getChecklistStatusLabel
   * @description - Get Portuguese label for checklist status
   * @author - Vitor Hugo
   * @param - status: string
   * @returns - string
   */
  getChecklistStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'not_started': 'Não Iniciado',
      'in_progress': 'Em Progresso',
      'completed': 'Concluído'
    }
    return labels[status] || status
  }

  /**
   * @Function - getChecklistStatusColor
   * @description - Get CSS classes for checklist status badge
   * @author - Vitor Hugo
   * @param - status: string
   * @returns - string
   */
  getChecklistStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'not_started': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }
}
