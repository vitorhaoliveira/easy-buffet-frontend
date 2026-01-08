import { inject } from '@angular/core'
import { Router, CanActivateFn } from '@angular/router'
import { map } from 'rxjs/operators'
import { SubscriptionService } from '../services/subscription.service'

/**
 * Guard que verifica se o usuário possui uma assinatura ativa ou em trial válido
 * Redireciona para a página de pagamento necessário caso não tenha acesso
 */
export const subscriptionGuard: CanActivateFn = () => {
  const subscriptionService = inject(SubscriptionService)
  const router = inject(Router)

  return subscriptionService.getSubscription().pipe(
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
        if (!subscription.trialEndsAt) {
          console.warn('⚠️ Subscription Guard: Trial sem data de expiração')
          router.navigate(['/payment-required'])
          return false
        }

        const trialEndsAt = new Date(subscription.trialEndsAt)
        
        if (now > trialEndsAt) {
          console.warn('⚠️ Subscription Guard: Trial expirado', {
            trialEndsAt: subscription.trialEndsAt,
            now: now.toISOString()
          })
          router.navigate(['/payment-required'])
          return false
        }

        console.log('✅ Subscription Guard: Trial válido até', subscription.trialEndsAt)
        return true
      }

      // Verificar se subscription está ativa
      if (subscription.status === 'active') {
        // Se não tem data de expiração, considera ativa indefinidamente
        if (!subscription.subscriptionEndsAt) {
          console.log('✅ Subscription Guard: Assinatura ativa sem expiração')
          return true
        }

        const subscriptionEndsAt = new Date(subscription.subscriptionEndsAt)
        
        if (now > subscriptionEndsAt) {
          console.warn('⚠️ Subscription Guard: Assinatura expirada', {
            subscriptionEndsAt: subscription.subscriptionEndsAt,
            now: now.toISOString()
          })
          router.navigate(['/payment-required'])
          return false
        }

        console.log('✅ Subscription Guard: Assinatura ativa até', subscription.subscriptionEndsAt)
        return true
      }

      // Status inválidos (canceled, past_due, etc)
      console.warn('⚠️ Subscription Guard: Status inválido:', subscription.status)
      router.navigate(['/payment-required'])
      return false
    })
  )
}
