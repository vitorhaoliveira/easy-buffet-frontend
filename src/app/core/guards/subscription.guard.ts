import { inject } from '@angular/core'
import { Router, CanActivateFn } from '@angular/router'
import { map } from 'rxjs/operators'
import { SubscriptionService } from '../services/subscription.service'

/**
 * Guard que verifica se o usuário possui uma assinatura ativa ou em trial
 * Redireciona para a página de pagamento necessário caso não tenha acesso
 */
export const subscriptionGuard: CanActivateFn = () => {
  const subscriptionService = inject(SubscriptionService)
  const router = inject(Router)

  return subscriptionService.getSubscription().pipe(
    map((subscription) => {
      const hasAccess =
        subscription?.hasSubscription &&
        (subscription.status === 'trialing' || subscription.status === 'active')

      if (!hasAccess) {
        router.navigate(['/payment-required'])
        return false
      }

      return true
    })
  )
}
