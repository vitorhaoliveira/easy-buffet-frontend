import { inject } from '@angular/core'
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router'
import { StorageService } from '../services/storage.service'
import type { UserPermissions } from '@shared/models/api.types'

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const storageService = inject(StorageService)
  const router = inject(Router)

  const module = route.data['module'] as keyof UserPermissions
  const action = route.data['action'] as string

  if (!module || !action) {
    return true // Allow if no permission requirements specified
  }

  if (!storageService.hasPermission(module, action)) {
    // Redirect to dashboard or show forbidden page
    router.navigate(['/'])
    return false
  }

  return true
}

