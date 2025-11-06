import { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { StorageService } from '../services/storage.service'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService)
  
  const token = storageService.getAccessToken()
  const organizationId = storageService.getCurrentOrganizationId()
  
  // Clone the request and add auth headers if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  }
  
  if (organizationId) {
    req = req.clone({
      setHeaders: {
        'x-organization-id': organizationId
      }
    })
  }
  
  return next(req)
}

