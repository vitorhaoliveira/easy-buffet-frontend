import { Injectable } from '@angular/core'
import { HttpClient, HttpResponse } from '@angular/common/http'
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

  /**
   * @Function - getMonthlyReport
   * @description - Get monthly report data from API
   * @author - Vitor Hugo
   * @param - params: { month?: string; year?: string } - Query parameters
   * @returns - Observable<ApiResponse<MonthlyReport>>
   */
  getMonthlyReport(params?: {
    month?: string;
    year?: string;
  }): Observable<ApiResponse<MonthlyReport>> {
    return this.http.get<ApiResponse<MonthlyReport>>(
      `${this.apiUrl}/reports/monthly`,
      { params: params as any }
    )
  }

  /**
   * @Function - downloadMonthlyReportPDF
   * @description - Download monthly report as PDF from backend API
   * @author - Vitor Hugo
   * @param - month: number - Month number (1-12)
   * @param - year: number - Year
   * @returns - Observable<HttpResponse<Blob>> - PDF file as blob with response headers
   */
  downloadMonthlyReportPDF(month: number, year: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/reports/monthly/pdf`, {
      params: {
        month: month.toString(),
        year: year.toString()
      },
      responseType: 'blob',
      observe: 'response'
    })
  }

  /**
   * @Function - getInstallmentsReport
   * @description - Get installments report data from API
   * @author - Vitor Hugo
   * @param - params: { month?: string; year?: string; status?: string } - Query parameters
   * @returns - Observable<ApiResponse<InstallmentsReport>>
   */
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

  /**
   * @Function - getCostsReport
   * @description - Get costs report data from API
   * @author - Vitor Hugo
   * @param - params: { month?: string; year?: string; category?: string } - Query parameters
   * @returns - Observable<ApiResponse<CostsReport>>
   */
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

