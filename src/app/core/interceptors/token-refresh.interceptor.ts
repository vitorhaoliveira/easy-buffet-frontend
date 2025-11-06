import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http'
import { inject } from '@angular/core'
import { catchError, switchMap, throwError } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { StorageService } from '../services/storage.service'
import { environment } from '@environments/environment'

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService)
  const http = inject(HttpClient)
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If error is 401 and we haven't already tried to refresh
      if (error.status === 401 && !(req as any)._retry) {
        const refreshToken = storageService.getRefreshToken()
        
        if (refreshToken) {
          // Mark request as retried
          const clonedReq = req.clone();
          (clonedReq as any)._retry = true
          
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
              // Refresh failed, clear tokens
              storageService.clearAll()
              return throwError(() => refreshError)
            })
          )
        } else {
          // No refresh token, clear all data
          storageService.clearAll()
        }
      }
      
      return throwError(() => error)
    })
  )
}

