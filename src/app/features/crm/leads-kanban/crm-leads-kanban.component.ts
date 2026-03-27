import { Component, OnDestroy, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { firstValueFrom, Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { PageTitleService } from '@core/services/page-title.service'
import { CrmService } from '@core/services/crm.service'
import { ToastService } from '@core/services/toast.service'
import type { CrmLead, CrmPipelineStage } from '@shared/models/api.types'

@Component({
  selector: 'app-crm-leads-kanban',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './crm-leads-kanban.component.html'
})
export class CrmLeadsKanbanComponent implements OnInit, OnDestroy {
  stages: CrmPipelineStage[] = []
  leads: CrmLead[] = []
  isLoading = true
  error = ''

  private readonly crmService = inject(CrmService)
  private readonly pageTitleService = inject(PageTitleService)
  private readonly toastService = inject(ToastService)
  private readonly destroy$ = new Subject<void>()

  /**
   * @Function - ngOnInit
   * @description - Loads kanban stages and leads in parallel
   * @author - EasyBuffet Team
   * @returns - Promise<void>
   */
  async ngOnInit(): Promise<void> {
    this.pageTitleService.setTitle('CRM - Kanban', 'Acompanhe o funil comercial por etapa')
    this.crmService.crmSync$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event.type === 'interaction-created' || event.type === 'follow-up-created' || event.type === 'follow-up-updated') {
          return
        }

        if (event.type === 'lead-stage-updated' && event.lead) {
          this.upsertLead(event.lead)
          return
        }

        void this.loadData()
      })

    await this.loadData()
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
   * @Function - loadData
   * @description - Fetches stages and leads for kanban rendering
   * @author - EasyBuffet Team
   * @returns - Promise<void>
   */
  async loadData(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const [stagesResponse, leadsResponse] = await Promise.all([
        firstValueFrom(this.crmService.getStages()),
        firstValueFrom(this.crmService.getLeads({ page: 1, limit: 100 }))
      ])
      if (!stagesResponse.success) {
        this.error = stagesResponse.message || 'Erro ao carregar etapas'
        this.toastService.error(this.error)
        return
      }
      if (!leadsResponse.success) {
        this.error = leadsResponse.message || 'Erro ao carregar leads'
        this.toastService.error(this.error)
        return
      }
      this.stages = (stagesResponse.data || []).sort((a, b) => a.orderIndex - b.orderIndex)
      this.leads = leadsResponse.data || []
    } catch (error: unknown) {
      this.error = this.getErrorMessage(error, 'Erro ao carregar kanban')
      this.toastService.error(this.error)
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - getLeadsByStage
   * @description - Filters lead list for a specific pipeline stage
   * @author - EasyBuffet Team
   * @param - stageId: string - Stage identifier
   * @returns - CrmLead[]
   */
  getLeadsByStage(stageId: string): CrmLead[] {
    return this.leads.filter(lead => lead.currentStageId === stageId)
  }

  /**
   * @Function - getPreviousStage
   * @description - Finds immediate previous stage from sorted list
   * @author - EasyBuffet Team
   * @param - stageId: string - Current stage identifier
   * @returns - CrmPipelineStage | null
   */
  getPreviousStage(stageId: string): CrmPipelineStage | null {
    const currentIndex = this.stages.findIndex(stage => stage.id === stageId)
    if (currentIndex <= 0) {
      return null
    }
    return this.stages[currentIndex - 1]
  }

  /**
   * @Function - getNextStage
   * @description - Finds immediate next stage from sorted list
   * @author - EasyBuffet Team
   * @param - stageId: string - Current stage identifier
   * @returns - CrmPipelineStage | null
   */
  getNextStage(stageId: string): CrmPipelineStage | null {
    const currentIndex = this.stages.findIndex(stage => stage.id === stageId)
    if (currentIndex < 0 || currentIndex >= this.stages.length - 1) {
      return null
    }
    return this.stages[currentIndex + 1]
  }

  /**
   * @Function - moveLeadToStage
   * @description - Moves a lead between stages and refreshes the board
   * @author - EasyBuffet Team
   * @param - leadId: string - Lead identifier
   * @param - stageId: string - Target stage identifier
   * @returns - Promise<void>
   */
  async moveLeadToStage(leadId: string, stageId: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.crmService.moveLeadStage(leadId, { stageId }))
      if (response.success && response.data) {
        this.upsertLead(response.data)
      }
      this.toastService.success('Lead movido de etapa com sucesso')
    } catch (error: unknown) {
      this.error = this.getErrorMessage(error, 'Erro ao mover lead de etapa')
      this.toastService.error(this.error)
    }
  }

  /**
   * @Function - upsertLead
   * @description - Updates or inserts a lead in kanban local state
   * @author - EasyBuffet Team
   * @param - lead: CrmLead - Lead payload
   * @returns - void
   */
  private upsertLead(lead: CrmLead): void {
    const index = this.leads.findIndex(item => item.id === lead.id)
    if (index >= 0) {
      const currentLead = this.leads[index]
      this.leads[index] = {
        ...currentLead,
        ...lead,
        // Preserve existing display fields when mutation endpoints return partial payloads
        name: lead.name || currentLead.name,
        phone: lead.phone || currentLead.phone,
        whatsapp: lead.whatsapp || currentLead.whatsapp,
        email: lead.email || currentLead.email,
      }
      return
    }
    this.leads = [lead, ...this.leads]
  }

  /**
   * @Function - getErrorMessage
   * @description - Extracts safe error messages from unknown values
   * @author - EasyBuffet Team
   * @param - error: unknown - Captured error
   * @param - fallback: string - Fallback text
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
