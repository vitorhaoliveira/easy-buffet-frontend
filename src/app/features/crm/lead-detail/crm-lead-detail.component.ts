import { Component, OnDestroy, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { firstValueFrom, Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { PageTitleService } from '@core/services/page-title.service'
import { CrmService } from '@core/services/crm.service'
import { ToastService } from '@core/services/toast.service'
import type {
  CrmFollowUp,
  CrmInteraction,
  CrmInteractionType,
  CrmLead,
  CrmPipelineStage
} from '@shared/models/api.types'

@Component({
  selector: 'app-crm-lead-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './crm-lead-detail.component.html'
})
export class CrmLeadDetailComponent implements OnInit, OnDestroy {
  leadId = ''
  lead: CrmLead | null = null
  stages: CrmPipelineStage[] = []
  interactions: CrmInteraction[] = []
  followUps: CrmFollowUp[] = []
  isLoading = true
  error = ''

  newInteraction = {
    type: 'nota' as CrmInteractionType,
    description: ''
  }
  newFollowUp = {
    dueDate: '',
    note: ''
  }
  isSavingInteraction = false
  isSavingFollowUp = false
  isConvertingLead = false

  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly crmService = inject(CrmService)
  private readonly pageTitleService = inject(PageTitleService)
  private readonly toastService = inject(ToastService)
  private readonly destroy$ = new Subject<void>()

  /**
   * @Function - ngOnInit
   * @description - Loads lead context and related CRM data
   * @author - EasyBuffet Team
   * @returns - Promise<void>
   */
  async ngOnInit(): Promise<void> {
    this.leadId = this.route.snapshot.paramMap.get('id') || ''
    if (!this.leadId) {
      this.error = 'Lead inválido'
      return
    }
    this.pageTitleService.setTitle('CRM - Detalhe do Lead', 'Histórico, follow-up e conversão')
    this.crmService.crmSync$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (!this.leadId || event.leadId !== this.leadId) {
          return
        }

        if (event.lead && (event.type === 'lead-updated' || event.type === 'lead-stage-updated')) {
          this.lead = {
            ...this.lead,
            ...event.lead
          }
          return
        }

        if (
          event.type === 'lead-converted' ||
          event.type === 'interaction-created' ||
          event.type === 'follow-up-created' ||
          event.type === 'follow-up-updated'
        ) {
          void this.loadData()
        }
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
   * @description - Retrieves lead, pipeline stages, interactions and follow-ups
   * @author - EasyBuffet Team
   * @returns - Promise<void>
   */
  async loadData(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const [leadResponse, stagesResponse, interactionsResponse, followUpsResponse] = await Promise.all([
        firstValueFrom(this.crmService.getLeadById(this.leadId)),
        firstValueFrom(this.crmService.getStages()),
        firstValueFrom(this.crmService.getInteractions(this.leadId)),
        firstValueFrom(this.crmService.getFollowUps(this.leadId))
      ])
      if (!leadResponse.success || !leadResponse.data) {
        this.error = leadResponse.message || 'Não foi possível carregar lead'
        return
      }
      this.lead = leadResponse.data
      this.stages = (stagesResponse.data || []).sort((a, b) => a.orderIndex - b.orderIndex)
      this.interactions = interactionsResponse.data || []
      this.followUps = followUpsResponse.data || []
      this.pageTitleService.setTitle(`CRM - ${this.lead.name}`, 'Histórico, follow-up e conversão')
    } catch (error: unknown) {
      this.error = this.getErrorMessage(error, 'Erro ao carregar detalhes do lead')
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - getWhatsappLink
   * @description - Builds wa.me URL with encoded pre-filled message
   * @author - EasyBuffet Team
   * @param - template: string - Message template text
   * @returns - string | null
   */
  getWhatsappLink(template: string): string | null {
    if (!this.lead) {
      return null
    }
    const rawPhone = this.lead.whatsapp || this.lead.phone || ''
    const normalizedPhone = rawPhone.replace(/\D/g, '')
    if (!normalizedPhone) {
      return null
    }
    const message = template.replace('{{nome}}', this.lead.name)
    return `https://wa.me/55${normalizedPhone}?text=${encodeURIComponent(message)}`
  }

  /**
   * @Function - sendWhatsappTemplate
   * @description - Opens WhatsApp link and records interaction in timeline
   * @author - EasyBuffet Team
   * @param - template: string - Message template
   * @returns - Promise<void>
   */
  async sendWhatsappTemplate(template: string): Promise<void> {
    const link = this.getWhatsappLink(template)
    if (!link || !this.lead) {
      this.error = 'Lead sem número de WhatsApp válido'
      this.toastService.warning(this.error)
      return
    }
    window.open(link, '_blank')
    try {
      await firstValueFrom(this.crmService.createInteraction(this.lead.id, {
        type: 'whatsapp',
        description: `Mensagem enviada via WhatsApp: ${template}`
      }))
      this.toastService.success('WhatsApp aberto e interação registrada com sucesso')
      await this.loadData()
    } catch {
      // Failing to log interaction should not block the main action.
      this.toastService.info('WhatsApp aberto. Não foi possível registrar a interação automaticamente')
    }
  }

  /**
   * @Function - moveStage
   * @description - Moves current lead to selected stage
   * @author - EasyBuffet Team
   * @param - stageId: string - Target stage identifier
   * @returns - Promise<void>
   */
  async moveStage(stageId: string): Promise<void> {
    if (!this.lead) {
      return
    }
    try {
      await firstValueFrom(this.crmService.moveLeadStage(this.lead.id, { stageId }))
      this.toastService.success('Etapa do lead atualizada com sucesso')
      await this.loadData()
    } catch (error: unknown) {
      this.error = this.getErrorMessage(error, 'Erro ao atualizar etapa')
      this.toastService.error(this.error)
    }
  }

  /**
   * @Function - saveInteraction
   * @description - Persists a manual interaction and reloads timeline
   * @author - EasyBuffet Team
   * @returns - Promise<void>
   */
  async saveInteraction(): Promise<void> {
    if (!this.lead || !this.newInteraction.description.trim()) {
      return
    }
    try {
      this.isSavingInteraction = true
      await firstValueFrom(this.crmService.createInteraction(this.lead.id, {
        type: this.newInteraction.type,
        description: this.newInteraction.description.trim()
      }))
      this.newInteraction.description = ''
      this.toastService.success('Interação adicionada com sucesso')
      await this.loadData()
    } catch (error: unknown) {
      this.error = this.getErrorMessage(error, 'Erro ao salvar interação')
      this.toastService.error(this.error)
    } finally {
      this.isSavingInteraction = false
    }
  }

  /**
   * @Function - saveFollowUp
   * @description - Creates a new follow-up entry for this lead
   * @author - EasyBuffet Team
   * @returns - Promise<void>
   */
  async saveFollowUp(): Promise<void> {
    if (!this.lead || !this.newFollowUp.dueDate || !this.newFollowUp.note.trim()) {
      return
    }
    try {
      this.isSavingFollowUp = true
      const dueDateValue = this.toApiDate(this.newFollowUp.dueDate)
      await firstValueFrom(this.crmService.createFollowUp(this.lead.id, {
        dueDate: dueDateValue,
        note: this.newFollowUp.note.trim()
      }))
      this.newFollowUp = { dueDate: '', note: '' }
      this.toastService.success('Follow-up adicionado com sucesso')
      await this.loadData()
    } catch (error: unknown) {
      this.error = this.getErrorMessage(error, 'Erro ao salvar follow-up')
      this.toastService.error(this.error)
    } finally {
      this.isSavingFollowUp = false
    }
  }

  /**
   * @Function - toggleFollowUpDone
   * @description - Updates follow-up completion status
   * @author - EasyBuffet Team
   * @param - followUp: CrmFollowUp - Follow-up entry
   * @returns - Promise<void>
   */
  async toggleFollowUpDone(followUp: CrmFollowUp): Promise<void> {
    const nextStatus = followUp.status === 'done' ? 'pending' : 'done'
    try {
      await firstValueFrom(this.crmService.updateFollowUp(followUp.id, { status: nextStatus }))
      this.toastService.success(nextStatus === 'done' ? 'Follow-up concluído com sucesso' : 'Follow-up reaberto com sucesso')
      await this.loadData()
    } catch (error: unknown) {
      this.error = this.getErrorMessage(error, 'Erro ao atualizar follow-up')
      this.toastService.error(this.error)
    }
  }

  /**
   * @Function - convertLead
   * @description - Converts lead to client and routes to quote when available
   * @author - EasyBuffet Team
   * @returns - Promise<void>
   */
  async convertLead(): Promise<void> {
    if (!this.lead || this.isLeadConverted()) {
      if (this.lead && this.isLeadConverted()) {
        this.toastService.info('Este lead já foi convertido')
      }
      return
    }
    try {
      this.isConvertingLead = true
      const response = await firstValueFrom(this.crmService.convertLead(this.lead.id, { createQuoteDraft: true }))
      if (response.success && response.data?.quoteId) {
        this.applyConvertedStateFromResponse()
        this.toastService.success('Lead convertido com sucesso. Redirecionando para orçamento...')
        await this.router.navigate(['/cadastros/orcamentos/editar', response.data.quoteId])
        return
      }
      if (response.success) {
        this.applyConvertedStateFromResponse()
        this.toastService.success('Lead convertido com sucesso')
      }
      await this.loadData()
    } catch (error: unknown) {
      this.error = this.getErrorMessage(error, 'Erro ao converter lead')
      this.toastService.error(this.error)
    } finally {
      this.isConvertingLead = false
    }
  }

  /**
   * @Function - isLeadConverted
   * @description - Checks whether the current lead is already converted
   * @author - EasyBuffet Team
   * @returns - boolean
   */
  isLeadConverted(): boolean {
    if (!this.lead) {
      return false
    }

    const normalizedStatus = String(this.lead.status || '').trim().toLowerCase()
    const normalizedStage = String(this.lead.currentStage?.name || '').trim().toLowerCase()

    const convertedStatuses = new Set(['convertido', 'converted', 'won', 'closed'])
    const convertedStages = new Set(['fechado', 'closed', 'ganho', 'won'])

    return Boolean(
      convertedStatuses.has(normalizedStatus) ||
      convertedStages.has(normalizedStage)
    )
  }

  /**
   * @Function - getDisplayStatus
   * @description - Returns a normalized status label for UI display
   * @author - EasyBuffet Team
   * @returns - string
   */
  getDisplayStatus(): string {
    if (!this.lead) {
      return '-'
    }
    const normalizedStatus = String(this.lead.status || '').trim().toLowerCase()
    const statusMap: Record<string, string> = {
      ativo: 'Ativo',
      active: 'Ativo',
      open: 'Aberto',
      aberto: 'Aberto',
      perdido: 'Perdido',
      lost: 'Perdido',
      convertido: 'Convertido',
      converted: 'Convertido',
      won: 'Convertido',
      closed: 'Convertido'
    }
    return statusMap[normalizedStatus] || String(this.lead.status || '-')
  }

  /**
   * @Function - isFollowUpOverdue
   * @description - Checks whether follow-up is pending and due date is in the past
   * @author - EasyBuffet Team
   * @param - followUp: CrmFollowUp - Follow-up item
   * @returns - boolean
   */
  isFollowUpOverdue(followUp: CrmFollowUp): boolean {
    if (followUp.status === 'done') {
      return false
    }
    if (typeof followUp.isOverdue === 'boolean') {
      return followUp.isOverdue
    }

    const dueDate = this.parseDateSafe(followUp.dueDate)
    const dueDateEndOfDay = new Date(dueDate)
    dueDateEndOfDay.setHours(23, 59, 59, 999)
    return dueDateEndOfDay.getTime() < Date.now()
  }

  /**
   * @Function - formatFollowUpDueDate
   * @description - Formats follow-up due date as date-only, avoiding timezone day shifts
   * @author - EasyBuffet Team
   * @param - value: string - Due date from API
   * @returns - string
   */
  formatFollowUpDueDate(value: string): string {
    const isUtcMidnight = /^\d{4}-\d{2}-\d{2}T00:00:00(?:\.000)?Z$/.test(value)
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return value
    }

    if (isUtcMidnight) {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
      }).format(date)
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  /**
   * @Function - formatDateTime
   * @description - Formats timestamp values using local timezone in pt-BR
   * @author - EasyBuffet Team
   * @param - value: string - Date string from API
   * @returns - string
   */
  formatDateTime(value: string): string {
    const date = this.parseDateSafe(value)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date)
  }

  /**
   * @Function - getErrorMessage
   * @description - Normalizes unknown error values to a readable message
   * @author - EasyBuffet Team
   * @param - error: unknown - Runtime error
   * @param - fallback: string - Default text
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

  /**
   * @Function - parseDateSafe
   * @description - Parses date strings and preserves local wall-clock for values without timezone
   * @author - EasyBuffet Team
   * @param - value: string - API date
   * @returns - Date
   */
  private parseDateSafe(value: string): Date {
    const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(value)
    if (hasTimezone) {
      return new Date(value)
    }

    const localValue = value.replace(' ', 'T')
    const localDate = new Date(localValue)
    if (!Number.isNaN(localDate.getTime())) {
      return localDate
    }

    return new Date(value)
  }

  /**
   * @Function - toApiDate
   * @description - Converts local date input to YYYY-MM-DD for API date-only fields
   * @author - EasyBuffet Team
   * @param - localDate: string - date value (yyyy-MM-dd)
   * @returns - string
   */
  private toApiDate(localDate: string): string {
    const safeValue = localDate.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(safeValue)) {
      return safeValue
    }
    const parsed = new Date(safeValue)
    if (Number.isNaN(parsed.getTime())) {
      return safeValue
    }
    return parsed.toISOString().slice(0, 10)
  }

  /**
   * @Function - applyConvertedStateFromResponse
   * @description - Applies converted state optimistically in UI after successful conversion
   * @author - EasyBuffet Team
   * @returns - void
   */
  private applyConvertedStateFromResponse(): void {
    if (!this.lead) {
      return
    }

    this.lead = {
      ...this.lead,
      status: 'convertido'
    }
  }
}
