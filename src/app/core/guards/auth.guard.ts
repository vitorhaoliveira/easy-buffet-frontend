import { inject } from '@angular/core'
import { Router, CanActivateFn } from '@angular/router'
import { map, filter, take } from 'rxjs/operators'
import { AuthStateService } from '../services/auth-state.service'

export const authGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthStateService)
  const router = inject(Router)

  console.log('🛡️ Auth guard activated for:', state.url)

  // Wait until loading is complete before checking authentication
  return authState.isLoading$.pipe(
    filter(isLoading => {
      console.log('🔄 Auth guard - isLoading:', isLoading)
      return !isLoading
    }),
    take(1),
    map(() => {
      const hasToken = !!authState.token
      console.log('🔑 Auth guard - hasToken:', hasToken)
      
      if (!hasToken) {
        console.log('❌ No token found, redirecting to signin')
        router.navigate(['/entrar'])
        return false
      }
      
      console.log('✅ Auth guard - access granted')
      return true
    })
  )
}

