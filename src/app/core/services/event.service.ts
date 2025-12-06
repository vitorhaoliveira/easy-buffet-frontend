import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Event,
  CreateEventRequest,
  UpdateEventRequest,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  /**
   * @Function - getEvents
   * @description - Retrieves a list of events, optionally filtered by unit
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

