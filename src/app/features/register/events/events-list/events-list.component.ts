import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, Plus, Trash2 } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'
import { EventService, GetEventsParams } from '@core/services/event.service'
import { PageTitleService } from '@core/services/page-title.service'
import { ClientService } from '@core/services/client.service'
import { PackageService } from '@core/services/package.service'
import { UnitService } from '@core/services/unit.service'
import type { Event, Client, Package, Unit, PaginationInfo } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ConfirmationModalComponent
  ],
  templateUrl: './events-list.component.html'
})
export class EventsListComponent implements OnInit {
  readonly PlusIcon = Plus
  readonly Trash2Icon = Trash2

  events: Event[] = []
  clients: Client[] = []
  packages: Package[] = []
  units: Unit[] = []
  searchTerm: string = ''
  filterStatus: string = 'todos'
  filterUnitId: string = ''
  isLoading: boolean = true
  error: string = ''
  showDeleteModal: boolean = false
  eventToDelete: Event | null = null
  isDeleting: boolean = false

  /** Pagination: backend returns page, limit, total, totalPages */
  page: number = 1
  limit: number = 20
  pagination: PaginationInfo | null = null

  constructor(
    private eventService: EventService,
    private clientService: ClientService,
    private packageService: PackageService,
    private unitService: UnitService,
    private pageTitleService: PageTitleService
  ) {}

  async ngOnInit(): Promise<void> {
    this.pageTitleService.setTitle('Eventos', '')
    await this.loadData()
  }

  async loadData(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''

      const params: GetEventsParams = {
        page: this.page,
        limit: this.limit,
        unitId: this.filterUnitId || undefined,
        status: this.filterStatus !== 'todos' ? this.filterStatus : undefined
      }
      const [eventsResponse, clientsResponse, packagesResponse, unitsResponse] = await Promise.all([
        firstValueFrom(this.eventService.getEventsPaginated(params)),
        firstValueFrom(this.clientService.getClients()),
        firstValueFrom(this.packageService.getPackages()),
        firstValueFrom(this.unitService.getUnits(true))
      ])

      if (eventsResponse.success && eventsResponse.data) {
        this.events = eventsResponse.data
        this.pagination = eventsResponse.pagination ?? null
      } else {
        this.error = 'Erro ao carregar eventos'
        this.pagination = null
      }

      if (clientsResponse.success && clientsResponse.data) {
        this.clients = clientsResponse.data as Client[]
      }

      if (packagesResponse.success && packagesResponse.data) {
        this.packages = packagesResponse.data
      }

      if (unitsResponse.success && unitsResponse.data) {
        this.units = unitsResponse.data
      }
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

  /** Events are already filtered by unit and status by the API; only search is client-side on current page */
  get filteredEvents(): Event[] {
    if (!this.searchTerm) return this.events
    const searchLower = this.searchTerm.toLowerCase()
    return this.events.filter(event => {
      const client = this.getClientName(event.clientId)
      const packageName = this.getPackageName(event.packageId)
      const unitName = this.getUnitName(event)
      return event.name.toLowerCase().includes(searchLower) ||
             client.toLowerCase().includes(searchLower) ||
             packageName.toLowerCase().includes(searchLower) ||
             (unitName != null && unitName.toLowerCase().includes(searchLower))
    })
  }

  /**
   * @Function - handleDeleteClick
   * @description - Initiates the delete process by opening the confirmation modal and clearing previous errors
   * @author - Vitor Hugo
   * @param - event: Event - The event to be deleted
   * @returns - void
   */
  handleDeleteClick(event: Event): void {
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
  getUnitName(event: Event): string | null {
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
  getUnitColor(event: Event): string {
    return event.unit?.color || '#6c757d'
  }

  /**
   * @Function - getCardAccentColor
   * @description - Returns accent color for event card (thin top bar) by status
   * @author - Vitor Hugo
   * @param - event: Event
   * @returns - string - CSS color
   */
  getCardAccentColor(event: Event): string {
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

