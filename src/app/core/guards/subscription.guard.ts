import { inject } from '@angular/core'
import { Router, CanActivateFn } from '@angular/router'
import { map, filter, take } from 'rxjs/operators'
import { SubscriptionService } from '../services/subscription.service'

/**
 * Guard que verifica se o usuário possui uma assinatura ativa ou em trial válido
 * Redireciona para a página de pagamento necessário caso não tenha acesso
 */
export const subscriptionGuard: CanActivateFn = () => {
  const subscriptionService = inject(SubscriptionService)
  const router = inject(Router)

  return subscriptionService.getSubscription().pipe(
    // Espera até que a subscription seja carregada (não null)
    filter((subscription) => {
      return subscription !== null
    }),
    take(1), // Pega apenas o primeiro valor não-null
    map((subscription) => {
      // Verificar se tem subscription
      if (!subscription?.hasSubscription || !subscription.status) {
        console.warn('⚠️ Subscription Guard: Usuário sem assinatura')
        router.navigate(['/payment-required'])
        return false
      }

      const now = new Date()

      // Verificar se está em trial
      if (subscription.status === 'trialing') {
        if (!subscription.trial.endsAt) {
          console.warn('⚠️ Subscription Guard: Trial sem data de expiração')
          router.navigate(['/payment-required'])
          return false
        }

        const trialEndsAt = new Date(subscription.trial.endsAt)
        
        if (now > trialEndsAt) {
          console.warn('⚠️ Subscription Guard: Trial expirado', {
            trialEndsAt: subscription.trial.endsAt,
            now: now.toISOString()
          })
          router.navigate(['/payment-required'])
          return false
        }

        return true
      }

      // Verificar se subscription está ativa
      if (subscription.status === 'active') {
        // Se não tem data de expiração, considera ativa indefinidamente
        if (!subscription.subscription.endsAt) {
          return true
        }

        const subscriptionEndsAt = new Date(subscription.subscription.endsAt)
        
        if (now > subscriptionEndsAt) {
          console.warn('⚠️ Subscription Guard: Assinatura expirada', {
            subscriptionEndsAt: subscription.subscription.endsAt,
            now: now.toISOString()
          })
          router.navigate(['/payment-required'])
          return false
        }
        return true
      }

      // Status inválidos (canceled, past_due, etc)
      console.warn('⚠️ Subscription Guard: Status inválido:', subscription.status)
      router.navigate(['/payment-required'])
      return false
    })
  )
}
