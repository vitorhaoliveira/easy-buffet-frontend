import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  ChecklistTemplate,
  ChecklistTemplateItem,
  EventChecklist,
  EventChecklistItem,
  CreateChecklistTemplateRequest,
  UpdateChecklistTemplateRequest,
  CreateChecklistTemplateItemRequest,
  UpdateChecklistTemplateItemRequest,
  CreateEventChecklistRequest,
  CreateEventChecklistItemRequest,
  UpdateEventChecklistItemRequest,
  ToggleChecklistItemRequest
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  // ===========================================
  // TEMPLATE METHODS
  // ===========================================

  /**
   * @Function - getTemplates
   * @description - Retrieves all checklist templates
   * @author - Vitor Hugo
   * @param - eventType?: string - Optional filter by event type
   * @returns - Observable<ApiResponse<ChecklistTemplate[]>>
   */
  getTemplates(eventType?: string): Observable<ApiResponse<ChecklistTemplate[]>> {
    let params = new HttpParams()
    if (eventType) {
      params = params.set('eventType', eventType)
    }
    return this.http.get<ApiResponse<ChecklistTemplate[]>>(
      `${this.apiUrl}/checklist-templates`,
      { params }
    )
  }

  /**
   * @Function - getTemplateById
   * @description - Retrieves a specific checklist template with its items
   * @author - Vitor Hugo
   * @param - id: string - Template ID
   * @returns - Observable<ApiResponse<ChecklistTemplate>>
   */
  getTemplateById(id: string): Observable<ApiResponse<ChecklistTemplate>> {
    return this.http.get<ApiResponse<ChecklistTemplate>>(
      `${this.apiUrl}/checklist-templates/${id}`
    )
  }

  /**
   * @Function - createTemplate
   * @description - Creates a new checklist template
   * @author - Vitor Hugo
   * @param - data: CreateChecklistTemplateRequest
   * @returns - Observable<ApiResponse<ChecklistTemplate>>
   */
  createTemplate(data: CreateChecklistTemplateRequest): Observable<ApiResponse<ChecklistTemplate>> {
    return this.http.post<ApiResponse<ChecklistTemplate>>(
      `${this.apiUrl}/checklist-templates`,
      data
    )
  }

  /**
   * @Function - updateTemplate
   * @description - Updates an existing checklist template
   * @author - Vitor Hugo
   * @param - id: string - Template ID
   * @param - data: UpdateChecklistTemplateRequest
   * @returns - Observable<ApiResponse<ChecklistTemplate>>
   */
  updateTemplate(
    id: string,
    data: UpdateChecklistTemplateRequest
  ): Observable<ApiResponse<ChecklistTemplate>> {
    return this.http.put<ApiResponse<ChecklistTemplate>>(
      `${this.apiUrl}/checklist-templates/${id}`,
      data
    )
  }

  /**
   * @Function - deleteTemplate
   * @description - Deletes a checklist template
   * @author - Vitor Hugo
   * @param - id: string - Template ID
   * @returns - Observable<ApiResponse<null>>
   */
  deleteTemplate(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.apiUrl}/checklist-templates/${id}`
    )
  }

  /**
   * @Function - addTemplateItem
   * @description - Adds a new item to a checklist template
   * @author - Vitor Hugo
   * @param - templateId: string
   * @param - data: CreateChecklistTemplateItemRequest
   * @returns - Observable<ApiResponse<ChecklistTemplateItem>>
   */
  addTemplateItem(
    templateId: string,
    data: CreateChecklistTemplateItemRequest
  ): Observable<ApiResponse<ChecklistTemplateItem>> {
    return this.http.post<ApiResponse<ChecklistTemplateItem>>(
      `${this.apiUrl}/checklist-templates/${templateId}/items`,
      data
    )
  }

  /**
   * @Function - updateTemplateItem
   * @description - Updates a template item
   * @author - Vitor Hugo
   * @param - templateId: string
   * @param - itemId: string
   * @param - data: UpdateChecklistTemplateItemRequest
   * @returns - Observable<ApiResponse<ChecklistTemplateItem>>
   */
  updateTemplateItem(
    templateId: string,
    itemId: string,
    data: UpdateChecklistTemplateItemRequest
  ): Observable<ApiResponse<ChecklistTemplateItem>> {
    return this.http.put<ApiResponse<ChecklistTemplateItem>>(
      `${this.apiUrl}/checklist-templates/${templateId}/items/${itemId}`,
      data
    )
  }

  /**
   * @Function - deleteTemplateItem
   * @description - Deletes a template item
   * @author - Vitor Hugo
   * @param - templateId: string
   * @param - itemId: string
   * @returns - Observable<ApiResponse<null>>
   */
  deleteTemplateItem(templateId: string, itemId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.apiUrl}/checklist-templates/${templateId}/items/${itemId}`
    )
  }

  // ===========================================
  // EVENT CHECKLIST METHODS
  // ===========================================

  /**
   * @Function - getEventChecklist
   * @description - Retrieves the checklist for a specific event
   * @author - Vitor Hugo
   * @param - eventId: string - Event ID
   * @returns - Observable<ApiResponse<EventChecklist>>
   */
  getEventChecklist(eventId: string): Observable<ApiResponse<EventChecklist>> {
    return this.http.get<ApiResponse<EventChecklist>>(
      `${this.apiUrl}/events/${eventId}/checklist`
    )
  }

  /**
   * @Function - createEventChecklist
   * @description - Creates a checklist for an event (optionally from template)
   * @author - Vitor Hugo
   * @param - data: CreateEventChecklistRequest
   * @returns - Observable<ApiResponse<EventChecklist>>
   */
  createEventChecklist(data: CreateEventChecklistRequest): Observable<ApiResponse<EventChecklist>> {
    return this.http.post<ApiResponse<EventChecklist>>(
      `${this.apiUrl}/events/${data.eventId}/checklist`,
      data
    )
  }

  /**
   * @Function - addEventChecklistItem
   * @description - Adds a new item to an event checklist
   * @author - Vitor Hugo
   * @param - eventId: string
   * @param - data: CreateEventChecklistItemRequest
   * @returns - Observable<ApiResponse<EventChecklistItem>>
   */
  addEventChecklistItem(
    eventId: string,
    data: CreateEventChecklistItemRequest
  ): Observable<ApiResponse<EventChecklistItem>> {
    return this.http.post<ApiResponse<EventChecklistItem>>(
      `${this.apiUrl}/events/${eventId}/checklist/items`,
      data
    )
  }

  /**
   * @Function - updateEventChecklistItem
   * @description - Updates an event checklist item
   * @author - Vitor Hugo
   * @param - eventId: string
   * @param - itemId: string
   * @param - data: UpdateEventChecklistItemRequest
   * @returns - Observable<ApiResponse<EventChecklistItem>>
   */
  updateEventChecklistItem(
    eventId: string,
    itemId: string,
    data: UpdateEventChecklistItemRequest
  ): Observable<ApiResponse<EventChecklistItem>> {
    return this.http.put<ApiResponse<EventChecklistItem>>(
      `${this.apiUrl}/events/${eventId}/checklist/items/${itemId}`,
      data
    )
  }

  /**
   * @Function - toggleChecklistItem
   * @description - Toggles the completion status of a checklist item
   * @author - Vitor Hugo
   * @param - eventId: string
   * @param - itemId: string
   * @param - data: ToggleChecklistItemRequest
   * @returns - Observable<ApiResponse<EventChecklistItem>>
   */
  toggleChecklistItem(
    eventId: string,
    itemId: string,
    data: ToggleChecklistItemRequest
  ): Observable<ApiResponse<EventChecklistItem>> {
    return this.http.patch<ApiResponse<EventChecklistItem>>(
      `${this.apiUrl}/events/${eventId}/checklist/items/${itemId}/toggle`,
      data
    )
  }

  /**
   * @Function - deleteEventChecklistItem
   * @description - Deletes an event checklist item
   * @author - Vitor Hugo
   * @param - eventId: string
   * @param - itemId: string
   * @returns - Observable<ApiResponse<null>>
   */
  deleteEventChecklistItem(eventId: string, itemId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.apiUrl}/events/${eventId}/checklist/items/${itemId}`
    )
  }

  /**
   * @Function - getUpcomingChecklists
   * @description - Gets a summary of pending checklists for upcoming events
   * @author - Vitor Hugo
   * @param - daysAhead?: number - Number of days to look ahead (default 7)
   * @returns - Observable<ApiResponse<EventChecklist[]>>
   */
  getUpcomingChecklists(daysAhead: number = 7): Observable<ApiResponse<EventChecklist[]>> {
    const params = new HttpParams().set('daysAhead', daysAhead.toString())
    return this.http.get<ApiResponse<EventChecklist[]>>(
      `${this.apiUrl}/checklists/upcoming`,
      { params }
    )
  }
}

