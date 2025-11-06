import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, Plus, Edit, Trash2, Eye, Package } from 'lucide-angular'
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
import { PackageService } from '@core/services/package.service'
import type { Package as PackageType } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-package-list',
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
  templateUrl: './package-list.component.html'
})
export class PackageListComponent implements OnInit {
  readonly PlusIcon = Plus
  readonly EditIcon = Edit
  readonly Trash2Icon = Trash2
  readonly EyeIcon = Eye
  readonly PackageIcon = Package

  packages: PackageType[] = []
  searchTerm: string = ''
  isLoading: boolean = true
  error: string = ''
  showDeleteModal: boolean = false
  packageToDelete: PackageType | null = null
  isDeleting: boolean = false

  constructor(private packageService: PackageService) {}

  /**
   * @Function - ngOnInit
   * @description - Initializes the component
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async ngOnInit(): Promise<void> {
    await this.loadData()
  }

  async loadData(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const response = await firstValueFrom(this.packageService.getPackages())
      if (response.success && response.data) {
        this.packages = response.data
      } else {
        this.error = 'Erro ao carregar pacotes'
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar pacotes'
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - filteredPackages
   * @description - Filters the packages based on the search term
   * @author - Vitor Hugo
   * @returns - PackageType[]
   */
  get filteredPackages(): PackageType[] {
    if (!this.searchTerm) {
      return this.packages
    }
    
    const searchLower = this.searchTerm.toLowerCase()
    return this.packages.filter(pkg =>
      pkg.name.toLowerCase().includes(searchLower) ||
      (pkg.description && pkg.description.toLowerCase().includes(searchLower))
    )
  }

  /**
   * @Function - handleDeleteClick
   * @description - Initiates the delete process by opening the confirmation modal and clearing previous errors
   * @author - Vitor Hugo
   * @param - pkg: PackageType - The package to be deleted
   * @returns - void
   */
  handleDeleteClick(pkg: PackageType): void {
    this.packageToDelete = pkg
    this.showDeleteModal = true
    this.error = '' // Clear previous errors
  }

  /**
   * @Function - handleConfirmDelete
   * @description - Handles the confirmation of package deletion with proper error handling for dependency constraints
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmDelete(): Promise<void> {
    if (!this.packageToDelete) return

    try {
      this.isDeleting = true
      const response = await firstValueFrom(
        this.packageService.deletePackage(this.packageToDelete.id)
      )
      if (response.success) {
        this.packages = this.packages.filter(pkg => pkg.id !== this.packageToDelete!.id)
        this.showDeleteModal = false
        this.packageToDelete = null
      } else {
        // Handle error from response when success is false
        this.error = response.message || response.errors?.[0] || 'Erro ao excluir pacote'
        this.showDeleteModal = false
        this.packageToDelete = null
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
        this.error = 'Erro ao excluir pacote'
      }
      // Close modal to show error message clearly
      this.showDeleteModal = false
      this.packageToDelete = null
    } finally {
      this.isDeleting = false
    }
  }

  /**
   * @Function - handleCancelDelete
   * @description - Handles the cancellation of package deletion
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancelDelete(): void {
    this.showDeleteModal = false
    this.packageToDelete = null
  }

  /**
   * @Function - formatCurrency
   * @description - Formats a currency value to a string
   * @author - Vitor Hugo
   * @returns - string
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  /**
   * @Function - formatDate
   * @description - Formats a date string to a string
   * @author - Vitor Hugo
   * @returns - string
   */
  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }
}

