import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, Plus, Edit, Trash2, Eye } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { SearchBarComponent } from '@shared/components/ui/search-bar/search-bar.component'
import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'
import { MobileCardComponent } from '@shared/components/ui/mobile-card/mobile-card.component'
import { SkeletonComponent } from '@shared/components/ui/skeleton/skeleton.component'
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component'
import { 
  TableComponent, 
  TableHeaderComponent, 
  TableBodyComponent, 
  TableRowComponent, 
  TableHeadComponent, 
  TableCellComponent 
} from '@shared/components/ui/table/table.component'
import { ClientService } from '@core/services/client.service'
import type { Client } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    SearchBarComponent,
    ConfirmationModalComponent,
    MobileCardComponent,
    TableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent,
    SkeletonComponent,
    EmptyStateComponent
  ],
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit {
  readonly PlusIcon = Plus
  readonly EditIcon = Edit
  readonly Trash2Icon = Trash2
  readonly EyeIcon = Eye

  clientes: Client[] = []
  searchTerm: string = ''
  isLoading: boolean = true
  error: string = ''
  showDeleteModal: boolean = false
  clientToDelete: Client | null = null
  isDeleting: boolean = false

  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadClients()
  }

  async loadClients(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const response = await firstValueFrom(this.clientService.getClients())
      if (response.success && response.data) {
        this.clientes = response.data as Client[]
      } else {
        this.error = 'Erro ao carregar clientes'
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar clientes'
    } finally {
      this.isLoading = false
    }
  }

  get filteredClientes(): Client[] {
    if (!this.searchTerm) {
      return this.clientes
    }
    
    const searchLower = this.searchTerm.toLowerCase()
    const searchDigits = this.searchTerm.replace(/\D/g, '')
    return this.clientes.filter(cliente =>
      cliente.name.toLowerCase().includes(searchLower) ||
      (cliente.email && cliente.email.toLowerCase().includes(searchLower)) ||
      (cliente.phone && cliente.phone.includes(searchLower)) ||
      (cliente.cpf && (cliente.cpf.toLowerCase().includes(searchLower) || cliente.cpf.replace(/\D/g, '').includes(searchDigits)))
    )
  }

  /**
   * @Function - handleDeleteClick
   * @description - Initiates the delete process by opening the confirmation modal and clearing previous errors
   * @author - Vitor Hugo
   * @param - client: Client - The client to be deleted
   * @returns - void
   */
  handleDeleteClick(client: Client): void {
    this.clientToDelete = client
    this.showDeleteModal = true
    this.error = '' // Clear previous errors
  }

  /**
   * @Function - handleConfirmDelete
   * @description - Handles the confirmation of client deletion with proper error handling for dependency constraints
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmDelete(): Promise<void> {
    if (!this.clientToDelete) return

    try {
      this.isDeleting = true
      const response = await firstValueFrom(
        this.clientService.deleteClient(this.clientToDelete.id)
      )
      if (response.success) {
        this.clientes = this.clientes.filter(cliente => cliente.id !== this.clientToDelete!.id)
        this.showDeleteModal = false
        this.clientToDelete = null
      } else {
        // Handle error from response when success is false
        this.error = response.message || response.errors?.[0] || 'Erro ao excluir cliente'
        this.showDeleteModal = false
        this.clientToDelete = null
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
        this.error = 'Erro ao excluir cliente'
      }
      // Close modal to show error message clearly
      this.showDeleteModal = false
      this.clientToDelete = null
    } finally {
      this.isDeleting = false
    }
  }

  handleCancelDelete(): void {
    this.showDeleteModal = false
    this.clientToDelete = null
  }

  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }
}

