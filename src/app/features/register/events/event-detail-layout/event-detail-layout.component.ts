import { Component, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { LucideAngularModule, Calendar, User, ChevronDown } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'
import { Subject, takeUntil } from 'rxjs'

import { EventService } from '@core/services/event.service'
import { EventHubRefreshService } from '@core/services/event-hub-refresh.service'
import { PageTitleService } from '@core/services/page-title.service'
import type { Event, EventHubData, EventListItem } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-event-detail-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './event-detail-layout.component.html'
})
export class EventDetailLayoutComponent implements OnInit, OnDestroy {
  readonly CalendarIcon = Calendar
  readonly UserIcon = User
  readonly ChevronDownIcon = ChevronDown

  event: Event | null = null
  eventId: string = ''
  isLoading = true
  error = ''
  showEventDropdown = false
  eventsForDropdown: EventListItem[] = []
  isLoadingEvents = false
  private destroy$ = new Subject<void>()

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private eventHubRefresh: EventHubRefreshService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit(): void {
    this.eventHubRefresh.refresh$
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        if (id === this.eventId) {
          void this.loadEvent()
        }
      })

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(async (params) => {
      const id = params.get('eventId') || ''
      if (!id) {
        this.error = 'ID do evento não informado'
        this.isLoading = false
        return
      }
      this.eventId = id
      this.event = null
      this.error = ''
      this.isLoading = true
      await this.loadEvent()
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  /**
   * @Function - yieldToBrowserPaint
   * @description - Lets the loading UI commit before resolver data is applied (avoids sub-frame flash)
   * @returns - Promise<void>
   */
  private yieldToBrowserPaint(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  }

  /**
   * @Function - loadEvent
   * @description - Loads event data for the hub header
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadEvent(): Promise<void> {
    try {
      await this.yieldToBrowserPaint()
      const hubData = this.route.snapshot.data['eventHub'] as EventHubData | null
      if (this.isLoading && hubData?.event) {
        this.event = hubData.event
        this.pageTitleService.setTitle('Eventos', '')
        return
      }
      const response = await firstValueFrom(
        this.eventService.getEventHub(this.eventId, { includeReferenceLists: false })
      )
      if (response.success && response.data?.event) {
        this.event = response.data.event
        this.pageTitleService.setTitle('Eventos', '')
        return
      }
      const fallback = await firstValueFrom(this.eventService.getEventById(this.eventId))
      if (fallback.success && fallback.data) {
        this.event = fallback.data
        this.pageTitleService.setTitle('Eventos', '')
      } else {
        this.error = 'Evento não encontrado'
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar evento'
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - formatDate
   * @description - Formats date to Brazilian format
   * @author - Vitor Hugo
   * @param - dateString: string
   * @returns - string
   */
  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      Pendente: 'bg-yellow-100 text-yellow-800',
      Confirmado: 'bg-green-100 text-green-800',
      Concluído: 'bg-blue-100 text-blue-800',
      Cancelado: 'bg-red-100 text-red-800'
    }
    return map[status] || 'bg-gray-100 text-gray-800'
  }

  /**
   * @Function - toggleEventDropdown
   * @description - Opens or closes the event selector dropdown and loads events when opening
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async toggleEventDropdown(): Promise<void> {
    this.showEventDropdown = !this.showEventDropdown
    if (this.showEventDropdown && this.eventsForDropdown.length === 0 && !this.isLoadingEvents) {
      await this.loadEventsForDropdown()
    }
  }

  /**
   * @Function - loadEventsForDropdown
   * @description - Loads a paginated list of events for the event selector
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadEventsForDropdown(): Promise<void> {
    this.isLoadingEvents = true
    try {
      const response = await firstValueFrom(
        this.eventService.getEventsPaginated({ limit: 100, page: 1, view: 'list' })
      )
      if (response.success && response.data) {
        this.eventsForDropdown = response.data as EventListItem[]
      }
    } catch {
      this.eventsForDropdown = []
    } finally {
      this.isLoadingEvents = false
    }
  }

  /**
   * @Function - getCurrentTab
   * @description - Returns the current tab path (dados, pagamentos, equipe, checklist) to preserve when switching event
   * @author - Vitor Hugo
   * @returns - string
   */
  getCurrentTab(): string {
    const firstChild = this.route.firstChild
    const path = firstChild?.snapshot.url[0]?.path
    return path && ['dados', 'pagamentos', 'equipe', 'checklist'].includes(path) ? path : 'dados'
  }

  /**
   * @Function - selectEvent
   * @description - Navigates to the selected event hub keeping the current tab
   * @author - Vitor Hugo
   * @param - ev: Event
   * @returns - void
   */
  selectEvent(ev: EventListItem): void {
    this.showEventDropdown = false
    if (ev.id === this.eventId) return
    const tab = this.getCurrentTab()
    this.router.navigate(['/cadastros/eventos/visualizar', ev.id, tab])
  }

  /**
   * @Function - closeEventDropdown
   * @description - Closes the event selector dropdown (e.g. when clicking outside)
   * @author - Vitor Hugo
   * @returns - void
   */
  closeEventDropdown(): void {
    this.showEventDropdown = false
  }
}
