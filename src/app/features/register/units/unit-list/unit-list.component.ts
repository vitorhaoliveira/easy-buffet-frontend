import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, Plus, Edit, Trash2, Eye, Building2 } from 'lucide-angular'
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
import { UnitService } from '@core/services/unit.service'
import type { Unit } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-unit-list',
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
  templateUrl: './unit-list.component.html'
})
export class UnitListComponent implements OnInit {
  readonly PlusIcon = Plus
  readonly EditIcon = Edit
  readonly Trash2Icon = Trash2
  readonly EyeIcon = Eye
  readonly Building2Icon = Building2

  units: Unit[] = []
  searchTerm: string = ''
  filterActive: string = 'all'
  isLoading: boolean = true
  error: string = ''
  showDeleteModal: boolean = false
  unitToDelete: Unit | null = null
  isDeleting: boolean = false

  constructor(
    private unitService: UnitService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadUnits()
  }

  /**
   * @Function - loadUnits
   * @description - Loads units from the API, optionally filtered by active status
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadUnits(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const isActive = this.filterActive === 'active' ? true : this.filterActive === 'inactive' ? false : undefined
      const response = await firstValueFrom(this.unitService.getUnits(isActive))
      if (response.success && response.data) {
        this.units = response.data
      } else {
        this.error = 'Erro ao carregar unidades'
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar unidades'
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - onFilterChange
   * @description - Handles filter change and reloads units
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async onFilterChange(): Promise<void> {
    await this.loadUnits()
  }

  /**
   * @Function - filteredUnits
   * @description - Filters units by search term
   * @author - Vitor Hugo
   * @returns - Unit[]
   */
  get filteredUnits(): Unit[] {
    if (!this.searchTerm) {
      return this.units
    }
    
    const searchLower = this.searchTerm.toLowerCase()
    return this.units.filter(unit =>
      unit.name.toLowerCase().includes(searchLower) ||
      (unit.code && unit.code.toLowerCase().includes(searchLower)) ||
      (unit.city && unit.city.toLowerCase().includes(searchLower)) ||
      (unit.state && unit.state.toLowerCase().includes(searchLower))
    )
  }

  /**
   * @Function - handleDeleteClick
   * @description - Initiates the delete process by opening the confirmation modal
   * @author - Vitor Hugo
   * @param - unit: Unit - The unit to be deleted
   * @returns - void
   */
  handleDeleteClick(unit: Unit): void {
    this.unitToDelete = unit
    this.showDeleteModal = true
    this.error = ''
  }

  /**
   * @Function - handleConfirmDelete
   * @description - Handles the confirmation of unit deletion with proper error handling
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmDelete(): Promise<void> {
    if (!this.unitToDelete) return

    try {
      this.isDeleting = true
      const response = await firstValueFrom(
        this.unitService.deleteUnit(this.unitToDelete.id)
      )
      if (response.success) {
        this.units = this.units.filter(unit => unit.id !== this.unitToDelete!.id)
        this.showDeleteModal = false
        this.unitToDelete = null
      } else {
        this.error = response.message || response.errors?.[0] || 'Erro ao excluir unidade'
        this.showDeleteModal = false
        this.unitToDelete = null
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else if (err.message) {
        this.error = err.message
      } else {
        this.error = 'Erro ao excluir unidade'
      }
      this.showDeleteModal = false
      this.unitToDelete = null
    } finally {
      this.isDeleting = false
    }
  }

  /**
   * @Function - handleCancelDelete
   * @description - Cancels the delete operation
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancelDelete(): void {
    this.showDeleteModal = false
    this.unitToDelete = null
  }

  /**
   * @Function - formatDate
   * @description - Formats a date string to Brazilian format
   * @author - Vitor Hugo
   * @param - dateString: string - The date string to format
   * @returns - string
   */
  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }

  /**
   * @Function - getUnitColor
   * @description - Returns the unit color or a default color
   * @author - Vitor Hugo
   * @param - unit: Unit - The unit to get color from
   * @returns - string
   */
  getUnitColor(unit: Unit): string {
    return unit.color || '#6c757d'
  }

  /**
   * @Function - getLocationString
   * @description - Returns a formatted location string for the unit
   * @author - Vitor Hugo
   * @param - unit: Unit - The unit to get location from
   * @returns - string
   */
  getLocationString(unit: Unit): string {
    const parts: string[] = []
    if (unit.city) parts.push(unit.city)
    if (unit.state) parts.push(unit.state)
    return parts.length > 0 ? parts.join(' - ') : '-'
  }
}

