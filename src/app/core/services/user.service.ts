import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserPermissionsRequest,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/users`)
  }

  getUserById(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/${id}`)
  }

  createUser(userData: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/users`, userData)
  }

  updateUser(id: string, userData: UpdateUserRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/users/${id}`, userData)
  }

  updateUserPermissions(
    id: string,
    permissions: UpdateUserPermissionsRequest
  ): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(
      `${this.apiUrl}/users/${id}/permissions`,
      permissions
    )
  }

  deleteUser(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/users/${id}`)
  }
}

