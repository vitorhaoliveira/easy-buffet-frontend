import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, Plus, Edit, Trash2, Eye, UserCircle2 } from 'lucide-angular'
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
import { SellerService } from '@core/services/seller.service'
import { PageTitleService } from '@core/services/page-title.service'
import type { Seller, PaginatedResponse } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-seller-list',
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
  templateUrl: './seller-list.component.html'
})
export class SellerListComponent implements OnInit {
  readonly PlusIcon = Plus
  readonly EditIcon = Edit
  readonly Trash2Icon = Trash2
  readonly EyeIcon = Eye
  readonly UserCircle2Icon = UserCircle2

  sellers: Seller[] = []
  searchTerm: string = ''
  isLoading: boolean = true
  error: string = ''
  showDeleteModal: boolean = false
  sellerToDelete: Seller | null = null
  isDeleting: boolean = false

  constructor(
    private sellerService: SellerService,
    public router: Router,
    private pageTitleService: PageTitleService
  ) {}

  async ngOnInit(): Promise<void> {
    this.pageTitleService.setTitle('Vendedor(a)s', 'Gerencie os dados dos seus vendedor(a)s')
    await this.loadSellers()
  }

  async loadSellers(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const response = await firstValueFrom(this.sellerService.getSellers())
      
      if (response.success) {
        // Handle both paginated and non-paginated responses
        if ('pagination' in response) {
          this.sellers = (response as PaginatedResponse<Seller>).data
        } else {
          this.sellers = response.data as Seller[]
        }
      } else {
        this.error = 'Erro ao carregar vendedor(a)s'
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar vendedor(a)s'
    } finally {
      this.isLoading = false
    }
  }

  get filteredSellers(): Seller[] {
    if (!this.searchTerm) {
      return this.sellers
    }
    
    const searchLower = this.searchTerm.toLowerCase()
    return this.sellers.filter(seller =>
      seller.name.toLowerCase().includes(searchLower) ||
      seller.email.toLowerCase().includes(searchLower) ||
      seller.phone.includes(searchLower)
    )
  }

  /**
   * @Function - handleDeleteClick
   * @description - Initiates the delete process by opening the confirmation modal
   * @author - Vitor Hugo
   * @param - seller: Seller - The seller to be deleted
   * @returns - void
   */
  handleDeleteClick(seller: Seller): void {
    this.sellerToDelete = seller
    this.showDeleteModal = true
    this.error = '' // Clear previous errors
  }

  /**
   * @Function - handleConfirmDelete
   * @description - Handles the confirmation of seller deletion with proper error handling
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmDelete(): Promise<void> {
    if (!this.sellerToDelete) return

    try {
      this.isDeleting = true
      const response = await firstValueFrom(
        this.sellerService.deleteSeller(this.sellerToDelete.id)
      )
      if (response.success) {
        this.sellers = this.sellers.filter(seller => seller.id !== this.sellerToDelete!.id)
        this.showDeleteModal = false
        this.sellerToDelete = null
      } else {
        // Handle error from response when success is false
        this.error = response.message || response.errors?.[0] || 'Erro ao excluir vendedor(a)'
        this.showDeleteModal = false
        this.sellerToDelete = null
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
        this.error = 'Erro ao excluir vendedor(a)'
      }
      // Close modal to show error message clearly
      this.showDeleteModal = false
      this.sellerToDelete = null
    } finally {
      this.isDeleting = false
    }
  }

  handleCancelDelete(): void {
    this.showDeleteModal = false
    this.sellerToDelete = null
  }

  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }
}

