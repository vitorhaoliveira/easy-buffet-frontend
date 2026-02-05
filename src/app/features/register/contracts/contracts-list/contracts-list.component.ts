import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, Plus, Edit, Trash2, Eye, FileText, Calendar, DollarSign, User, Lock, ChevronLeft, ChevronRight } from 'lucide-angular'
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
import { ContractService, GetContractsParams } from '@core/services/contract.service'
import type { Contract, PaginationInfo } from '@shared/models/api.types'
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
  readonly ChevronLeftIcon = ChevronLeft
  readonly ChevronRightIcon = ChevronRight

  contracts: Contract[] = []
  searchTerm: string = ''
  filterStatus: string = 'todos'
  filterPaymentStatus: 'received' | 'pending' | 'all' = 'all'
  isLoading: boolean = true
  error: string = ''
  showDeleteModal: boolean = false
  contractToDelete: Contract | null = null
  isDeleting: boolean = false

  /** Pagination */
  page: number = 1
  limit: number = 20
  pagination: PaginationInfo | null = null

  constructor(
    private contractService: ContractService,
    public router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadData()
  }

  async loadData(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''

      const params: GetContractsParams = {
        page: this.page,
        limit: this.limit,
        paymentStatus: this.filterPaymentStatus,
        status: this.filterStatus !== 'todos' ? this.filterStatus : undefined
      }
      const contractsResponse = await firstValueFrom(
        this.contractService.getContractsPaginated(params)
      )

      if (contractsResponse.success && contractsResponse.data) {
        this.contracts = contractsResponse.data
        this.pagination = contractsResponse.pagination ?? null
      } else {
        this.error = 'Erro ao carregar contratos'
        this.pagination = null
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
   * @description - Changes current page and reloads contracts
   * @author - Vitor Hugo
   * @param - p: number - Page number (1-based)
   * @returns - Promise<void>
   */
  async setPage(p: number): Promise<void> {
    if (p < 1 || (this.pagination && p > this.pagination.totalPages)) return
    this.page = p
    await this.loadData()
  }

  /** Contracts are filtered by status and paymentStatus by the API; only search is client-side using embedded event/client */
  get filteredContracts(): Contract[] {
    if (!this.searchTerm) return this.contracts
    const searchLower = this.searchTerm.toLowerCase()
    return this.contracts.filter(contract => {
      const eventName = contract.event?.name ?? ''
      const clientName = contract.client?.name ?? ''
      return eventName.toLowerCase().includes(searchLower) ||
             clientName.toLowerCase().includes(searchLower)
    })
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
        await this.loadData()
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

  /**
   * @Function - formatCurrency
   * @description - Formats amount for display; accepts number or string (API may return string)
   * @author - Vitor Hugo
   * @param value - number | string - Amount to format
   * @returns - string
   */
  formatCurrency(value: number | string): string {
    const num = typeof value === 'string' ? Number(value) : value
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num)
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
   * @description - Reload contracts when payment status filter changes, resets to page 1
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async onPaymentStatusChange(): Promise<void> {
    this.page = 1
    await this.loadData()
  }

  /**
   * @Function - onStatusFilterChange
   * @description - Reload contracts when status filter changes, resets to page 1
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async onStatusFilterChange(): Promise<void> {
    this.page = 1
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

