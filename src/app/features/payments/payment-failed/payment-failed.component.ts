import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PaymentService } from '@/app/core/services/payment.service'
import { ToastService } from '@/app/core/services/toast.service'

@Component({
  selector: 'app-payment-failed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
      <div class="max-w-md w-full bg-white rounded-xl shadow-xl p-6 sm:p-8 text-center">
        <div class="mb-6">
          <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Pagamento Falhou</h1>
          <p class="text-sm sm:text-base text-gray-600 mb-6">
            Não foi possível confirmar seu pagamento. O trial não exige cartão — basta ter uma conta. Tente novamente ou entre em contato com o suporte.
          </p>
        </div>

        <div class="space-y-3">
          <button
            (click)="tryAgain()"
            [disabled]="checkoutLoading"
            class="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 shadow-md"
          >
            {{ checkoutLoading ? 'Redirecionando...' : 'Tentar Novamente' }}
          </button>
          <button
            (click)="contactSupport()"
            class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Contatar Suporte
          </button>
        </div>
      </div>
    </div>
  `,
})
export class PaymentFailedComponent {
  private readonly paymentService = inject(PaymentService)
  private readonly toastService = inject(ToastService)

  checkoutLoading = false

  tryAgain(): void {
    this.checkoutLoading = true
    this.paymentService.createCheckoutSession().subscribe({
      next: (response) => {
        if (response?.data?.url) {
          window.location.href = response.data.url
        } else {
          this.checkoutLoading = false
          this.toastService.error('URL de checkout não recebida. Tente novamente.')
        }
      },
      error: (err) => {
        this.checkoutLoading = false
        this.toastService.error(err?.error?.message || 'Erro ao iniciar checkout. Tente novamente.')
      }
    })
  }

  contactSupport(): void {
    const phoneNumber = '5511989327073'
    const whatsappUrl = `https://wa.me/${phoneNumber}`
    window.open(whatsappUrl, '_blank')
  }
}
