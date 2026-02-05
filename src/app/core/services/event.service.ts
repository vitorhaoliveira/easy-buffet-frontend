import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Event,
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
   * @param - params: GetEventsParams - page, limit, unitId, status, dateFrom, dateTo, clientId
   * @returns - Observable<PaginatedResponse<Event>>
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
    return this.http.get<PaginatedResponse<Event>>(`${this.apiUrl}/events`, { params: httpParams })
  }

  getEventById(id: string): Observable<ApiResponse<Event>> {
    return this.http.get<ApiResponse<Event>>(`${this.apiUrl}/events/${id}`)
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

