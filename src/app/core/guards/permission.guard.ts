import { inject } from '@angular/core'
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router'
import { StorageService } from '../services/storage.service'
import type { UserPermissions } from '@shared/models/api.types'

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const storageService = inject(StorageService)
  const router = inject(Router)

  const module = route.data['module'] as keyof UserPermissions
  const action = route.data['action'] as string

  console.log('🔐 Permission guard - module:', module, 'action:', action)

  if (!module || !action) {
    console.log('✅ Permission guard - no requirements, access granted')
    return true // Allow if no permission requirements specified
  }

  const hasPermission = storageService.hasPermission(module, action)
  console.log('🔐 Permission guard - hasPermission:', hasPermission)

  if (!hasPermission) {
    console.log('❌ Permission guard - access denied, redirecting to /')
    // Redirect to dashboard or show forbidden page
    router.navigate(['/'])
    return false
  }

  console.log('✅ Permission guard - access granted')
  return true
}

