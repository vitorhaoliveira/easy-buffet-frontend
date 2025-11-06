import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, Plus, Edit, Trash2, Eye, Calendar, MapPin } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { SearchBarComponent } from '@shared/components/ui/search-bar/search-bar.component'
import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'
import { 
  TableComponent, 
  TableHeaderComponent, 
  TableBodyComponent, 
  TableRowComponent, 
  TableHeadComponent, 
  TableCellComponent 
} from '@shared/components/ui/table/table.component'
import { EventService } from '@core/services/event.service'
import { ClientService } from '@core/services/client.service'
import { PackageService } from '@core/services/package.service'
import type { Event, Client, Package } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    SearchBarComponent,
    ConfirmationModalComponent,
    TableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent
  ],
  templateUrl: './events-list.component.html'
})
export class EventsListComponent implements OnInit {
  readonly PlusIcon = Plus
  readonly EditIcon = Edit
  readonly Trash2Icon = Trash2
  readonly EyeIcon = Eye
  readonly CalendarIcon = Calendar
  readonly MapPinIcon = MapPin

  events: Event[] = []
  clients: Client[] = []
  packages: Package[] = []
  searchTerm: string = ''
  filterStatus: string = 'todos'
  isLoading: boolean = true
  error: string = ''
  showDeleteModal: boolean = false
  eventToDelete: Event | null = null
  isDeleting: boolean = false

  constructor(
    private eventService: EventService,
    private clientService: ClientService,
    private packageService: PackageService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadData()
  }

  async loadData(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''

      const [eventsResponse, clientsResponse, packagesResponse] = await Promise.all([
        firstValueFrom(this.eventService.getEvents()),
        firstValueFrom(this.clientService.getClients()),
        firstValueFrom(this.packageService.getPackages())
      ])

      if (eventsResponse.success && eventsResponse.data) {
        this.events = eventsResponse.data
      } else {
        this.error = 'Erro ao carregar eventos'
      }

      if (clientsResponse.success && clientsResponse.data) {
        this.clients = clientsResponse.data as Client[]
      }

      if (packagesResponse.success && packagesResponse.data) {
        this.packages = packagesResponse.data
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar dados'
    } finally {
      this.isLoading = false
    }
  }

  get filteredEvents(): Event[] {
    let filtered = this.events

    // Filter by search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase()
      filtered = filtered.filter(event => {
        const client = this.getClientName(event.clientId)
        const packageName = this.getPackageName(event.packageId)
        
        return event.name.toLowerCase().includes(searchLower) ||
               client.toLowerCase().includes(searchLower) ||
               packageName.toLowerCase().includes(searchLower) ||
               (event.location && event.location.toLowerCase().includes(searchLower))
      })
    }

    // Filter by status
    if (this.filterStatus !== 'todos') {
      filtered = filtered.filter(event => event.status === this.filterStatus)
    }

    return filtered
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

  getPackageName(packageId: string): string {
    const pkg = this.packages.find(p => p.id === packageId)
    return pkg?.name || 'Pacote não encontrado'
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
      case 'Realizado':
        return 'bg-gray-100 text-gray-800'
      case 'Cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
}

