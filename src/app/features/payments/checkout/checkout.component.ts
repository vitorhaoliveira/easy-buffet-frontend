import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { PaymentService } from '@/app/core/services/payment.service'
import { AuthStateService } from '@/app/core/services/auth-state.service'

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div class="max-w-md w-full bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <!-- Botão Voltar -->
        <button
          (click)="goBack()"
          class="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Voltar
        </button>

        <div class="text-center mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Começar Trial Gratuito</h1>
          <p class="text-sm sm:text-base text-gray-600">
            Experimente nossa plataforma por 7 dias gratuitamente
          </p>
        </div>

        <div class="space-y-4 mb-8">
          <div class="flex items-start">
            <svg class="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p class="text-gray-700">7 dias de teste grátis</p>
          </div>
          <div class="flex items-start">
            <svg class="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p class="text-gray-700">Acesso completo a todos os recursos</p>
          </div>
          <div class="flex items-start">
            <svg class="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p class="text-gray-700">Cancele a qualquer momento</p>
          </div>
          <div class="flex items-start">
            <svg class="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p class="text-gray-700">Sem compromisso</p>
          </div>
        </div>

        <button
          (click)="handleCheckout()"
          [disabled]="loading"
          class="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-md"
        >
          {{ loading ? 'Redirecionando...' : 'Começar Trial Gratuito' }}
        </button>

        <p class="text-xs text-gray-500 text-center mt-4">
          Você não será cobrado durante o período de trial
        </p>
      </div>
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  private readonly paymentService = inject(PaymentService)
  private readonly authStateService = inject(AuthStateService)
  private readonly router = inject(Router)

  loading = false

  ngOnInit(): void {
    // Verifica se o usuário já possui uma assinatura ativa
    const user = this.authStateService.user
    
    if (user?.subscription) {
      const validStatuses = ['active', 'trialing']
      if (validStatuses.includes(user.subscription.status)) {
        this.router.navigate(['/dashboard'])
        return
      }
    }
  }

  handleCheckout(): void {
    this.loading = true
    
    this.paymentService.createCheckoutSession().subscribe({
      next: (response) => {
        if (!response || !response.data || !response.data.url) {
          console.error('URL de checkout não encontrada na resposta:', response)
          alert('Erro: URL de checkout não recebida do servidor.')
          this.loading = false
          return
        }
        
        window.location.href = response.data.url
      },
      error: (err) => {
        console.error('Erro ao criar checkout:', err)
        console.error('Detalhes do erro:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error
        })
        this.loading = false
        
        let errorMessage = 'Erro ao iniciar checkout. Por favor, tente novamente.'
        
        if (err.status === 401) {
          errorMessage = 'Você precisa estar autenticado para iniciar o checkout.'
        } else if (err.status === 0) {
          errorMessage = 'Erro de conexão. Verifique se o backend está rodando.'
        } else if (err.error?.message) {
          errorMessage = `Erro: ${err.error.message}`
        }
        
        alert(errorMessage)
      },
    })
  }

  goBack(): void {
    this.router.navigate(['/entrar'])
  }
}
