import { inject } from '@angular/core'
import { Router, CanActivateFn } from '@angular/router'
import { map, filter, take } from 'rxjs/operators'
import { AuthStateService } from '../services/auth-state.service'

export const authGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService)
  const router = inject(Router)

  // Wait until loading is complete before checking authentication
  return authState.isLoading$.pipe(
    filter(isLoading => !isLoading), // Wait until NOT loading
    take(1), // Take only the first emission after loading completes
    map(() => {
      const hasToken = !!authState.token
      
      if (!hasToken) {
        console.log('No token found, redirecting to signin')
        router.navigate(['/signin'])
        return false
      }
      
      return true
    })
  )
}

