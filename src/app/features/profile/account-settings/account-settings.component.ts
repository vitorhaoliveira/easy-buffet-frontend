import { Component, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, User, Building2, Clock, Save, X, Search, Filter, Shield } from 'lucide-angular'
import { firstValueFrom, Subject, takeUntil } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { phoneValidator } from '@shared/validators'
import { AuthStateService } from '@core/services/auth-state.service'
import { PageTitleService } from '@core/services/page-title.service'
import { UserService } from '@core/services/user.service'
import { SettingsService } from '@core/services/settings.service'
import { ChangePasswordComponent } from '../change-password/change-password.component'
import type {
  User as UserType,
  CompanyData,
  ActivityLogItem,
  ActivityLogFilters,
  PaginationInfo
} from '@shared/models/api.types'

type TabType = 'profile' | 'company' | 'logs' | 'security'

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    LabelComponent,
    ChangePasswordComponent
  ],
  templateUrl: './account-settings.component.html'
})
export class AccountSettingsComponent implements OnInit, OnDestroy {
  // Icons
  readonly UserIcon = User
  readonly BuildingIcon = Building2
  readonly ClockIcon = Clock
  readonly ShieldIcon = Shield
  readonly SaveIcon = Save
  readonly XIcon = X
  readonly SearchIcon = Search
  readonly FilterIcon = Filter

  // Math for template
  readonly Math = Math

  // State
  activeTab: TabType = 'profile'
  currentUser: UserType | null = null
  isAdmin: boolean = false
  private destroy$ = new Subject<void>()

  // Profile Tab
  profileForm!: FormGroup
  isEditingProfile: boolean = false
  isLoadingProfile: boolean = false
  profileErrorMessage: string = ''
  profileSuccessMessage: string = ''

  // Company Tab
  companyForm!: FormGroup
  companyData: CompanyData | null = null
  isEditingCompany: boolean = false
  isLoadingCompany: boolean = false
  companyErrorMessage: string = ''
  companySuccessMessage: string = ''

  // Activity Logs Tab
  activityLogs: ActivityLogItem[] = []
  isLoadingLogs: boolean = false
  logsErrorMessage: string = ''
  pagination: PaginationInfo = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  }
  filters: ActivityLogFilters = {
    page: 1,
    limit: 20
  }
  showFilters: boolean = false

  constructor(
    private fb: FormBuilder,
    private authStateService: AuthStateService,
    private userService: UserService,
    private settingsService: SettingsService,
    private pageTitleService: PageTitleService
  ) {
    this.initializeForms()
  }

  /**
   * @Function - ngOnInit
   * @description - Lifecycle hook that runs when component initializes
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async ngOnInit(): Promise<void> {
    this.pageTitleService.setTitle('Minha Conta', 'Gerencie suas informações pessoais, dados da empresa e visualize o histórico de atividades')
    this.authStateService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user
        const role = user?.currentOrganization?.role || user?.organizations?.[0]?.role
        this.isAdmin = role === 'Administrador'
        if (user) {
          this.loadProfileData(user)
        }
      })
    await this.loadCompanyData()
    await this.loadActivityLogs()
  }

  /**
   * @Function - ngOnDestroy
   * @description - Lifecycle hook that runs when component is destroyed
   * @author - Vitor Hugo
   * @returns - void
   */
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  /**
   * @Function - initializeForms
   * @description - Initializes all reactive forms
   * @author - Vitor Hugo
   * @returns - void
   */
  private initializeForms(): void {
    // Profile Form
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [phoneValidator()]]
    })

    // Company Form
    this.companyForm = this.fb.group({
      name: ['', [Validators.required]],
      fantasyName: [''],
      cnpj: [''],
      stateRegistration: [''],
      zipCode: [''],
      street: [''],
      number: [''],
      complement: [''],
      neighborhood: [''],
      city: [''],
      state: [''],
      contactPhone: [''],
      contactMobile: [''],
      contactEmail: ['', [Validators.email]],
      website: [''],
      instagram: [''],
      facebook: [''],
      twitter: [''],
      bank: [''],
      agency: [''],
      account: [''],
      accountType: [''],
      pixKey: ['']
    })
  }

  /**
   * @Function - switchTab
   * @description - Switches the active tab
   * @author - Vitor Hugo
   * @param - tab: TabType - The tab to switch to
   * @returns - void
   */
  switchTab(tab: TabType): void {
    this.activeTab = tab
    this.clearMessages()
  }

  /**
   * @Function - clearMessages
   * @description - Clears all success and error messages
   * @author - Vitor Hugo
   * @returns - void
   */
  private clearMessages(): void {
    this.profileErrorMessage = ''
    this.profileSuccessMessage = ''
    this.companyErrorMessage = ''
    this.companySuccessMessage = ''
    this.logsErrorMessage = ''
  }

  // ==================== PROFILE TAB ====================

  /**
   * @Function - loadProfileData
   * @description - Loads user profile data into the form
   * @author - Vitor Hugo
   * @param - user: UserType - User data to load
   * @returns - void
   */
  private loadProfileData(user: UserType): void {
    this.profileForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone || ''
    })
  }

  /**
   * @Function - enableProfileEdit
   * @description - Enables profile editing mode
   * @author - Vitor Hugo
   * @returns - void
   */
  enableProfileEdit(): void {
    this.isEditingProfile = true
    this.clearMessages()
  }

  /**
   * @Function - cancelProfileEdit
   * @description - Cancels profile editing and resets form
   * @author - Vitor Hugo
   * @returns - void
   */
  cancelProfileEdit(): void {
    this.isEditingProfile = false
    if (this.currentUser) {
      this.loadProfileData(this.currentUser)
    }
    this.clearMessages()
  }

  /**
   * @Function - saveProfile
   * @description - Saves profile changes
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid || !this.currentUser) {
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.controls[key].markAsTouched()
      })
      return
    }

    this.isLoadingProfile = true
    this.clearMessages()

    try {
      const formValue = this.profileForm.value
      const updateData = {
        name: formValue.name,
        email: formValue.email,
        phone: formValue.phone || undefined
      }

      const response = await firstValueFrom(
        this.userService.updateUser(this.currentUser.id, updateData)
      )

      if (response.success) {
        this.profileSuccessMessage = 'Perfil atualizado com sucesso!'
        this.isEditingProfile = false
        
        // Refresh user data
        const meResponse = await firstValueFrom(this.authStateService.user$)
        if (meResponse) {
          this.currentUser = meResponse
          this.loadProfileData(meResponse)
        }
      } else {
        this.profileErrorMessage = 'Erro ao atualizar perfil'
      }
    } catch (error: any) {
      if (error.error?.error?.message) {
        this.profileErrorMessage = error.error.error.message
      } else if (error.error?.message) {
        this.profileErrorMessage = error.error.message
      } else {
        this.profileErrorMessage = error.message || 'Erro ao atualizar perfil'
      }
    } finally {
      this.isLoadingProfile = false
    }
  }

  /**
   * @Function - getProfileFieldError
   * @description - Returns the error message for a profile form field
   * @author - Vitor Hugo
   * @param - fieldName: string - Name of the form field
   * @returns - string - Error message or empty string
   */
  getProfileFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      const fieldLabels: Record<string, string> = {
        name: 'Nome',
        email: 'Email',
        phone: 'Telefone'
      }
      return `${fieldLabels[fieldName] || 'Campo'} é obrigatório`
    }
    if (field?.hasError('email') && field.touched) {
      return 'Email inválido'
    }
    if (field?.hasError('minlength') && field.touched) {
      return 'Nome deve ter pelo menos 3 caracteres'
    }
    if (field?.hasError('invalidPhone') && field.touched) {
      return 'Telefone inválido. Use o formato (XX) XXXXX-XXXX'
    }
    return ''
  }

  /**
   * @Function - hasProfileError
   * @description - Checks if a profile form field has an error
   * @author - Vitor Hugo
   * @param - fieldName: string - Name of the form field
   * @returns - boolean - True if field has error and is touched
   */
  hasProfileError(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }

  // ==================== COMPANY TAB ====================

  /**
   * @Function - loadCompanyData
   * @description - Loads company data from API
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadCompanyData(): Promise<void> {
    this.isLoadingCompany = true
    this.companyErrorMessage = ''

    try {
      const response = await firstValueFrom(this.settingsService.getCompanyData())
      if (response.success && response.data) {
        this.companyData = response.data
        this.populateCompanyForm(response.data)
      }
    } catch (error: any) {
      this.companyErrorMessage = error.message || 'Erro ao carregar dados da empresa'
    } finally {
      this.isLoadingCompany = false
    }
  }

  /**
   * @Function - populateCompanyForm
   * @description - Populates company form with data
   * @author - Vitor Hugo
   * @param - data: CompanyData - Company data to populate
   * @returns - void
   */
  private populateCompanyForm(data: CompanyData): void {
    this.companyForm.patchValue({
      name: data.name || '',
      fantasyName: data.fantasyName || '',
      cnpj: data.cnpj || '',
      stateRegistration: data.stateRegistration || '',
      zipCode: data.address?.zipCode || '',
      street: data.address?.street || '',
      number: data.address?.number || '',
      complement: data.address?.complement || '',
      neighborhood: data.address?.neighborhood || '',
      city: data.address?.city || '',
      state: data.address?.state || '',
      contactPhone: data.contact?.phone || '',
      contactMobile: data.contact?.mobile || '',
      contactEmail: data.contact?.email || '',
      website: data.contact?.website || '',
      instagram: data.socialMedia?.instagram || '',
      facebook: data.socialMedia?.facebook || '',
      twitter: data.socialMedia?.twitter || '',
      bank: data.bankInfo?.bank || '',
      agency: data.bankInfo?.agency || '',
      account: data.bankInfo?.account || '',
      accountType: data.bankInfo?.accountType || '',
      pixKey: data.bankInfo?.pixKey || ''
    })
  }

  /**
   * @Function - enableCompanyEdit
   * @description - Enables company editing mode (admin only)
   * @author - Vitor Hugo
   * @returns - void
   */
  enableCompanyEdit(): void {
    if (!this.isAdmin) return
    this.isEditingCompany = true
    this.clearMessages()
  }

  /**
   * @Function - cancelCompanyEdit
   * @description - Cancels company editing and resets form
   * @author - Vitor Hugo
   * @returns - void
   */
  cancelCompanyEdit(): void {
    this.isEditingCompany = false
    if (this.companyData) {
      this.populateCompanyForm(this.companyData)
    }
    this.clearMessages()
  }

  /**
   * @Function - saveCompany
   * @description - Saves company changes
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async saveCompany(): Promise<void> {
    if (this.companyForm.invalid || !this.isAdmin) {
      Object.keys(this.companyForm.controls).forEach(key => {
        this.companyForm.controls[key].markAsTouched()
      })
      return
    }

    this.isLoadingCompany = true
    this.clearMessages()

    try {
      const formValue = this.companyForm.value
      const updateData = {
        name: formValue.name,
        fantasyName: formValue.fantasyName || undefined,
        cnpj: formValue.cnpj || undefined,
        stateRegistration: formValue.stateRegistration || undefined,
        address: {
          zipCode: formValue.zipCode || undefined,
          street: formValue.street || undefined,
          number: formValue.number || undefined,
          complement: formValue.complement || undefined,
          neighborhood: formValue.neighborhood || undefined,
          city: formValue.city || undefined,
          state: formValue.state || undefined
        },
        contact: {
          phone: formValue.contactPhone || undefined,
          mobile: formValue.contactMobile || undefined,
          email: formValue.contactEmail || undefined,
          website: formValue.website || undefined
        },
        socialMedia: {
          instagram: formValue.instagram || undefined,
          facebook: formValue.facebook || undefined,
          twitter: formValue.twitter || undefined
        },
        bankInfo: {
          bank: formValue.bank || undefined,
          agency: formValue.agency || undefined,
          account: formValue.account || undefined,
          accountType: formValue.accountType || undefined,
          pixKey: formValue.pixKey || undefined
        }
      }

      const response = await firstValueFrom(
        this.settingsService.updateCompanyData(updateData)
      )

      if (response.success) {
        this.companySuccessMessage = 'Dados da empresa atualizados com sucesso!'
        this.isEditingCompany = false
        this.companyData = response.data
      } else {
        this.companyErrorMessage = 'Erro ao atualizar dados da empresa'
      }
    } catch (error: any) {
      if (error.error?.error?.message) {
        this.companyErrorMessage = error.error.error.message
      } else if (error.error?.message) {
        this.companyErrorMessage = error.error.message
      } else {
        this.companyErrorMessage = error.message || 'Erro ao atualizar dados da empresa'
      }
    } finally {
      this.isLoadingCompany = false
    }
  }

  /**
   * @Function - getCompanyFieldError
   * @description - Returns the error message for a company form field
   * @author - Vitor Hugo
   * @param - fieldName: string - Name of the form field
   * @returns - string - Error message or empty string
   */
  getCompanyFieldError(fieldName: string): string {
    const field = this.companyForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      return 'Campo obrigatório'
    }
    if (field?.hasError('email') && field.touched) {
      return 'Email inválido'
    }
    return ''
  }

  /**
   * @Function - hasCompanyError
   * @description - Checks if a company form field has an error
   * @author - Vitor Hugo
   * @param - fieldName: string - Name of the form field
   * @returns - boolean - True if field has error and is touched
   */
  hasCompanyError(fieldName: string): boolean {
    const field = this.companyForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }

  // ==================== ACTIVITY LOGS TAB ====================

  /**
   * @Function - loadActivityLogs
   * @description - Loads activity logs from API
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadActivityLogs(): Promise<void> {
    this.isLoadingLogs = true
    this.logsErrorMessage = ''

    try {
      const response = await firstValueFrom(
        this.settingsService.getActivityLogs(this.filters)
      )

      if (response.success) {
        this.activityLogs = response.data
        this.pagination = response.pagination
      }
    } catch (error: any) {
      this.logsErrorMessage = error.message || 'Erro ao carregar logs de atividade'
    } finally {
      this.isLoadingLogs = false
    }
  }

  /**
   * @Function - toggleFilters
   * @description - Toggles the filters visibility
   * @author - Vitor Hugo
   * @returns - void
   */
  toggleFilters(): void {
    this.showFilters = !this.showFilters
  }

  /**
   * @Function - applyFilters
   * @description - Applies filters to activity logs
   * @author - Vitor Hugo
   * @param - filterData: Partial<ActivityLogFilters> - Filter data to apply
   * @returns - Promise<void>
   */
  async applyFilters(filterData: Partial<ActivityLogFilters>): Promise<void> {
    this.filters = {
      ...this.filters,
      ...filterData,
      page: 1
    }
    await this.loadActivityLogs()
  }

  /**
   * @Function - clearFilters
   * @description - Clears all filters
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async clearFilters(): Promise<void> {
    this.filters = {
      page: 1,
      limit: 20
    }
    await this.loadActivityLogs()
  }

  /**
   * @Function - changePage
   * @description - Changes the current page
   * @author - Vitor Hugo
   * @param - page: number - Page number to navigate to
   * @returns - Promise<void>
   */
  async changePage(page: number): Promise<void> {
    this.filters.page = page
    await this.loadActivityLogs()
  }

  /**
   * @Function - formatDate
   * @description - Formats an ISO date string to a readable format
   * @author - Vitor Hugo
   * @param - dateString: string - ISO date string
   * @returns - string - Formatted date string
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

