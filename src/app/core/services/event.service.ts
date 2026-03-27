import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Event,
  EventHubData,
  CreateEventRequest,
  UpdateEventRequest,
  PaginatedResponse,
} from '@shared/models/api.types'

export interface GetEventsParams {
  page?: number
  limit?: number
  unitId?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  clientId?: string
  /** Full-text search (sent as `search` query param; backend also accepts q/term) */
  search?: string
  /** Slim projection for grid: `list`. Default on API is `full`. Alias: use `fields` */
  view?: 'list' | 'full'
  /** Backend alias for view=list */
  fields?: 'minimal'
}

/** Query flags for GET /events/:id/hub (booleans as query strings on the API) */
export interface EventHubQueryOptions {
  includeReferenceLists?: boolean
  includeContract?: boolean
  clientsLimit?: number
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  /**
   * @Function - getEvents
   * @description - Retrieves a list of events, optionally filtered by unit (non-paginated, for dropdowns etc.)
   * @author - Vitor Hugo
   * @param - unitId?: string - Optional filter for events by unit
   * @returns - Observable<ApiResponse<Event[]>>
   */
  getEvents(unitId?: string): Observable<ApiResponse<Event[]>> {
    let params = new HttpParams()
    if (unitId) {
      params = params.set('unitId', unitId)
    }
    return this.http.get<ApiResponse<Event[]>>(`${this.apiUrl}/events`, { params })
  }

  /**
   * @Function - getEventsPaginated
   * @description - Retrieves a paginated list of events with optional filters
   * @author - Vitor Hugo
   * @param - params: GetEventsParams - page, limit, unitId, status, dateFrom, dateTo, clientId, search, view, fields
   * @returns - Observable<PaginatedResponse<Event>> — with view=list the API returns a slim row shape (see EventListItem)
   */
  getEventsPaginated(params: GetEventsParams = {}): Observable<PaginatedResponse<Event>> {
    let httpParams = new HttpParams()
    if (params.page != null) httpParams = httpParams.set('page', String(params.page))
    if (params.limit != null) httpParams = httpParams.set('limit', String(params.limit))
    if (params.unitId) httpParams = httpParams.set('unitId', params.unitId)
    if (params.status) httpParams = httpParams.set('status', params.status)
    if (params.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom)
    if (params.dateTo) httpParams = httpParams.set('dateTo', params.dateTo)
    if (params.clientId) httpParams = httpParams.set('clientId', params.clientId)
    if (params.search) httpParams = httpParams.set('search', params.search)
    if (params.view) httpParams = httpParams.set('view', params.view)
    if (params.fields) httpParams = httpParams.set('fields', params.fields)
    return this.http.get<PaginatedResponse<Event>>(`${this.apiUrl}/events`, { params: httpParams })
  }

  getEventById(id: string): Observable<ApiResponse<Event>> {
    return this.http.get<ApiResponse<Event>>(`${this.apiUrl}/events/${id}`)
  }

  /**
   * @Function - getEventHub
   * @description - Hub payload: event, optional contract summary, optional reference lists (packages, units, clients page)
   * @param - id: string - event UUID
   * @param - options: EventHubQueryOptions - includeReferenceLists, includeContract, clientsLimit
   * @returns - Observable<ApiResponse<EventHubData>>
   */
  getEventHub(id: string, options: EventHubQueryOptions = {}): Observable<ApiResponse<EventHubData>> {
    let params = new HttpParams()
    if (options.includeReferenceLists) {
      params = params.set('includeReferenceLists', 'true')
    }
    if (options.includeContract === false) {
      params = params.set('includeContract', 'false')
    }
    if (options.clientsLimit != null) {
      params = params.set('clientsLimit', String(options.clientsLimit))
    }
    return this.http.get<ApiResponse<EventHubData>>(`${this.apiUrl}/events/${id}/hub`, { params })
  }

  createEvent(eventData: CreateEventRequest): Observable<ApiResponse<Event>> {
    return this.http.post<ApiResponse<Event>>(`${this.apiUrl}/events`, eventData)
  }

  updateEvent(id: string, eventData: UpdateEventRequest): Observable<ApiResponse<Event>> {
    return this.http.put<ApiResponse<Event>>(`${this.apiUrl}/events/${id}`, eventData)
  }

  getUpcomingEvents(): Observable<ApiResponse<Event[]>> {
    return this.http.get<ApiResponse<Event[]>>(`${this.apiUrl}/events/upcoming`)
  }

  deleteEvent(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/events/${id}`)
  }
}

