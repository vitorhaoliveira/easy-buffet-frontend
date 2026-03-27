import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, Subject, tap } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  CrmDashboardSummary,
  CrmFollowUp,
  CrmInteraction,
  CrmLead,
  CrmPipelineStage,
  CreateCrmFollowUpRequest,
  CreateCrmInteractionRequest,
  CreateCrmLeadRequest,
  ConvertCrmLeadRequest,
  ConvertCrmLeadResponse,
  GetCrmLeadsParams,
  MoveCrmLeadStageRequest,
  PaginatedResponse,
  UpdateCrmFollowUpRequest,
  UpdateCrmLeadRequest,
} from '@shared/models/api.types'

export type CrmSyncEventType =
  | 'lead-created'
  | 'lead-updated'
  | 'lead-deleted'
  | 'lead-stage-updated'
  | 'lead-converted'
  | 'interaction-created'
  | 'follow-up-created'
  | 'follow-up-updated'

export interface CrmSyncEvent {
  type: CrmSyncEventType
  leadId?: string
  lead?: CrmLead
  source?: 'leads-list' | 'leads-kanban' | 'lead-detail' | 'dashboard' | 'system'
}

@Injectable({
  providedIn: 'root'
})
export class CrmService {
  private readonly apiUrl = environment.apiBaseUrl
  private readonly http = inject(HttpClient)
  private readonly crmSyncSubject = new Subject<CrmSyncEvent>()
  readonly crmSync$ = this.crmSyncSubject.asObservable()

  /**
   * @Function - notifyCrmSync
   * @description - Broadcasts CRM synchronization events to all CRM screens
   * @author - EasyBuffet Team
   * @param - event: CrmSyncEvent - Event payload
   * @returns - void
   */
  notifyCrmSync(event: CrmSyncEvent): void {
    this.crmSyncSubject.next(event)
  }

  /**
   * @Function - getLeads
   * @description - Retrieves paginated CRM leads with optional filters
   * @author - EasyBuffet Team
   * @param - params: GetCrmLeadsParams - listing filters
   * @returns - Observable<PaginatedResponse<CrmLead>>
   */
  getLeads(params: GetCrmLeadsParams = {}): Observable<PaginatedResponse<CrmLead>> {
    let httpParams = new HttpParams()
    const safeLimit = params.limit != null ? Math.min(Math.max(params.limit, 1), 100) : undefined
    if (params.page != null) httpParams = httpParams.set('page', String(params.page))
    if (safeLimit != null) httpParams = httpParams.set('limit', String(safeLimit))
    if (params.search) httpParams = httpParams.set('search', params.search)
    if (params.status) httpParams = httpParams.set('status', params.status)
    if (params.stageId) httpParams = httpParams.set('stageId', params.stageId)
    if (params.ownerId) httpParams = httpParams.set('ownerId', params.ownerId)
    if (params.origin) httpParams = httpParams.set('origin', params.origin)
    return this.http.get<PaginatedResponse<CrmLead>>(`${this.apiUrl}/crm/leads`, { params: httpParams })
  }

  /**
   * @Function - getLeadById
   * @description - Retrieves one lead by identifier
   * @author - EasyBuffet Team
   * @param - id: string - Lead identifier
   * @returns - Observable<ApiResponse<CrmLead>>
   */
  getLeadById(id: string): Observable<ApiResponse<CrmLead>> {
    return this.http.get<ApiResponse<CrmLead>>(`${this.apiUrl}/crm/leads/${id}`)
  }

  /**
   * @Function - createLead
   * @description - Creates a new lead in CRM
   * @author - EasyBuffet Team
   * @param - payload: CreateCrmLeadRequest - Lead payload
   * @returns - Observable<ApiResponse<CrmLead>>
   */
  createLead(payload: CreateCrmLeadRequest): Observable<ApiResponse<CrmLead>> {
    return this.http.post<ApiResponse<CrmLead>>(`${this.apiUrl}/crm/leads`, payload).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.notifyCrmSync({ type: 'lead-created', leadId: response.data.id, lead: response.data, source: 'system' })
        }
      })
    )
  }

  /**
   * @Function - updateLead
   * @description - Updates an existing lead
   * @author - EasyBuffet Team
   * @param - id: string - Lead identifier
   * @param - payload: UpdateCrmLeadRequest - Partial update data
   * @returns - Observable<ApiResponse<CrmLead>>
   */
  updateLead(id: string, payload: UpdateCrmLeadRequest): Observable<ApiResponse<CrmLead>> {
    return this.http.patch<ApiResponse<CrmLead>>(`${this.apiUrl}/crm/leads/${id}`, payload).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.notifyCrmSync({ type: 'lead-updated', leadId: response.data.id, lead: response.data, source: 'system' })
        }
      })
    )
  }

  /**
   * @Function - deleteLead
   * @description - Deletes a lead from CRM
   * @author - EasyBuffet Team
   * @param - id: string - Lead identifier
   * @returns - Observable<ApiResponse<null>>
   */
  deleteLead(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/crm/leads/${id}`).pipe(
      tap(response => {
        if (response.success) {
          this.notifyCrmSync({ type: 'lead-deleted', leadId: id, source: 'system' })
        }
      })
    )
  }

  /**
   * @Function - moveLeadStage
   * @description - Moves a lead to another pipeline stage
   * @author - EasyBuffet Team
   * @param - id: string - Lead identifier
   * @param - payload: MoveCrmLeadStageRequest - Stage transition payload
   * @returns - Observable<ApiResponse<CrmLead>>
   */
  moveLeadStage(id: string, payload: MoveCrmLeadStageRequest): Observable<ApiResponse<CrmLead>> {
    return this.http.patch<ApiResponse<CrmLead>>(`${this.apiUrl}/crm/leads/${id}/stage`, payload).pipe(
      tap(response => {
        if (response.success) {
          this.notifyCrmSync({
            type: 'lead-stage-updated',
            leadId: id,
            lead: response.data ?? undefined,
            source: 'system'
          })
        }
      })
    )
  }

  /**
   * @Function - convertLead
   * @description - Converts lead to client and optionally quote draft
   * @author - EasyBuffet Team
   * @param - id: string - Lead identifier
   * @param - payload: ConvertCrmLeadRequest - Conversion options
   * @returns - Observable<ApiResponse<ConvertCrmLeadResponse>>
   */
  convertLead(id: string, payload: ConvertCrmLeadRequest = {}): Observable<ApiResponse<ConvertCrmLeadResponse>> {
    return this.http.post<ApiResponse<ConvertCrmLeadResponse>>(`${this.apiUrl}/crm/leads/${id}/convert`, payload).pipe(
      tap(response => {
        if (response.success) {
          this.notifyCrmSync({ type: 'lead-converted', leadId: id, source: 'system' })
        }
      })
    )
  }

  /**
   * @Function - getStages
   * @description - Retrieves pipeline stages ordered by display position
   * @author - EasyBuffet Team
   * @returns - Observable<ApiResponse<CrmPipelineStage[]>>
   */
  getStages(): Observable<ApiResponse<CrmPipelineStage[]>> {
    return this.http.get<ApiResponse<CrmPipelineStage[]>>(`${this.apiUrl}/crm/pipeline/stages`)
  }

  /**
   * @Function - getInteractions
   * @description - Retrieves lead interaction history
   * @author - EasyBuffet Team
   * @param - leadId: string - Lead identifier
   * @returns - Observable<ApiResponse<CrmInteraction[]>>
   */
  getInteractions(leadId: string): Observable<ApiResponse<CrmInteraction[]>> {
    return this.http.get<ApiResponse<CrmInteraction[]>>(`${this.apiUrl}/crm/leads/${leadId}/interactions`)
  }

  /**
   * @Function - createInteraction
   * @description - Creates a timeline interaction for a lead
   * @author - EasyBuffet Team
   * @param - leadId: string - Lead identifier
   * @param - payload: CreateCrmInteractionRequest - Interaction data
   * @returns - Observable<ApiResponse<CrmInteraction>>
   */
  createInteraction(leadId: string, payload: CreateCrmInteractionRequest): Observable<ApiResponse<CrmInteraction>> {
    return this.http.post<ApiResponse<CrmInteraction>>(`${this.apiUrl}/crm/leads/${leadId}/interactions`, payload).pipe(
      tap(response => {
        if (response.success) {
          this.notifyCrmSync({ type: 'interaction-created', leadId, source: 'system' })
        }
      })
    )
  }

  /**
   * @Function - getFollowUps
   * @description - Retrieves follow-ups for a lead
   * @author - EasyBuffet Team
   * @param - leadId: string - Lead identifier
   * @returns - Observable<ApiResponse<CrmFollowUp[]>>
   */
  getFollowUps(leadId: string): Observable<ApiResponse<CrmFollowUp[]>> {
    return this.http.get<ApiResponse<CrmFollowUp[]>>(`${this.apiUrl}/crm/leads/${leadId}/follow-ups`)
  }

  /**
   * @Function - createFollowUp
   * @description - Creates a follow-up entry for a lead
   * @author - EasyBuffet Team
   * @param - leadId: string - Lead identifier
   * @param - payload: CreateCrmFollowUpRequest - Follow-up payload
   * @returns - Observable<ApiResponse<CrmFollowUp>>
   */
  createFollowUp(leadId: string, payload: CreateCrmFollowUpRequest): Observable<ApiResponse<CrmFollowUp>> {
    return this.http.post<ApiResponse<CrmFollowUp>>(`${this.apiUrl}/crm/leads/${leadId}/follow-ups`, payload).pipe(
      tap(response => {
        if (response.success) {
          this.notifyCrmSync({ type: 'follow-up-created', leadId, source: 'system' })
        }
      })
    )
  }

  /**
   * @Function - updateFollowUp
   * @description - Updates a follow-up status or content
   * @author - EasyBuffet Team
   * @param - followUpId: string - Follow-up identifier
   * @param - payload: UpdateCrmFollowUpRequest - Follow-up update
   * @returns - Observable<ApiResponse<CrmFollowUp>>
   */
  updateFollowUp(followUpId: string, payload: UpdateCrmFollowUpRequest): Observable<ApiResponse<CrmFollowUp>> {
    return this.http.patch<ApiResponse<CrmFollowUp>>(`${this.apiUrl}/crm/follow-ups/${followUpId}`, payload).pipe(
      tap(response => {
        if (response.success) {
          this.notifyCrmSync({
            type: 'follow-up-updated',
            leadId: response.data?.leadId,
            source: 'system'
          })
        }
      })
    )
  }

  /**
   * @Function - getDashboardSummary
   * @description - Retrieves CRM summary metrics for the current organization
   * @author - EasyBuffet Team
   * @returns - Observable<ApiResponse<CrmDashboardSummary>>
   */
  getDashboardSummary(): Observable<ApiResponse<CrmDashboardSummary>> {
    return this.http.get<ApiResponse<CrmDashboardSummary>>(`${this.apiUrl}/crm/dashboard/summary`)
  }
}
