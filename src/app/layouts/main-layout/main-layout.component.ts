import { Component, OnInit, OnDestroy } from '@angular/core'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { LucideAngularModule, Home, ClipboardList, DollarSign, Settings, HelpCircle, MessageCircle, LogOut, Building2, ChevronDown, Plus, X, Menu } from 'lucide-angular'
import { Subject, takeUntil, firstValueFrom } from 'rxjs'
import { AuthStateService } from '@core/services/auth-state.service'
import { AuthService } from '@core/services/auth.service'
import { OrganizationService } from '@core/services/organization.service'
import { StorageService } from '@core/services/storage.service'
import { phoneValidator } from '@shared/validators'
import type { User } from '@shared/models/api.types'
import { ToastComponent } from '@shared/components/ui/toast/toast.component'

interface MenuItem {
  title: string;
  url?: string;
  icon: string;
  items?: SubMenuItem[];
  expanded?: boolean;
}

interface SubMenuItem {
  title: string;
  url: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    LucideAngularModule,
    ReactiveFormsModule,
    ToastComponent
  ],
  templateUrl: './main-layout.component.html',
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  // Lucide icons
  readonly HomeIcon = Home
  readonly ClipboardListIcon = ClipboardList
  readonly DollarSignIcon = DollarSign
  readonly SettingsIcon = Settings
  readonly HelpCircleIcon = HelpCircle
  readonly MessageCircleIcon = MessageCircle
  readonly LogOutIcon = LogOut
  readonly Building2Icon = Building2
  readonly ChevronDownIcon = ChevronDown
  readonly PlusIcon = Plus
  readonly XIcon = X
  readonly MenuIcon = Menu

  // State
  sidebarCollapsed = false
  mobileMenuOpen = false
  currentUser: User | null = null
  showOrgDropdown = false
  isSwitchingOrg = false
  errorMessage = ''
  
  // Create organization modal
  showCreateOrgModal = false
  isCreatingOrg = false
  createOrgError = ''
  createOrgSuccess = ''
  createOrgForm!: FormGroup
  
  private destroy$ = new Subject<void>()

  constructor(
    private authStateService: AuthStateService,
    private authService: AuthService,
    private organizationService: OrganizationService,
    private storageService: StorageService,
    private fb: FormBuilder
  ) {
    this.initializeCreateOrgForm()
  }

  menuItems: MenuItem[] = [
    {
      title: 'Cadastros',
      icon: 'clipboard-list',
      expanded: false,
      items: [
        { title: 'Clientes', url: '/cadastros/clientes' },
        { title: 'Pacotes/Serviços', url: '/cadastros/pacotes' },
        { title: 'Eventos/Reservas', url: '/cadastros/eventos' },
        { title: 'Orçamentos', url: '/cadastros/orcamentos' },
        { title: 'Unidades', url: '/cadastros/unidades' },
        { title: 'Usuários', url: '/cadastros/usuarios' },
        { title: 'Vendedor(a)s', url: '/cadastros/vendedoras' },
        { title: 'Contratos', url: '/cadastros/contratos' },
        { title: 'Checklists', url: '/cadastros/checklists/templates' },
        { title: 'Equipe', url: '/cadastros/equipe' }
      ]
    },
    {
      title: 'Financeiro',
      icon: 'dollar-sign',
      expanded: false,
      items: [
        { title: 'Dashboard', url: '/financeiro' },
        { title: 'Parcelas', url: '/financeiro/parcelas' },
        { title: 'Custos e Despesas', url: '/financeiro/custos' },
        { title: 'Relatório Mensal', url: '/relatorios/mensal' }
      ]
    },
    {
      title: 'Configurações',
      icon: 'settings',
      expanded: false,
      items: [
        { title: 'Minha Conta', url: '/conta' },
        { title: 'Assinatura', url: '/assinatura' },
      ]
    }
  ]

  /**
   * @Function - initializeCreateOrgForm
   * @description - Initializes the create organization form
   * @author - Vitor Hugo
   * @returns - void
   */
  private initializeCreateOrgForm(): void {
    this.createOrgForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      fantasyName: [''],
      cnpj: [''],
      email: ['', [Validators.email]],
      phone: ['', [phoneValidator()]]
    })
  }

  /**
   * @Function - ngOnInit
   * @description - Lifecycle hook that initializes component
   * @author - Vitor Hugo
   * @returns - void
   */
  ngOnInit(): void {
    this.authStateService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user
        if (user) {
          this.syncCurrentOrganization()
          this.loadUserOrganizations()
        }
      })
  }

  /**
   * @Function - syncCurrentOrganization
   * @description - Synchronizes currentOrganization in user object with localStorage
   * @author - Vitor Hugo
   * @returns - void
   */
  private syncCurrentOrganization(): void {
    if (!this.currentUser || !this.currentUser.organizations) {
      return
    }

    const currentOrgId = this.storageService.getCurrentOrganizationId()
    if (!currentOrgId) {
      return
    }

    // Find the organization in the user's organizations array
    const currentOrg = this.currentUser.organizations.find(org => org.id === currentOrgId)
    
    if (currentOrg && (!this.currentUser.currentOrganization || this.currentUser.currentOrganization.id !== currentOrgId)) {
      // Update currentUser with the correct currentOrganization
      this.currentUser = {
        ...this.currentUser,
        currentOrganization: {
          id: currentOrg.id,
          name: currentOrg.name,
          role: currentOrg.role,
          permissions: currentOrg.permissions
        }
      }
    }
  }

  /**
   * @Function - loadUserOrganizations
   * @description - Loads all organizations for the current user
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadUserOrganizations(): Promise<void> {
    try {
      const response = await firstValueFrom(this.organizationService.getOrganizations())
      if (response.success && response.data && this.currentUser) {
        // Update currentUser with organizations list
        this.currentUser = {
          ...this.currentUser,
          organizations: response.data.map(org => ({
            id: org.id,
            name: org.name,
            role: org.role || 'Operador',
            permissions: org.permissions || {
              dashboard: { view: true },
              cadastros: { create: false, edit: false, delete: false, view: true },
              financeiro: { create: false, edit: false, delete: false, view: true },
              relatorios: { view: true, export: false }
            }
          }))
        }
      }
    } catch (error) {
      console.error('❌ Error loading organizations:', error)
    }
  }

  /**
   * @Function - ngOnDestroy
   * @description - Lifecycle hook that cleans up subscriptions
   * @author - Vitor Hugo
   * @returns - void
   */
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  /**
   * @Function - toggleSidebar
   * @description - Toggle sidebar collapsed state
   * @author - Vitor Hugo
   * @param - void
   * @returns - void
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed
    // Close all expanded menus when collapsing
    if (this.sidebarCollapsed) {
      this.menuItems.forEach(item => item.expanded = false)
    }
  }

  /**
   * @Function - toggleMobileSidebar
   * @description - Toggle mobile sidebar visibility
   * @author - Vitor Hugo
   * @param - void
   * @returns - void
   */
  toggleMobileSidebar(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen
  }

  /**
   * @Function - closeMobileSidebar
   * @description - Close mobile sidebar
   * @author - Vitor Hugo
   * @param - void
   * @returns - void
   */
  closeMobileSidebar(): void {
    this.mobileMenuOpen = false
  }

  /**
   * @Function - toggleMenu
   * @description - Toggle menu item expansion
   * @author - Vitor Hugo
   * @param - item: MenuItem
   * @returns - void
   */
  toggleMenu(item: MenuItem): void {
    // Don't toggle if sidebar is collapsed
    if (this.sidebarCollapsed) return
    item.expanded = !item.expanded
  }

  /**
   * @Function - getIconComponent
   * @description - Get Lucide icon component for menu item
   * @author - Vitor Hugo
   * @param iconName - string - The icon identifier
   * @returns any - Lucide icon component
   */
  getIconComponent(iconName: string): any {
    const iconMap: { [key: string]: any } = {
      'clipboard-list': this.ClipboardListIcon,
      'dollar-sign': this.DollarSignIcon,
      'settings': this.SettingsIcon
    }
    return iconMap[iconName] || this.ClipboardListIcon
  }

  /**
   * @Function - toggleOrgDropdown
   * @description - Toggles organization dropdown visibility
   * @author - Vitor Hugo
   * @returns - void
   */
  toggleOrgDropdown(): void {
    if (this.sidebarCollapsed) return
    this.showOrgDropdown = !this.showOrgDropdown
    this.errorMessage = ''
  }

  /**
   * @Function - hasMultipleOrganizations
   * @description - Checks if user has multiple organizations
   * @author - Vitor Hugo
   * @returns - boolean - True if user has more than one organization
   */
  hasMultipleOrganizations(): boolean {
    return (this.currentUser?.organizations?.length || 0) > 1
  }

  /**
   * @Function - getCurrentOrganizationName
   * @description - Gets the current organization name
   * @author - Vitor Hugo
   * @returns - string - Current organization name
   */
  getCurrentOrganizationName(): string {
    // First try to get from currentOrganization
    if (this.currentUser?.currentOrganization?.name) {
      return this.currentUser.currentOrganization.name
    }
    
    // If not available, try to get from organizations array using currentOrganizationId
    const currentOrgId = this.storageService.getCurrentOrganizationId()
    if (currentOrgId && this.currentUser?.organizations) {
      const org = this.currentUser.organizations.find(o => o.id === currentOrgId)
      if (org) {
        return org.name
      }
    }
    
    // Fallback to first organization
    if (this.currentUser?.organizations?.[0]?.name) {
      return this.currentUser.organizations[0].name
    }
    
    // Last resort: get from storage
    const storedOrg = this.storageService.getOrganization()
    return storedOrg?.name || 'Organização'
  }

  /**
   * @Function - isCurrentOrganization
   * @description - Checks if organization is the current one
   * @author - Vitor Hugo
   * @param - orgId: string - Organization ID to check
   * @returns - boolean - True if organization is current
   */
  isCurrentOrganization(orgId: string): boolean {
    // First try to get from currentOrganization
    if (this.currentUser?.currentOrganization?.id) {
      return this.currentUser.currentOrganization.id === orgId
    }
    
    // Try to get from storage
    const currentOrgId = this.storageService.getCurrentOrganizationId()
    if (currentOrgId) {
      return currentOrgId === orgId
    }
    
    // Fallback to first organization
    return this.currentUser?.organizations?.[0]?.id === orgId
  }

  /**
   * @Function - switchOrganization
   * @description - Switches to a different organization
   * @author - Vitor Hugo
   * @param - orgId: string - Organization ID to switch to
   * @returns - Promise<void>
   */
  async switchOrganization(orgId: string): Promise<void> {
    if (this.isSwitchingOrg || this.isCurrentOrganization(orgId)) {
      return
    }

    try {
      this.isSwitchingOrg = true
      this.errorMessage = ''

      // Check if organization exists in user's organizations
      const targetOrg = this.currentUser?.organizations?.find(org => org.id === orgId)
      if (!targetOrg) {
        console.error('❌ Target organization not found in user organizations')
        this.errorMessage = 'Organização não encontrada'
        this.isSwitchingOrg = false
        return
      }

      // Call backend to validate the switch
      const response = await firstValueFrom(
        this.organizationService.switchOrganization(orgId)
      )

      if (response.success && response.data?.currentOrganization) {
        const currentOrganization = response.data.currentOrganization
        // Use in-memory currentUser so we don't depend on localStorage having the user
        const userToUpdate = this.currentUser ?? this.storageService.getUser()
        if (!userToUpdate) {
          this.errorMessage = 'Erro ao trocar organização localmente'
          this.isSwitchingOrg = false
          return
        }
        const updatedUser = {
          ...userToUpdate,
          currentOrganization: {
            id: currentOrganization.id,
            name: currentOrganization.name,
            role: currentOrganization.role ?? 'Administrador',
            permissions: currentOrganization.permissions ?? {}
          }
        }
        this.storageService.setUser(updatedUser)
        this.storageService.setOrganization({
          id: currentOrganization.id,
          name: currentOrganization.name,
          createdAt: new Date().toISOString()
        })
        this.storageService.setCurrentOrganizationId(currentOrganization.id)
        window.location.reload()
      } else if (response.success && !response.data?.currentOrganization) {
        const switchSuccess = this.storageService.switchOrganization(orgId)
        if (switchSuccess) {
          window.location.reload()
        } else {
          this.errorMessage = 'Erro ao trocar organização localmente'
          this.isSwitchingOrg = false
        }
      } else {
        console.error('❌ Backend switch failed:', response.message)
        this.errorMessage = response.message || 'Erro ao trocar organização'
        this.isSwitchingOrg = false
      }
    } catch (error: any) {
      console.error('❌ Error switching organization:', error)
      this.errorMessage = error.error?.message || error.message || 'Erro ao trocar organização'
      this.isSwitchingOrg = false
    }
  }

  /**
   * @Function - isAdmin
   * @description - Checks if current user is an administrator
   * @author - Vitor Hugo
   * @returns - boolean - True if user is admin
   */
  isAdmin(): boolean {
    const role = this.currentUser?.currentOrganization?.role || 
                 this.currentUser?.organizations?.[0]?.role ||
                 this.currentUser?.role
    return role === 'Administrador'
  }

  /**
   * @Function - openCreateOrgModal
   * @description - Opens the create organization modal
   * @author - Vitor Hugo
   * @returns - void
   */
  openCreateOrgModal(): void {
    this.showCreateOrgModal = true
    this.showOrgDropdown = false
    this.createOrgError = ''
    this.createOrgSuccess = ''
    this.createOrgForm.reset()
  }

  /**
   * @Function - closeCreateOrgModal
   * @description - Closes the create organization modal
   * @author - Vitor Hugo
   * @returns - void
   */
  closeCreateOrgModal(): void {
    this.showCreateOrgModal = false
    this.createOrgError = ''
    this.createOrgSuccess = ''
    this.createOrgForm.reset()
  }

  /**
   * @Function - createOrganization
   * @description - Creates a new organization
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async createOrganization(): Promise<void> {
    if (this.createOrgForm.invalid) {
      Object.keys(this.createOrgForm.controls).forEach(key => {
        this.createOrgForm.controls[key].markAsTouched()
      })
      return
    }

    try {
      this.isCreatingOrg = true
      this.createOrgError = ''
      this.createOrgSuccess = ''

      const formValue = this.createOrgForm.value
      const orgData = {
        name: formValue.name,
        fantasyName: formValue.fantasyName || undefined,
        cnpj: formValue.cnpj || undefined,
        email: formValue.email || undefined,
        phone: formValue.phone || undefined
      }

      const response = await firstValueFrom(
        this.organizationService.createOrganization(orgData)
      )

      if (response.success && response.data) {
        this.createOrgSuccess = 'Organização criada com sucesso!'
        
        // Wait to show success message
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Reload organizations list from backend
        await this.loadUserOrganizations()
        
        // Close modal
        this.closeCreateOrgModal()
      } else {
        this.createOrgError = response.message || 'Erro ao criar organização'
      }
    } catch (error: any) {
      console.error('Error creating organization:', error)
      if (error.error?.error?.message) {
        this.createOrgError = error.error.error.message
      } else if (error.error?.message) {
        this.createOrgError = error.error.message
      } else {
        this.createOrgError = error.message || 'Erro ao criar organização'
      }
    } finally {
      this.isCreatingOrg = false
    }
  }

  /**
   * @Function - hasCreateOrgError
   * @description - Checks if form field has error
   * @author - Vitor Hugo
   * @param - fieldName: string - Field name
   * @returns - boolean - True if has error
   */
  hasCreateOrgError(fieldName: string): boolean {
    const field = this.createOrgForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }

  /**
   * @Function - getCreateOrgFieldError
   * @description - Gets error message for form field
   * @author - Vitor Hugo
   * @param - fieldName: string - Field name
   * @returns - string - Error message
   */
  getCreateOrgFieldError(fieldName: string): string {
    const field = this.createOrgForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      return 'Campo obrigatório'
    }
    if (field?.hasError('minlength') && field.touched) {
      return 'Mínimo de 3 caracteres'
    }
    if (field?.hasError('email') && field.touched) {
      return 'Email inválido'
    }
    if (field?.hasError('invalidPhone') && field.touched) {
      return 'Telefone inválido'
    }
    return ''
  }

  /**
   * @Function - contactSupport
   * @description - Opens WhatsApp support in a new tab
   * @author - Vitor Hugo
   * @returns - void
   */
  contactSupport(): void {
    const phoneNumber = '5511989327073'
    const whatsappUrl = `https://wa.me/${phoneNumber}`
    window.open(whatsappUrl, '_blank')
  }

  /**
   * @Function - sendFeedback
   * @description - Opens WhatsApp feedback in a new tab
   * @author - Vitor Hugo
   * @returns - void
   */
  sendFeedback(): void {
    const phoneNumber = '5511989327073'
    const whatsappUrl = `https://wa.me/${phoneNumber}`
    window.open(whatsappUrl, '_blank')
  }

  /**
   * @Function - logout
   * @description - Logs out the current user
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async logout(): Promise<void> {
    await this.authStateService.logout()
  }
}

