import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, Plus, Edit, Trash2, Shield, UserCircle } from 'lucide-angular'
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
import { UserService } from '@core/services/user.service'
import type { User } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-user-list',
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
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  readonly PlusIcon = Plus
  readonly EditIcon = Edit
  readonly Trash2Icon = Trash2
  readonly ShieldIcon = Shield
  readonly UserCircleIcon = UserCircle

  users: User[] = []
  searchTerm: string = ''
  isLoading: boolean = true
  error: string = ''
  showDeleteModal: boolean = false
  userToDelete: User | null = null
  isDeleting: boolean = false

  constructor(
    private userService: UserService,
    public router: Router
  ) {}

  /**
   * @Function - ngOnInit
   * @description - Lifecycle hook that runs when component initializes, loads users
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async ngOnInit(): Promise<void> {
    await this.loadUsers()
  }

  /**
   * @Function - loadUsers
   * @description - Fetches all users from the API and updates the component state
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadUsers(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const response = await firstValueFrom(this.userService.getUsers())
      if (response.success && response.data) {
        this.users = response.data as User[]
      } else {
        this.error = 'Erro ao carregar usuários'
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar usuários'
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - filteredUsers
   * @description - Filters users based on search term (name, email, role)
   * @author - Vitor Hugo
   * @returns - User[] - Filtered array of users
   */
  get filteredUsers(): User[] {
    if (!this.searchTerm) {
      return this.users
    }
    
    const searchLower = this.searchTerm.toLowerCase()
    return this.users.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    )
  }

  /**
   * @Function - handleDeleteClick
   * @description - Initiates the delete process by opening the confirmation modal
   * @author - Vitor Hugo
   * @param - user: User - The user to be deleted
   * @returns - void
   */
  handleDeleteClick(user: User): void {
    this.userToDelete = user
    this.showDeleteModal = true
    this.error = ''
  }

  /**
   * @Function - handleConfirmDelete
   * @description - Handles the confirmation of user deletion with proper error handling
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmDelete(): Promise<void> {
    if (!this.userToDelete) return

    try {
      this.isDeleting = true
      const response = await firstValueFrom(
        this.userService.deleteUser(this.userToDelete.id)
      )
      if (response.success) {
        this.users = this.users.filter(user => user.id !== this.userToDelete!.id)
        this.showDeleteModal = false
        this.userToDelete = null
      } else {
        this.error = response.message || response.errors?.[0] || 'Erro ao excluir usuário'
        this.showDeleteModal = false
        this.userToDelete = null
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else if (err.message) {
        this.error = err.message
      } else {
        this.error = 'Erro ao excluir usuário'
      }
      this.showDeleteModal = false
      this.userToDelete = null
    } finally {
      this.isDeleting = false
    }
  }

  /**
   * @Function - handleCancelDelete
   * @description - Cancels the delete operation and closes the modal
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancelDelete(): void {
    this.showDeleteModal = false
    this.userToDelete = null
  }

  /**
   * @Function - formatDate
   * @description - Formats ISO date string to Brazilian date format
   * @author - Vitor Hugo
   * @param - dateString: string - ISO date string
   * @returns - string - Formatted date in Brazilian format
   */
  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }

  /**
   * @Function - getRoleBadgeClass
   * @description - Returns the CSS class for role badge based on user role
   * @author - Vitor Hugo
   * @param - role: string - User role (Administrador or Auxiliar)
   * @returns - string - CSS classes for badge styling
   */
  getRoleBadgeClass(role: string): string {
    return role === 'Administrador'
      ? 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-purple-100 text-purple-800'
      : 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-800'
  }

  /**
   * @Function - getStatusBadgeClass
   * @description - Returns the CSS class for status badge based on user status
   * @author - Vitor Hugo
   * @param - status: string - User status (Ativo or Inativo)
   * @returns - string - CSS classes for badge styling
   */
  getStatusBadgeClass(status: string): string {
    return status === 'Ativo'
      ? 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800'
      : 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gray-100 text-gray-800'
  }
}

