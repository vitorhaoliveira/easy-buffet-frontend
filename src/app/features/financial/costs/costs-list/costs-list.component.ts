import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, Plus, Eye, Trash2 } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { SearchBarComponent } from '@shared/components/ui/search-bar/search-bar.component'
import { MobileCardComponent } from '@shared/components/ui/mobile-card/mobile-card.component'
import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'
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
import { CostService } from '@core/services/cost.service'
import type { Cost } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-costs-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    SearchBarComponent,
    MobileCardComponent,
    ConfirmationModalComponent,
    SkeletonComponent,
    EmptyStateComponent,
    TableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent
  ],
  templateUrl: './costs-list.component.html'
})
export class CostsListComponent implements OnInit {
  readonly PlusIcon = Plus
  readonly EyeIcon = Eye
  readonly Trash2Icon = Trash2

  costs: Cost[] = []
  searchTerm: string = ''
  filterCategory: string = 'todos'
  isLoading: boolean = true
  error: string = ''
  showDeleteModal: boolean = false
  costToDelete: Cost | null = null
  isDeleting: boolean = false

  constructor(
    private costService: CostService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadCosts()
  }

  /**
   * @Function - loadCosts
   * @description - Load all costs from API
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadCosts(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const response = await firstValueFrom(this.costService.getCosts())
      if (response.success && response.data) {
        this.costs = response.data as Cost[]
      } else {
        this.error = 'Erro ao carregar custos'
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar custos'
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - filteredCosts
   * @description - Filter costs by search term and category
   * @author - Vitor Hugo
   * @returns - Cost[] - Filtered costs array
   */
  get filteredCosts(): Cost[] {
    let filtered = this.costs

    // Filter by category
    if (this.filterCategory !== 'todos') {
      filtered = filtered.filter(cost => cost.category === this.filterCategory)
    }

    // Filter by search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase()
      filtered = filtered.filter(cost =>
        cost.description.toLowerCase().includes(searchLower) ||
        (cost.event?.name && cost.event.name.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }

  /**
   * @Function - handleDeleteClick
   * @description - Open delete confirmation modal
   * @author - Vitor Hugo
   * @param - cost: Cost - Cost to delete
   * @returns - void
   */
  handleDeleteClick(cost: Cost): void {
    this.costToDelete = cost
    this.showDeleteModal = true
    this.error = ''
  }

  /**
   * @Function - handleConfirmDelete
   * @description - Confirm and execute cost deletion
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmDelete(): Promise<void> {
    if (!this.costToDelete) return

    try {
      this.isDeleting = true
      const response = await firstValueFrom(
        this.costService.deleteCost(this.costToDelete.id)
      )
      if (response.success) {
        this.costs = this.costs.filter(cost => cost.id !== this.costToDelete!.id)
        this.showDeleteModal = false
        this.costToDelete = null
      } else {
        this.error = response.message || 'Erro ao excluir custo'
        this.showDeleteModal = false
        this.costToDelete = null
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else if (err.message) {
        this.error = err.message
      } else {
        this.error = 'Erro ao excluir custo'
      }
      this.showDeleteModal = false
      this.costToDelete = null
    } finally {
      this.isDeleting = false
    }
  }

  /**
   * @Function - handleCancelDelete
   * @description - Cancel delete operation and close modal
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancelDelete(): void {
    this.showDeleteModal = false
    this.costToDelete = null
  }

  /**
   * @Function - formatDate
   * @description - Format date string to Brazilian format
   * @author - Vitor Hugo
   * @param - dateString: string - Date to format
   * @returns - string - Formatted date
   */
  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }

  /**
   * @Function - formatCurrency
   * @description - Format number to Brazilian currency format
   * @author - Vitor Hugo
   * @param - value: number | string - Value to format
   * @returns - string - Formatted currency
   */
  formatCurrency(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue)
  }

  /**
   * @Function - translateCategory
   * @description - Translate category from English to Portuguese
   * @author - Vitor Hugo
   * @param - category: string - Category to translate
   * @returns - string - Translated category
   */
  translateCategory(category: string): string {
    const translations: Record<string, string> = {
      'staff': 'Pessoal',
      'food': 'Alimentação',
      'decoration': 'Decoração',
      'other': 'Outros'
    }
    return translations[category] || category
  }

  /**
   * @Function - getCategoryColor
   * @description - Get CSS classes for category badge
   * @author - Vitor Hugo
   * @param - category: string - Category value
   * @returns - string - CSS classes
   */
  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'staff': 'bg-blue-100 text-blue-800',
      'food': 'bg-green-100 text-green-800',
      'decoration': 'bg-purple-100 text-purple-800',
      'other': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }
}


