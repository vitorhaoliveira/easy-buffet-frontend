import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, CalendarDays, Plus, Trash2 } from 'lucide-angular'
import { firstValueFrom, Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators'

import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component'
import { FabComponent } from '@shared/components/ui/fab/fab.component'
import { SearchBarComponent } from '@shared/components/ui/search-bar/search-bar.component'
import { SkeletonComponent } from '@shared/components/ui/skeleton/skeleton.component'
import { EventService, GetEventsParams } from '@core/services/event.service'
import { PageTitleService } from '@core/services/page-title.service'
import { ReferenceDataCacheService } from '@core/services/reference-data-cache.service'
import type { EventListItem, Client, Package, Unit, PaginationInfo } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ConfirmationModalComponent,
    EmptyStateComponent,
    FabComponent,
    SearchBarComponent,
    SkeletonComponent
  ],
  templateUrl: './events-list.component.html'
})
export class EventsListComponent implements OnInit, OnDestroy {
  readonly CalendarDaysIcon = CalendarDays
  readonly PlusIcon = Plus
  readonly Trash2Icon = Trash2

  events: EventListItem[] = []
  clients: Client[] = []
  packages: Package[] = []
  units: Unit[] = []
  searchTerm: string = ''
  filterStatus: string = 'todos'
  filterUnitId: string = ''
  isLoading: boolean = true
  error: string = ''
  showDeleteModal: boolean = false
  eventToDelete: EventListItem | null = null
  isDeleting: boolean = false

  /** Pagination: backend returns page, limit, total, totalPages */
  page: number = 1
  limit: number = 20
  pagination: PaginationInfo | null = null

  private readonly searchTrigger$ = new Subject<string>()
  private readonly destroy$ = new Subject<void>()

  constructor(
    private eventService: EventService,
    private referenceDataCache: ReferenceDataCacheService,
    private pageTitleService: PageTitleService
  ) {}

  async ngOnInit(): Promise<void> {
    this.pageTitleService.setTitle('Eventos', '')
    this.searchTrigger$
      .pipe(
        debounceTime(400),
        map((value: string) => value.trim()),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.page = 1
        void this.loadData()
      })
    await this.loadData()
  }

  /**
   * @Function - ngOnDestroy
   * @description - Completes subscriptions to avoid memory leaks
   * @author - Vitor Hugo
   * @returns - void
   */
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  /**
   * @Function - onSearchChange
   * @description - Emits search text for debounced server-side reload
   * @author - Vitor Hugo
   * @param - value: string - Raw search input
   * @returns - void
   */
  onSearchChange(value: string): void {
    this.searchTrigger$.next(value)
  }

  async loadData(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''

      const search = this.searchTerm.trim()
      const params: GetEventsParams = {
        page: this.page,
        limit: this.limit,
        unitId: this.filterUnitId || undefined,
        status: this.filterStatus !== 'todos' ? this.filterStatus : undefined,
        search: search || undefined,
        view: 'list'
      }
      const [eventsResponse, clientsList, packagesResponse, unitsList] = await Promise.all([
        firstValueFrom(this.eventService.getEventsPaginated(params)),
        this.referenceDataCache.getClientsList(),
        this.referenceDataCache.getPackagesResponse(),
        this.referenceDataCache.getUnitsList(true)
      ])

      if (eventsResponse.success && eventsResponse.data) {
        this.events = eventsResponse.data as EventListItem[]
        this.pagination = eventsResponse.pagination ?? null
      } else {
        this.error = 'Erro ao carregar eventos'
        this.pagination = null
      }

      this.clients = clientsList

      if (packagesResponse.success && packagesResponse.data) {
        this.packages = packagesResponse.data
      }

      this.units = unitsList
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar dados'
      this.pagination = null
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - setPage
   * @description - Changes current page and reloads events
   * @author - Vitor Hugo
   * @param - p: number - Page number (1-based)
   * @returns - Promise<void>
   */
  async setPage(p: number): Promise<void> {
    if (p < 1 || (this.pagination && p > this.pagination.totalPages)) return
    this.page = p
    await this.loadData()
  }

  /**
   * @Function - onUnitFilterChange
   * @description - Handles unit filter change, resets to page 1 and reloads events
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async onUnitFilterChange(): Promise<void> {
    this.page = 1
    await this.loadData()
  }

  /**
   * @Function - onStatusFilterChange
   * @description - Handles status filter change, resets to page 1 and reloads events
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async onStatusFilterChange(): Promise<void> {
    this.page = 1
    await this.loadData()
  }

  /**
   * @Function - handleDeleteClick
   * @description - Initiates the delete process by opening the confirmation modal and clearing previous errors
   * @author - Vitor Hugo
   * @param - event: Event - The event to be deleted
   * @returns - void
   */
  handleDeleteClick(event: EventListItem): void {
    this.eventToDelete = event
    this.showDeleteModal = true
    this.error = '' // Clear previous errors
  }

  /**
   * @Function - handleConfirmDelete
   * @description - Handles the confirmation of event deletion with proper error handling for dependency constraints
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmDelete(): Promise<void> {
    if (!this.eventToDelete) return

    try {
      this.isDeleting = true
      const response = await firstValueFrom(
        this.eventService.deleteEvent(this.eventToDelete.id)
      )
      if (response.success) {
        this.events = this.events.filter(event => event.id !== this.eventToDelete!.id)
        this.showDeleteModal = false
        this.eventToDelete = null
        await this.loadData()
      } else {
        // Handle error from response when success is false
        this.error = response.message || response.errors?.[0] || 'Erro ao excluir evento'
        this.showDeleteModal = false
        this.eventToDelete = null
      }
    } catch (err: any) {
      // Extract error message from HTTP error response
      if (err.error?.error?.message) {
        // Backend returned structured error with error.error.message
        this.error = err.error.error.message
      } else if (err.error?.message) {
        // Backend returned error with error.message
        this.error = err.error.message
      } else if (err.message) {
        // Generic error message
        this.error = err.message
      } else {
        // Fallback error message
        this.error = 'Erro ao excluir evento'
      }
      // Close modal to show error message clearly
      this.showDeleteModal = false
      this.eventToDelete = null
    } finally {
      this.isDeleting = false
    }
  }

  handleCancelDelete(): void {
    this.showDeleteModal = false
    this.eventToDelete = null
  }

  getClientName(clientId: string): string {
    const client = this.clients.find(c => c.id === clientId)
    return client?.name || 'Cliente não encontrado'
  }

  getPackageName(packageId: string | undefined): string {
    if (!packageId) return '-'
    const pkg = this.packages.find(p => p.id === packageId)
    return pkg?.name || '-'
  }

  /**
   * @Function - getPackageDisplayName
   * @description - Uses packageName from view=list when present; otherwise resolves via cache
   * @param - event: EventListItem
   * @returns - string
   */
  getPackageDisplayName(event: EventListItem): string {
    const fromApi = event.packageName?.trim()
    if (fromApi) return fromApi
    return this.getPackageName(event.packageId ?? undefined)
  }

  /**
   * @Function - getCardSubtitleLabel
   * @description - Package name for card eyebrow, or status when no package label
   * @param - event: EventListItem
   * @returns - string
   */
  getCardSubtitleLabel(event: EventListItem): string {
    const p = this.getPackageDisplayName(event)
    return p !== '-' ? p : event.status
  }

  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Confirmado':
        return 'bg-green-100 text-green-800'
      case 'Agendado':
        return 'bg-blue-100 text-blue-800'
      case 'Concluído':
        return 'bg-gray-100 text-gray-800'
      case 'Cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  /**
   * @Function - getUnitName
   * @description - Gets the unit name from an event
   * @author - Vitor Hugo
   * @param - event: Event - The event to get unit from
   * @returns - string
   */
  getUnitName(event: EventListItem): string | null {
    if (event.unit) {
      return event.unit.code || event.unit.name
    }
    return null
  }

  /**
   * @Function - getUnitColor
   * @description - Gets the unit color from an event
   * @author - Vitor Hugo
   * @param - event: Event - The event to get unit color from
   * @returns - string
   */
  getUnitColor(event: EventListItem): string {
    return event.unit?.color || '#6c757d'
  }

  /**
   * @Function - getCardAccentColor
   * @description - Returns accent color for event card (thin top bar) by status
   * @author - Vitor Hugo
   * @param - event: Event
   * @returns - string - CSS color
   */
  getCardAccentColor(event: EventListItem): string {
    if (event.unit?.color) return event.unit.color
    switch (event.status) {
      case 'Confirmado':
        return '#22c55e'
      case 'Pendente':
        return '#eab308'
      case 'Concluído':
        return '#3b82f6'
      case 'Cancelado':
        return '#ef4444'
      default:
        return '#8b5cf6'
    }
  }
}

