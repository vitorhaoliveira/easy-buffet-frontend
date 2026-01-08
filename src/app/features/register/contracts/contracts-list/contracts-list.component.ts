import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, Plus, Edit, Trash2, Eye, FileText, Calendar, DollarSign, User, Lock } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { SearchBarComponent } from '@shared/components/ui/search-bar/search-bar.component'
import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'
import { SkeletonComponent } from '@shared/components/ui/skeleton/skeleton.component'
import { MobileCardComponent } from '@shared/components/ui/mobile-card/mobile-card.component'
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component'
import { 
  TableComponent, 
  TableHeaderComponent, 
  TableBodyComponent, 
  TableRowComponent, 
  TableHeadComponent, 
  TableCellComponent 
} from '@shared/components/ui/table/table.component'
import { ContractService } from '@core/services/contract.service'
import { EventService } from '@core/services/event.service'
import { ClientService } from '@core/services/client.service'
import type { Contract, Event, Client } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-contracts-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    SearchBarComponent,
    ConfirmationModalComponent,
    SkeletonComponent,
    MobileCardComponent,
    EmptyStateComponent,
    TableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent
  ],
  templateUrl: './contracts-list.component.html'
})
export class ContractsListComponent implements OnInit {
  readonly PlusIcon = Plus
  readonly EditIcon = Edit
  readonly Trash2Icon = Trash2
  readonly EyeIcon = Eye
  readonly FileTextIcon = FileText
  readonly CalendarIcon = Calendar
  readonly DollarSignIcon = DollarSign
  readonly UserIcon = User
  readonly LockIcon = Lock

  contracts: Contract[] = []
  events: Event[] = []
  clients: Client[] = []
  searchTerm: string = ''
  filterStatus: string = 'todos'
  filterPaymentStatus: 'received' | 'pending' | 'all' = 'all'
  isLoading: boolean = true
  error: string = ''
  showDeleteModal: boolean = false
  contractToDelete: Contract | null = null
  isDeleting: boolean = false

  constructor(
    private contractService: ContractService,
    private eventService: EventService,
    private clientService: ClientService,
    public router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadData()
  }

  async loadData(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''

      const [contractsResponse, eventsResponse, clientsResponse] = await Promise.all([
        firstValueFrom(this.contractService.getContracts(this.filterPaymentStatus !== 'all' ? this.filterPaymentStatus : undefined)),
        firstValueFrom(this.eventService.getEvents()),
        firstValueFrom(this.clientService.getClients())
      ])

      if (contractsResponse.success && contractsResponse.data) {
        this.contracts = contractsResponse.data
      } else {
        this.error = 'Erro ao carregar contratos'
      }

      if (eventsResponse.success && eventsResponse.data) {
        this.events = eventsResponse.data
      }

      if (clientsResponse.success && clientsResponse.data) {
        this.clients = clientsResponse.data as Client[]
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar dados'
    } finally {
      this.isLoading = false
    }
  }

  get filteredContracts(): Contract[] {
    let filtered = this.contracts

    // Filter by search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase()
      filtered = filtered.filter(contract => {
        const event = this.getEventName(contract.eventId)
        const client = this.getClientName(contract.clientId)
        
        return event.toLowerCase().includes(searchLower) ||
               client.toLowerCase().includes(searchLower)
      })
    }

    // Filter by status
    if (this.filterStatus !== 'todos') {
      filtered = filtered.filter(contract => (contract.status || 'Pendente') === this.filterStatus)
    }

    return filtered
  }

  /**
   * @Function - handleDeleteClick
   * @description - Initiates the delete process by opening the confirmation modal and clearing previous errors
   * @author - Vitor Hugo
   * @param - contract: Contract - The contract to be deleted
   * @returns - void
   */
  handleDeleteClick(contract: Contract): void {
    this.contractToDelete = contract
    this.showDeleteModal = true
    this.error = '' // Clear previous errors
  }

  /**
   * @Function - handleConfirmDelete
   * @description - Handles the confirmation of contract deletion with proper error handling for dependency constraints
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmDelete(): Promise<void> {
    if (!this.contractToDelete) return

    try {
      this.isDeleting = true
      const response = await firstValueFrom(
        this.contractService.deleteContract(this.contractToDelete.id)
      )
      if (response.success) {
        this.contracts = this.contracts.filter(contract => contract.id !== this.contractToDelete!.id)
        this.showDeleteModal = false
        this.contractToDelete = null
      } else {
        // Handle error from response when success is false
        this.error = response.message || response.errors?.[0] || 'Erro ao excluir contrato'
        this.showDeleteModal = false
        this.contractToDelete = null
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
        this.error = 'Erro ao excluir contrato'
      }
      // Close modal to show error message clearly
      this.showDeleteModal = false
      this.contractToDelete = null
    } finally {
      this.isDeleting = false
    }
  }

  handleCancelDelete(): void {
    this.showDeleteModal = false
    this.contractToDelete = null
  }

  getEventName(eventId: string): string {
    const event = this.events.find(e => e.id === eventId)
    return event?.name || 'Evento não encontrado'
  }

  getClientName(clientId: string): string {
    const client = this.clients.find(c => c.id === clientId)
    return client?.name || 'Cliente não encontrado'
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Assinado':
        return 'bg-green-100 text-green-800'
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  /**
   * @Function - onPaymentStatusChange
   * @description - Reload contracts when payment status filter changes
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async onPaymentStatusChange(): Promise<void> {
    await this.loadData()
  }

  /**
   * @Function - isContractClosed
   * @description - Check if contract is closed
   * @author - Vitor Hugo
   * @param - contract: Contract - Contract to check
   * @returns - boolean - True if contract is closed
   */
  isContractClosed(contract: Contract): boolean {
    return !!contract.closedAt
  }
}

