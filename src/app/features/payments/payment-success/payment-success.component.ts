import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { SubscriptionService } from '@/app/core/services/subscription.service'
import { AuthStateService } from '@/app/core/services/auth-state.service'

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
      <div class="max-w-md w-full bg-white rounded-xl shadow-xl p-6 sm:p-8 text-center">
        <div class="mb-6">
          <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Pagamento Confirmado!</h1>
          <p class="text-sm sm:text-base text-gray-600 mb-2">
            Aguarde enquanto verificamos sua assinatura...
          </p>
          <p class="text-sm text-gray-500">
            Tentativa {{ currentAttempt }} de {{ maxAttempts }}
          </p>
        </div>

        <div class="flex justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    </div>
  `,
})
export class PaymentSuccessComponent implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService)
  private readonly authStateService = inject(AuthStateService)
  private readonly router = inject(Router)

  currentAttempt = 0
  maxAttempts = 6

  ngOnInit(): void {
    // Aguarda 3 segundos iniciais para garantir que o webhook foi processado
    setTimeout(() => {
      this.verifyPaymentWithRetry()
    }, 3000)
  }

  private async verifyPaymentWithRetry(): Promise<void> {
    this.currentAttempt++
    try {
      // 1) Chama o endpoint de assinatura (GET /payments/subscription) para disparar a sincronização no backend
      this.subscriptionService.refresh().subscribe({
        next: async () => {
          // 2) Recarrega os dados do usuário (/me) para pegar subscription atualizada (stripeSubscriptionId, hasSubscription, etc.)
          const refreshed = await this.authStateService.refreshUser()

          if (refreshed) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rawUser = this.authStateService.user as any
            const userData = rawUser?.data || rawUser
            const subscription = userData?.subscription

            if (subscription?.status) {
              if (subscription.status === 'trialing' || subscription.status === 'active') {
                // Redireciona para a tela de assinatura para o usuário ver os dados atualizados (hasSubscription: true, etc.)
                this.router.navigate(['/assinatura'])
                return
              } else if (subscription.status === 'canceled' || subscription.status === 'past_due') {
                this.router.navigate(['/payment-failed'], {
                  queryParams: {
                    reason: `Assinatura com status: ${subscription.status}. Por favor, tente novamente ou contate o suporte.`
                  }
                })
                return
              }
            }
          }

          this.retryOrFail()
        },
        error: () => this.retryOrFail()
      })
    } catch (err) {
      console.error('❌ Erro ao verificar assinatura:', err)
      this.retryOrFail()
    }
  }

  private retryOrFail(): void {
    if (this.currentAttempt < this.maxAttempts) {
      setTimeout(() => this.verifyPaymentWithRetry(), 3000)
    } else {
      this.router.navigate(['/payment-failed'], {
        queryParams: {
          reason: 'Não foi possível confirmar sua assinatura. O webhook pode estar demorando para processar.',
          attempts: this.maxAttempts
        }
      })
    }
  }
}
