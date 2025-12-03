import { inject } from '@angular/core'
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router'
import { StorageService } from '../services/storage.service'
import type { UserPermissions } from '@shared/models/api.types'

/**
 * @Function - permissionGuard
 * @description - Guards routes that require specific permissions
 * @author - EasyBuffet Team
 * @returns - boolean - True if user has required permission
 */
export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const storageService = inject(StorageService)
  const router = inject(Router)

  const module = route.data['module'] as keyof UserPermissions
  const action = route.data['action'] as string

  // Allow if no permission requirements specified
  if (!module || !action) {
    return true
  }

  const hasPermission = storageService.hasPermission(module, action)

  if (!hasPermission) {
    // Redirect to account settings page (no permission guard)
    router.navigate(['/conta'])
    return false
  }

  return true
}

