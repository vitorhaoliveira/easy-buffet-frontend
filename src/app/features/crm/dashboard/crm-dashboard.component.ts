import { Component, OnDestroy, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { firstValueFrom, Subject } from 'rxjs'
import { debounceTime, takeUntil } from 'rxjs/operators'
import { CrmService } from '@core/services/crm.service'
import { PageTitleService } from '@core/services/page-title.service'
import { ToastService } from '@core/services/toast.service'
import type { CrmDashboardSummary, CrmLead } from '@shared/models/api.types'

@Component({
  selector: 'app-crm-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crm-dashboard.component.html'
})
export class CrmDashboardComponent implements OnInit, OnDestroy {
  summary: CrmDashboardSummary | null = null
  leads: CrmLead[] = []
  isLoading = true
  error = ''

  private readonly crmService = inject(CrmService)
  private readonly pageTitleService = inject(PageTitleService)
  private readonly toastService = inject(ToastService)
  private readonly destroy$ = new Subject<void>()

  /**
   * @Function - ngOnInit
   * @description - Loads CRM dashboard cards and supporting lead data
   * @author - EasyBuffet Team
   * @returns - Promise<void>
   */
  async ngOnInit(): Promise<void> {
    this.pageTitleService.setTitle('CRM - Dashboard', 'Visão rápida da operação comercial')
    this.crmService.crmSync$
      .pipe(
        debounceTime(200),
        takeUntil(this.destroy$)
      )
      .subscribe(event => {
        if (event.type === 'interaction-created') {
          return
        }
        void this.loadDashboard()
      })
    await this.loadDashboard()
  }

  /**
   * @Function - ngOnDestroy
   * @description - Completes subscriptions to avoid memory leaks
   * @author - EasyBuffet Team
   * @returns - void
   */
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  /**
   * @Function - loadDashboard
   * @description - Fetches summary metrics and lead dataset for charts/lists
   * @author - EasyBuffet Team
   * @returns - Promise<void>
   */
  async loadDashboard(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const [summaryResponse, leadsResponse] = await Promise.all([
        firstValueFrom(this.crmService.getDashboardSummary()),
        firstValueFrom(this.crmService.getLeads({ page: 1, limit: 100 }))
      ])
      if (!summaryResponse.success) {
        this.error = summaryResponse.message || 'Erro ao carregar dashboard'
        this.toastService.error(this.error)
        return
      }
      this.summary = summaryResponse.data
      this.leads = leadsResponse.data || []
    } catch (error: unknown) {
      this.error = this.getErrorMessage(error, 'Erro ao carregar dashboard')
      this.toastService.error(this.error)
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - getConvertedLeads
   * @description - Returns number of converted leads from loaded list
   * @author - EasyBuffet Team
   * @returns - number
   */
  getConvertedLeads(): number {
    return this.leads.filter(lead => lead.status === 'convertido').length
  }

  /**
   * @Function - getLostLeads
   * @description - Returns number of lost leads from loaded list
   * @author - EasyBuffet Team
   * @returns - number
   */
  getLostLeads(): number {
    return this.leads.filter(lead => lead.status === 'perdido').length
  }

  /**
   * @Function - getErrorMessage
   * @description - Converts unknown errors into display-friendly message
   * @author - EasyBuffet Team
   * @param - error: unknown - Error payload
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
