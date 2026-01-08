import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'

@Component({
  selector: 'app-payment-required',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-6">
      <div class="max-w-md w-full bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <div class="mb-6">
          <div class="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Assinatura Necessária</h1>
          <p class="text-sm sm:text-base text-gray-600 mb-6">
            Você precisa de uma assinatura ativa para acessar este recurso.
          </p>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-700 mb-2">
            Experimente gratuitamente por 7 dias!
          </p>
          <ul class="text-xs text-gray-600 space-y-1 text-left">
            <li>✓ Acesso completo a todos os recursos</li>
            <li>✓ Sem compromisso</li>
            <li>✓ Cancele a qualquer momento</li>
          </ul>
        </div>

        <div class="space-y-3">
          <button
            (click)="goToCheckout()"
            class="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-md"
          >
            Começar Trial Gratuito
          </button>
          <button
            (click)="goBack()"
            class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  `,
})
export class PaymentRequiredComponent {
  private readonly router = inject(Router)

  goToCheckout(): void {
    this.router.navigate(['/checkout'])
  }

  goBack(): void {
    this.router.navigate(['/'])
  }
}
