import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  UserLimit,
  AddUsersRequest,
  AddUsersResponse,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class UserLimitService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  /**
   * @Function - getUserLimit
   * @description - Fetches the current user limit information for the organization
   * @author - Vitor Hugo
   * @returns - Observable<ApiResponse<UserLimit>> - User limit data
   */
  getUserLimit(): Observable<ApiResponse<UserLimit>> {
    return this.http.get<ApiResponse<UserLimit>>(`${this.apiUrl}/payments/user-limit`)
  }

  /**
   * @Function - addUsers
   * @description - Adds extra users to the subscription via Stripe
   * @author - Vitor Hugo
   * @param - request: AddUsersRequest - Request with quantity of users to add
   * @returns - Observable<ApiResponse<AddUsersResponse>> - Response with new limit
   */
  addUsers(request: AddUsersRequest): Observable<ApiResponse<AddUsersResponse>> {
    return this.http.post<ApiResponse<AddUsersResponse>>(
      `${this.apiUrl}/payments/add-users`,
      request
    )
  }
}

