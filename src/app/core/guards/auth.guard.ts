import { inject } from '@angular/core'
import { Router, CanActivateFn } from '@angular/router'
import { map, filter, take } from 'rxjs/operators'
import { AuthStateService } from '../services/auth-state.service'

/**
 * @Function - authGuard
 * @description - Guards routes that require authentication
 * @author - EasyBuffet Team
 * @returns - Observable<boolean> - True if user is authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthStateService)
  const router = inject(Router)

  // Wait until loading is complete before checking authentication
  return authState.isLoading$.pipe(
    filter(isLoading => !isLoading),
    take(1),
    map(() => {
      const hasToken = !!authState.token
      
      if (!hasToken) {
        router.navigate(['/entrar'])
        return false
      }
      
      return true
    })
  )
}

