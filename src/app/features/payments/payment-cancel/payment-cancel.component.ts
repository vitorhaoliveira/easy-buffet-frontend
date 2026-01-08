import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-6">
      <div class="max-w-md w-full bg-white rounded-xl shadow-xl p-6 sm:p-8 text-center">
        <div class="mb-6">
          <div class="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Pagamento Cancelado</h1>
          <p class="text-sm sm:text-base text-gray-600 mb-6">
            Você cancelou o processo de pagamento. Não se preocupe, nenhuma cobrança foi realizada.
          </p>
        </div>

        <div class="space-y-3">
          <button
            (click)="tryAgain()"
            class="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-md"
          >
            Tentar Novamente
          </button>
          <button
            (click)="goHome()"
            class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Voltar para Início
          </button>
        </div>
      </div>
    </div>
  `,
})
export class PaymentCancelComponent {
  private readonly router = inject(Router)

  tryAgain(): void {
    this.router.navigate(['/checkout'])
  }

  goHome(): void {
    this.router.navigate(['/'])
  }
}
