import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  DashboardStats,
  MonthlyEvolution,
  DashboardEvent,
  DashboardInstallment,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  getStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/dashboard/stats`)
  }

  getUpcomingInstallments(limit: number = 10): Observable<ApiResponse<DashboardInstallment[]>> {
    return this.http.get<ApiResponse<DashboardInstallment[]>>(
      `${this.apiUrl}/dashboard/upcoming-installments?limit=${limit}`
    )
  }

  getUpcomingEvents(limit: number = 10): Observable<ApiResponse<DashboardEvent[]>> {
    return this.http.get<ApiResponse<DashboardEvent[]>>(
      `${this.apiUrl}/dashboard/upcoming-events?limit=${limit}`
    )
  }

  getMonthlyEvolution(months: number = 12): Observable<ApiResponse<MonthlyEvolution[]>> {
    return this.http.get<ApiResponse<MonthlyEvolution[]>>(
      `${this.apiUrl}/dashboard/monthly-evolution?months=${months}`
    )
  }
}

