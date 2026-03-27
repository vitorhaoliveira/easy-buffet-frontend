import { Component, OnDestroy, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { firstValueFrom, Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators'
import { LucideAngularModule, Plus, RefreshCw } from 'lucide-angular'
import { PageTitleService } from '@core/services/page-title.service'
import { CrmService } from '@core/services/crm.service'
import { ToastService } from '@core/services/toast.service'
import type { CrmLead, CrmLeadStatus, PaginationInfo } from '@shared/models/api.types'

@Component({
  selector: 'app-crm-leads-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './crm-leads-list.component.html'
})
export class CrmLeadsListComponent implements OnInit, OnDestroy {
  readonly PlusIcon = Plus
  readonly RefreshCwIcon = RefreshCw

  leads: CrmLead[] = []
  isLoading = true
  error = ''
  searchTerm = ''
  selectedStatus: CrmLeadStatus | 'all' = 'all'
  pagination: PaginationInfo | null = null
  page = 1
  limit = 20

  createLeadModel = {
    name: '',
    whatsapp: '',
    email: '',
    origin: 'whatsapp'
  }
  isCreatingLead = false

  private readonly searchTrigger$ = new Subject<string>()
  private readonly destroy$ = new Subject<void>()
  private readonly crmService = inject(CrmService)
  private readonly pageTitleService = inject(PageTitleService)
  private readonly router = inject(Router)
  private readonly toastService = inject(ToastService)

  /**
   * @Function - ngOnInit
   * @description - Initializes CRM leads list and search subscription
   * @author - EasyBuffet Team
   * @returns - Promise<void>
   */
  async ngOnInit(): Promise<void> {
    this.pageTitleService.setTitle('CRM - Leads', 'Gerencie seus contatos e oportunidades')
    this.searchTrigger$
      .pipe(
        debounceTime(350),
        map(value => value.trim()),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.page = 1
        void this.loadLeads()
      })

    this.crmService.crmSync$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event.type === 'interaction-created' || event.type === 'follow-up-created' || event.type === 'follow-up-updated') {
          return
        }
        void this.loadLeads()
      })

    await this.loadLeads()
  }

  /**
   * @Function - ngOnDestroy
   * @description - Completes subscriptions to avoid leaks
   * @author - EasyBuffet Team
   * @returns - void
   */
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  /**
   * @Function - loadLeads
   * @description - Loads lead data with current filters and pagination
   * @author - EasyBuffet Team
   * @returns - Promise<void>
   */
  async loadLeads(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const response = await firstValueFrom(this.crmService.getLeads({
        page: this.page,
        limit: this.limit,
        search: this.searchTerm.trim() || undefined,
        status: this.selectedStatus === 'all' ? undefined : this.selectedStatus
      }))
      if (response.success) {
        this.leads = response.data || []
        this.pagination = response.pagination ?? null
      } else {
        this.error = response.message || 'Erro ao carregar leads'
        this.toastService.error(this.error)
      }
    } catch (error: unknown) {
      this.error = this.getErrorMessage(error, 'Erro ao carregar leads')
      this.toastService.error(this.error)
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - onSearchChange
   * @description - Triggers debounced search query updates
   * @author - EasyBuffet Team
   * @param - value: string - Search text
   * @returns - void
   */
  onSearchChange(value: string): void {
    this.searchTrigger$.next(value)
  }

  /**
   * @Function - onStatusChange
   * @description - Applies status filter and reloads list
   * @author - EasyBuffet Team
   * @returns - Promise<void>
   */
  async onStatusChange(): Promise<void> {
    this.page = 1
    await this.loadLeads()
  }

  /**
   * @Function - setPage
   * @description - Changes pagination page and reloads data
   * @author - EasyBuffet Team
   * @param - page: number - New page number
   * @returns - Promise<void>
   */
  async setPage(page: number): Promise<void> {
    if (page < 1 || (this.pagination && page > this.pagination.totalPages)) {
      return
    }
    this.page = page
    await this.loadLeads()
  }

  /**
   * @Function - createLead
   * @description - Creates a quick lead from top form and opens detail
   * @author - EasyBuffet Team
   * @returns - Promise<void>
   */
  async createLead(): Promise<void> {
    if (!this.createLeadModel.name.trim()) {
      this.error = 'Nome do lead é obrigatório'
      this.toastService.warning(this.error)
      return
    }
    try {
      this.isCreatingLead = true
      const response = await firstValueFrom(this.crmService.createLead({
        name: this.createLeadModel.name.trim(),
        whatsapp: this.createLeadModel.whatsapp.trim() || undefined,
        phone: this.createLeadModel.whatsapp.trim() || undefined,
        email: this.createLeadModel.email.trim() || undefined,
        origin: this.createLeadModel.origin
      }))
      if (response.success && response.data) {
        this.createLeadModel = { name: '', whatsapp: '', email: '', origin: 'whatsapp' }
        this.toastService.success('Lead criado com sucesso')
        await this.router.navigate(['/crm/leads', response.data.id])
        return
      }
      this.error = response.message || 'Erro ao criar lead'
      this.toastService.error(this.error)
    } catch (error: unknown) {
      this.error = this.getErrorMessage(error, 'Erro ao criar lead')
      this.toastService.error(this.error)
    } finally {
      this.isCreatingLead = false
    }
  }

  /**
   * @Function - getErrorMessage
   * @description - Extracts a readable message from unknown errors
   * @author - EasyBuffet Team
   * @param - error: unknown - Captured error
   * @param - fallback: string - Default message
   * @returns - string
   */
  private getErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message?: unknown }).message
      if (typeof message === 'string' && message.trim()) {
        return message
      }
    }
    return fallback
  }
}
