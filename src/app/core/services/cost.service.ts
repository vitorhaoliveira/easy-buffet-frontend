import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Cost,
  CreateCostRequest,
  UpdateCostRequest,
  PaginatedResponse,
} from '@shared/models/api.types'

export interface GetCostsParams {
  page?: number
  limit?: number
  category?: string
  eventId?: string
}

@Injectable({
  providedIn: 'root'
})
export class CostService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  getCosts(): Observable<ApiResponse<Cost[]>> {
    return this.http.get<ApiResponse<Cost[]>>(`${this.apiUrl}/costs`)
  }

  /**
   * @Function - getCostsPaginated
   * @description - Retrieves a paginated list of costs with optional category and eventId filter
   * @author - Vitor Hugo
   * @param - params: GetCostsParams - page, limit, category, eventId
   * @returns - Observable<PaginatedResponse<Cost>>
   */
  getCostsPaginated(params: GetCostsParams = {}): Observable<PaginatedResponse<Cost>> {
    let httpParams = new HttpParams()
    if (params.page != null) httpParams = httpParams.set('page', String(params.page))
    if (params.limit != null) httpParams = httpParams.set('limit', String(params.limit))
    if (params.category && params.category !== 'todos') {
      httpParams = httpParams.set('category', params.category)
    }
    if (params.eventId) {
      httpParams = httpParams.set('eventId', params.eventId)
    }
    return this.http.get<PaginatedResponse<Cost>>(`${this.apiUrl}/costs`, { params: httpParams })
  }

  /**
   * @Function - getCostsByEvent
   * @description - Retrieves all costs for a given event. Uses API with eventId if supported; otherwise fetches all costs and filters client-side (fallback).
   * @author - Vitor Hugo
   * @param - eventId: string - The event ID
   * @returns - Observable<ApiResponse<Cost[]>>
   */
  getCostsByEvent(eventId: string): Observable<ApiResponse<Cost[]>> {
    return this.getCosts().pipe(
      map((response) => {
        if (!response.success || !response.data) {
          return { ...response, data: [] as Cost[] }
        }
        const filtered = (response.data as Cost[]).filter((c) => c.eventId === eventId)
        return { ...response, data: filtered }
      })
    )
  }

  getCostById(id: string): Observable<ApiResponse<Cost>> {
    return this.http.get<ApiResponse<Cost>>(`${this.apiUrl}/costs/${id}`)
  }

  createCost(costData: CreateCostRequest): Observable<ApiResponse<Cost>> {
    return this.http.post<ApiResponse<Cost>>(`${this.apiUrl}/costs`, costData)
  }

  updateCost(id: string, costData: UpdateCostRequest): Observable<ApiResponse<Cost>> {
    return this.http.put<ApiResponse<Cost>>(`${this.apiUrl}/costs/${id}`, costData)
  }

  deleteCost(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/costs/${id}`)
  }
}

