import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { catchError, switchMap, throwError } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { StorageService } from '../services/storage.service'
import { ToastService } from '../services/toast.service'
import { AuthStateService } from '../services/auth-state.service'
import { environment } from '@environments/environment'

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService)
  const http = inject(HttpClient)
  const router = inject(Router)
  const toastService = inject(ToastService)
  const authStateService = inject(AuthStateService)
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if error is 401
      if (error.status === 401) {
        const errorCode = error.error?.error?.code
        const errorMessage = error.error?.error?.message || error.error?.message || ''
        
        // Check if it's a session expired error (INVALID_TOKEN)
        const isSessionExpired = 
          errorCode === 'INVALID_TOKEN' || 
          errorMessage.includes('Sessão expirada') ||
          errorMessage.includes('sessão expirada')
        
        if (isSessionExpired) {
          // Session expired - clear tokens and redirect to login
          authStateService.clearAuthState()
          
          // Show toast message only if not already on login page
          const currentUrl = router.url
          if (!currentUrl.includes('/entrar') && !currentUrl.includes('/cadastrar')) {
            toastService.error('Sessão expirada. Por favor, faça login novamente.')
            router.navigate(['/entrar'])
          }
          
          // Return error without retrying
          return throwError(() => error)
        }
        
        // If error is 401 but not session expired, try to refresh token
        // Skip refresh for auth endpoints (login, register, refresh-token) to avoid loops
        const isAuthEndpoint = req.url.includes('/auth/login') || 
                              req.url.includes('/auth/register') ||
                              req.url.includes('/auth/refresh-token')
        
        if (!isAuthEndpoint && !(req as any)._retry) {
          const refreshToken = storageService.getRefreshToken()
          
          if (refreshToken) {
            // Mark request as retried
            const clonedReq = req.clone()
            ;(clonedReq as any)._retry = true
            
            // Try to refresh the token
            return http.post<any>(`${environment.apiBaseUrl}/auth/refresh-token`, {
              refreshToken
            }).pipe(
              switchMap((response) => {
                const { accessToken, refreshToken: newRefreshToken } = response.data
                
                // Update tokens
                storageService.setTokens({ 
                  accessToken, 
                  refreshToken: newRefreshToken 
                })
                
                // Retry the original request with new token
                const retryReq = clonedReq.clone({
                  setHeaders: {
                    Authorization: `Bearer ${accessToken}`
                  }
                })
                
                return next(retryReq)
              }),
              catchError((refreshError) => {
                // Refresh failed - only clear and redirect if not already on login page
                const currentUrl = router.url
                if (!currentUrl.includes('/entrar') && !currentUrl.includes('/cadastrar')) {
                  authStateService.clearAuthState()
                  router.navigate(['/entrar'])
                }
                
                return throwError(() => refreshError)
              })
            )
          } else {
            // No refresh token - only clear and redirect if not already on login page
            const currentUrl = router.url
            if (!currentUrl.includes('/entrar') && !currentUrl.includes('/cadastrar')) {
              authStateService.clearAuthState()
              router.navigate(['/entrar'])
            }
          }
        }
      }
      
      return throwError(() => error)
    })
  )
}

