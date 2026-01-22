import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  TeamMember,
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
  PaginatedTeamMemberResponse,
} from '@shared/models/api.types'

export interface TeamMemberListParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

@Injectable({
  providedIn: 'root'
})
export class TeamMemberService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  /**
   * @Function - getTeamMembers
   * @description - Retrieves a paginated list of team members with optional search and sorting
   * @author - Vitor Hugo
   * @param - params?: TeamMemberListParams - Optional query parameters for pagination, search, and sorting
   * @returns - Observable<PaginatedTeamMemberResponse>
   */
  getTeamMembers(params?: TeamMemberListParams): Observable<PaginatedTeamMemberResponse> {
    let httpParams = new HttpParams()
    
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString())
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString())
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search)
    }
    if (params?.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy)
    }
    if (params?.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder)
    }

    return this.http.get<PaginatedTeamMemberResponse>(`${this.apiUrl}/team-members`, { params: httpParams })
  }

  /**
   * @Function - getTeamMemberById
   * @description - Retrieves a specific team member by ID
   * @author - Vitor Hugo
   * @param - id: string - The team member ID
   * @returns - Observable<ApiResponse<TeamMember>>
   */
  getTeamMemberById(id: string): Observable<ApiResponse<TeamMember>> {
    return this.http.get<ApiResponse<TeamMember>>(`${this.apiUrl}/team-members/${id}`)
  }

  /**
   * @Function - createTeamMember
   * @description - Creates a new team member
   * @author - Vitor Hugo
   * @param - data: CreateTeamMemberRequest - The team member data
   * @returns - Observable<ApiResponse<TeamMember>>
   */
  createTeamMember(data: CreateTeamMemberRequest): Observable<ApiResponse<TeamMember>> {
    return this.http.post<ApiResponse<TeamMember>>(`${this.apiUrl}/team-members`, data)
  }

  /**
   * @Function - updateTeamMember
   * @description - Updates an existing team member
   * @author - Vitor Hugo
   * @param - id: string - The team member ID
   * @param - data: UpdateTeamMemberRequest - The updated team member data
   * @returns - Observable<ApiResponse<TeamMember>>
   */
  updateTeamMember(id: string, data: UpdateTeamMemberRequest): Observable<ApiResponse<TeamMember>> {
    return this.http.put<ApiResponse<TeamMember>>(`${this.apiUrl}/team-members/${id}`, data)
  }

  /**
   * @Function - deleteTeamMember
   * @description - Deletes a team member
   * @author - Vitor Hugo
   * @param - id: string - The team member ID
   * @returns - Observable<ApiResponse<null>>
   */
  deleteTeamMember(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/team-members/${id}`)
  }
}
