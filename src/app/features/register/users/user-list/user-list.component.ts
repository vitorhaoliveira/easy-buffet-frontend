import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, Plus, Edit, Trash2, Shield, UserCircle, Users } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { SearchBarComponent } from '@shared/components/ui/search-bar/search-bar.component'
import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'
import { AddUsersModalComponent } from '@shared/components/ui/add-users-modal/add-users-modal.component'
import { SkeletonComponent } from '@shared/components/ui/skeleton/skeleton.component'
import { MobileCardComponent } from '@shared/components/ui/mobile-card/mobile-card.component'
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component'
import { FabComponent } from '@shared/components/ui/fab/fab.component'
import { 
  TableComponent, 
  TableHeaderComponent, 
  TableBodyComponent, 
  TableRowComponent, 
  TableHeadComponent, 
  TableCellComponent 
} from '@shared/components/ui/table/table.component'
import { UserService } from '@core/services/user.service'
import { PageTitleService } from '@core/services/page-title.service'
import { UserLimitService } from '@core/services/user-limit.service'
import { SubscriptionService } from '@core/services/subscription.service'
import { ToastService } from '@core/services/toast.service'
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
    AddUsersModalComponent,
    SkeletonComponent,
    MobileCardComponent,
    EmptyStateComponent,
    FabComponent,
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
  readonly UsersIcon = Users

  users: User[] = []
  searchTerm: string = ''
  isLoading: boolean = true
  error: string = ''
  showDeleteModal: boolean = false
  userToDelete: User | null = null
  isDeleting: boolean = false
  showAddUsersModal: boolean = false
  isAddingUsers: boolean = false
  userLimit: { limit: number; current: number; available: number } | null = null
  isLifetimePlan: boolean = false

  constructor(
    private userService: UserService,
    private userLimitService: UserLimitService,
    private subscriptionService: SubscriptionService,
    private toastService: ToastService,
    private pageTitleService: PageTitleService,
    public router: Router
  ) {}

  /**
   * @Function - ngOnInit
   * @description - Lifecycle hook that runs when component initializes, loads users and limit
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async ngOnInit(): Promise<void> {
    this.pageTitleService.setTitle('Usuários', 'Gerencie os usuários e permissões do sistema')
    await Promise.all([this.loadUsers(), this.loadUserLimit(), this.checkLifetimePlan()])
  }

  /**
   * @Function - checkLifetimePlan
   * @description - Checks if current subscription is lifetime plan
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async checkLifetimePlan(): Promise<void> {
    this.isLifetimePlan = await this.checkIsLifetimePlan()
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
        await this.loadUserLimit()
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
   * @Function - onFabClick
   * @description - Handles FAB click: when user limit is reached opens add-users modal; otherwise navigation is handled by routerLink
   * @author - EasyBuffet
   * @returns - void
   */
  onFabClick(): void {
    if (this.userLimit && this.userLimit.available === 0) {
      this.showAddUsersModal = true
    }
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

  /**
   * @Function - loadUserLimit
   * @description - Loads user limit information from the API
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadUserLimit(): Promise<void> {
    try {
      const response = await firstValueFrom(this.userLimitService.getUserLimit())
      if (response.success && response.data) {
        this.userLimit = response.data
      }
    } catch (error) {
      console.error('Erro ao carregar limite de usuários:', error)
    }
  }

  /**
   * @Function - checkIsLifetimePlan
   * @description - Checks if the current subscription is a lifetime plan
   * @author - Vitor Hugo
   * @returns - Promise<boolean> - True if lifetime plan
   */
  async checkIsLifetimePlan(): Promise<boolean> {
    try {
      const subscription = await firstValueFrom(this.subscriptionService.getSubscription())
      if (!subscription?.plan) return false
      
      const planName = subscription.plan.name.toLowerCase()
      return planName.includes('lifetime') || planName.includes('vitalício')
    } catch {
      return false
    }
  }

  /**
   * @Function - handleAddUsers
   * @description - Handles adding extra users via modal
   * @author - Vitor Hugo
   * @param - quantity: number - Number of users to add
   * @returns - Promise<void>
   */
  async handleAddUsers(quantity: number): Promise<void> {
    try {
      this.isAddingUsers = true
      
      // Check if it's a lifetime plan
      const isLifetime = await this.checkIsLifetimePlan()
      
      if (!isLifetime) {
        // For non-lifetime plans, show a message that payment is required
        this.toastService.info('Redirecionando para o pagamento via Stripe...')
        // The backend will handle the Stripe checkout
      }
      
      const response = await firstValueFrom(
        this.userLimitService.addUsers({ quantity })
      )
      
      if (response.success && response.data) {
        // Check if the response indicates lifetime plan
        const isLifetimeResponse = response.data.message?.toLowerCase().includes('lifetime') || 
                                   response.data.message?.toLowerCase().includes('vitalício')
        
        if (isLifetimeResponse) {
          this.toastService.success(
            `${quantity} usuário(s) adicionado(s) com sucesso! Seu novo limite é de ${response.data.newLimit} usuários.`
          )
        } else {
          this.toastService.success(
            `${quantity} usuário(s) adicionado(s) com sucesso! Seu novo limite é de ${response.data.newLimit} usuários.`
          )
        }
        
        this.showAddUsersModal = false
        await this.loadUserLimit()
      }
    } catch (error: any) {
      if (error.error?.error?.message) {
        this.toastService.error(error.error.error.message)
      } else if (error.error?.message) {
        this.toastService.error(error.error.message)
      } else {
        this.toastService.error('Erro ao adicionar usuários. Verifique se sua assinatura está ativa.')
      }
    } finally {
      this.isAddingUsers = false
    }
  }

  /**
   * @Function - handleCloseAddUsersModal
   * @description - Closes the add users modal
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCloseAddUsersModal(): void {
    this.showAddUsersModal = false
  }
}

