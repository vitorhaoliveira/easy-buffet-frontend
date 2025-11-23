import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  CompanySettings,
  CompanyData,
  UpdateCompanyDataRequest,
  ActivityLog,
  ActivityLogItem,
  ActivityLogFilters,
  PaginatedResponse,
  UpdateSettingsRequest,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  /**
   * @Function - getCompanySettings
   * @description - Gets company settings (legacy method)
   * @author - Vitor Hugo
   * @returns - Observable<ApiResponse<CompanySettings>>
   */
  getCompanySettings(): Observable<ApiResponse<CompanySettings>> {
    return this.http.get<ApiResponse<CompanySettings>>(`${this.apiUrl}/settings/company`)
  }

  /**
   * @Function - getCompanyData
   * @description - Gets complete company data including address, contact, social media, and banking info
   * @author - Vitor Hugo
   * @returns - Observable<ApiResponse<CompanyData>>
   */
  getCompanyData(): Observable<ApiResponse<CompanyData>> {
    return this.http.get<ApiResponse<CompanyData>>(`${this.apiUrl}/settings/company`)
  }

  /**
   * @Function - updateCompanyData
   * @description - Updates company data with full structure
   * @author - Vitor Hugo
   * @param - companyData: UpdateCompanyDataRequest - Company data to update
   * @returns - Observable<ApiResponse<CompanyData>>
   */
  updateCompanyData(companyData: UpdateCompanyDataRequest): Observable<ApiResponse<CompanyData>> {
    return this.http.put<ApiResponse<CompanyData>>(
      `${this.apiUrl}/settings/company`,
      companyData
    )
  }

  /**
   * @Function - updateCompanySettings
   * @description - Updates company settings (legacy method)
   * @author - Vitor Hugo
   * @param - settingsData: UpdateSettingsRequest - Settings data to update
   * @returns - Observable<ApiResponse<CompanySettings>>
   */
  updateCompanySettings(settingsData: UpdateSettingsRequest): Observable<ApiResponse<CompanySettings>> {
    return this.http.put<ApiResponse<CompanySettings>>(
      `${this.apiUrl}/settings/company`,
      settingsData
    )
  }

  /**
   * @Function - getActivityLogs
   * @description - Gets activity logs with optional filters and pagination
   * @author - Vitor Hugo
   * @param - filters: ActivityLogFilters - Optional filters for logs
   * @returns - Observable<PaginatedResponse<ActivityLogItem>>
   */
  getActivityLogs(filters?: ActivityLogFilters): Observable<PaginatedResponse<ActivityLogItem>> {
    const params: any = {}
    
    if (filters) {
      if (filters.page) params.page = filters.page.toString()
      if (filters.limit) params.limit = filters.limit.toString()
      if (filters.userId) params.userId = filters.userId
      if (filters.module) params.module = filters.module
      if (filters.action) params.action = filters.action
      if (filters.dateFrom) params.dateFrom = filters.dateFrom
      if (filters.dateTo) params.dateTo = filters.dateTo
    }

    return this.http.get<PaginatedResponse<ActivityLogItem>>(
      `${this.apiUrl}/settings/activity-logs`,
      { params }
    )
  }
}

