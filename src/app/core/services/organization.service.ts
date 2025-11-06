import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  getOrganizations(): Observable<ApiResponse<Organization[]>> {
    return this.http.get<ApiResponse<Organization[]>>(`${this.apiUrl}/organizations`)
  }

  createOrganization(organizationData: CreateOrganizationRequest): Observable<ApiResponse<Organization>> {
    return this.http.post<ApiResponse<Organization>>(
      `${this.apiUrl}/organizations`,
      organizationData
    )
  }

  getOrganizationById(id: string): Observable<ApiResponse<Organization>> {
    return this.http.get<ApiResponse<Organization>>(`${this.apiUrl}/organizations/${id}`)
  }

  updateOrganization(
    id: string,
    organizationData: UpdateOrganizationRequest
  ): Observable<ApiResponse<Organization>> {
    return this.http.put<ApiResponse<Organization>>(
      `${this.apiUrl}/organizations/${id}`,
      organizationData
    )
  }

  switchOrganization(id: string): Observable<ApiResponse<{ message: string }>> {
    return this.http.post<ApiResponse<{ message: string }>>(
      `${this.apiUrl}/organizations/${id}/switch`,
      {}
    )
  }
}

