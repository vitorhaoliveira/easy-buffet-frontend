import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, catchError, map } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  User,
  AuthTokens,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  /**
   * Login user with email and password
   */
  login(email: string, password: string): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.apiUrl}/auth/login`,
      { email, password }
    ).pipe(
      catchError(this.handleError)
    )
  }

  /**
   * Register new user with auto-generated organization name
   */
  register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Observable<ApiResponse<RegisterResponse>> {
    // Auto-generate organization name from user name
    const organizationName = `${name}'s Organization`
    
    return this.http.post<ApiResponse<RegisterResponse>>(
      `${this.apiUrl}/auth/register`,
      {
        name,
        email,
        password,
        confirmPassword,
        organizationName,
      }
    ).pipe(
      catchError(this.handleError)
    )
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken(refreshToken: string): Observable<ApiResponse<AuthTokens>> {
    return this.http.post<ApiResponse<AuthTokens>>(
      `${this.apiUrl}/auth/refresh-token`,
      { refreshToken }
    ).pipe(
      catchError(this.handleError)
    )
  }

  /**
   * Logout user and invalidate tokens
   */
  logout(refreshToken?: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${this.apiUrl}/auth/logout`,
      refreshToken ? { refreshToken } : undefined
    ).pipe(
      catchError(this.handleError)
    )
  }

  /**
   * Get current user data
   */
  getMe(): Observable<ApiResponse<{ user: User }>> {
    return this.http.get<ApiResponse<{ user: User }>>(
      `${this.apiUrl}/auth/me`
    ).pipe(
      catchError(this.handleError)
    )
  }

  private handleError(error: any): Observable<never> {
    console.error('Auth service error:', error)
    throw error
  }
}

