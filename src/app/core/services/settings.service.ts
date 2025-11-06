import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  CompanySettings,
  ActivityLog,
  UpdateSettingsRequest,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  getCompanySettings(): Observable<ApiResponse<CompanySettings>> {
    return this.http.get<ApiResponse<CompanySettings>>(`${this.apiUrl}/settings/company`)
  }

  updateCompanySettings(settingsData: UpdateSettingsRequest): Observable<ApiResponse<CompanySettings>> {
    return this.http.put<ApiResponse<CompanySettings>>(
      `${this.apiUrl}/settings/company`,
      settingsData
    )
  }

  getActivityLogs(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
  }): Observable<ApiResponse<ActivityLog[]>> {
    return this.http.get<ApiResponse<ActivityLog[]>>(
      `${this.apiUrl}/settings/activity-logs`,
      { params: params as any }
    )
  }
}

