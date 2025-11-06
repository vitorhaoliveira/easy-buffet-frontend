import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Cost,
  CreateCostRequest,
  UpdateCostRequest,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class CostService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  getCosts(): Observable<ApiResponse<Cost[]>> {
    return this.http.get<ApiResponse<Cost[]>>(`${this.apiUrl}/costs`)
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

