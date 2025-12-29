import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, catchError, map, of } from 'rxjs'
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
   * @Function - register
   * @description - Register new user with provided organization name
   * @author - EasyBuffet Team
   * @param - name: string - User's full name
   * @param - email: string - User's email address
   * @param - password: string - User's password
   * @param - confirmPassword: string - Password confirmation
   * @param - organizationName: string - Name of the organization/company
   * @returns - Observable<ApiResponse<RegisterResponse>> - Registration response with user data and tokens
   */
  register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    organizationName: string
  ): Observable<ApiResponse<RegisterResponse>> {
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

  /**
   * @Function - wakeUpServer
   * @description - Pings the server to wake it up from cold start
   * @author - EasyBuffet Team
   * @returns - Observable<boolean> - True if server is awake
   */
  wakeUpServer(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/health`, { responseType: 'text' }).pipe(
      map(() => true),
      catchError(() => {
        // Even if it fails, we tried to wake up the server
        return of(true)
      })
    )
  }

  /**
   * @Function - handleError
   * @description - Handles and rethrows authentication errors
   * @author - EasyBuffet Team
   * @param - error: any - The error to handle
   * @returns - Observable<never> - Throws the error
   */
  private handleError(error: any): Observable<never> {
    throw error
  }
}

