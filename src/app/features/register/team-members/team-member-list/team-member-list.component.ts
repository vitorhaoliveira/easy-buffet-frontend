import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, Plus, Edit, Trash2 } from 'lucide-angular'
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
import { TeamMemberService } from '@core/services/team-member.service'
import type { TeamMember } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-team-member-list',
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
  templateUrl: './team-member-list.component.html'
})
export class TeamMemberListComponent implements OnInit {
  readonly PlusIcon = Plus
  readonly EditIcon = Edit
  readonly Trash2Icon = Trash2

  teamMembers: TeamMember[] = []
  searchTerm: string = ''
  isLoading: boolean = true
  error: string = ''
  showDeleteModal: boolean = false
  memberToDelete: TeamMember | null = null
  isDeleting: boolean = false
  
  // Pagination
  currentPage: number = 1
  pageSize: number = 20
  totalItems: number = 0
  totalPages: number = 0
  
  // Sorting
  sortBy: string = 'name'
  sortOrder: 'asc' | 'desc' = 'asc'
  private searchTimeout: any

  constructor(
    private teamMemberService: TeamMemberService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadTeamMembers()
  }

  async loadTeamMembers(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const response = await firstValueFrom(
        this.teamMemberService.getTeamMembers({
          page: this.currentPage,
          limit: this.pageSize,
          search: this.searchTerm || undefined,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder
        })
      )
      if (response.success && response.data) {
        this.teamMembers = response.data
        if (response.pagination) {
          this.totalItems = response.pagination.total
          this.totalPages = response.pagination.totalPages
          this.currentPage = response.pagination.page
        }
      } else {
        this.error = 'Erro ao carregar membros da equipe'
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar membros da equipe'
    } finally {
      this.isLoading = false
    }
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1
      this.loadTeamMembers()
    }, 500)
  }

  onSortChange(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
    } else {
      this.sortBy = field
      this.sortOrder = 'asc'
    }
    this.loadTeamMembers()
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
      this.loadTeamMembers()
    }
  }

  /**
   * @Function - handleDeleteClick
   * @description - Initiates the delete process by opening the confirmation modal
   * @author - Vitor Hugo
   * @param - member: TeamMember - The team member to be deleted
   * @returns - void
   */
  handleDeleteClick(member: TeamMember): void {
    this.memberToDelete = member
    this.showDeleteModal = true
    this.error = ''
  }

  /**
   * @Function - handleConfirmDelete
   * @description - Handles the confirmation of team member deletion with proper error handling
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmDelete(): Promise<void> {
    if (!this.memberToDelete) return

    try {
      this.isDeleting = true
      const response = await firstValueFrom(
        this.teamMemberService.deleteTeamMember(this.memberToDelete.id)
      )
      if (response.success) {
        await this.loadTeamMembers()
        this.showDeleteModal = false
        this.memberToDelete = null
      } else {
        this.error = response.message || response.errors?.[0] || 'Erro ao excluir membro da equipe'
        this.showDeleteModal = false
        this.memberToDelete = null
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else if (err.message) {
        this.error = err.message
      } else {
        this.error = 'Erro ao excluir membro da equipe'
      }
      this.showDeleteModal = false
      this.memberToDelete = null
    } finally {
      this.isDeleting = false
    }
  }

  handleCancelDelete(): void {
    this.showDeleteModal = false
    this.memberToDelete = null
  }

  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return ''
    return this.sortOrder === 'asc' ? '↑' : '↓'
  }
}
