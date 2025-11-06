import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  MonthlyReport,
  InstallmentsReport,
  CostsReport,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  getMonthlyReport(params?: {
    month?: string;
    year?: string;
  }): Observable<ApiResponse<MonthlyReport>> {
    return this.http.get<ApiResponse<MonthlyReport>>(
      `${this.apiUrl}/reports/monthly`,
      { params: params as any }
    )
  }

  getInstallmentsReport(params?: {
    month?: string;
    year?: string;
    status?: string;
  }): Observable<ApiResponse<InstallmentsReport>> {
    return this.http.get<ApiResponse<InstallmentsReport>>(
      `${this.apiUrl}/reports/installments`,
      { params: params as any }
    )
  }

  getCostsReport(params?: {
    month?: string;
    year?: string;
    category?: string;
  }): Observable<ApiResponse<CostsReport>> {
    return this.http.get<ApiResponse<CostsReport>>(
      `${this.apiUrl}/reports/costs`,
      { params: params as any }
    )
  }
}

