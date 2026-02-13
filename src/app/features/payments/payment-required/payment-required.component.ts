import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { AuthStateService } from '@/app/core/services/auth-state.service'
import { SubscriptionService } from '@/app/core/services/subscription.service'

@Component({
  selector: 'app-payment-required',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
      <div class="max-w-md w-full bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <div class="mb-6">
          <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {{ pageTitle }}
          </h1>
          <p class="text-sm sm:text-base text-gray-600 mb-4">
            {{ pageDescription }}
          </p>
          
          <!-- Status da assinatura -->
          <div *ngIf="subscriptionStatus" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p class="text-sm text-yellow-800">
              <strong>Status:</strong> {{ getStatusText() }}
            </p>
            <p *ngIf="expirationDate" class="text-xs text-yellow-700 mt-1">
              {{ getExpirationText() }}
            </p>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-700 mb-2 font-semibold">
            {{ ctaMessage }}
          </p>
          <ul class="text-xs text-gray-600 space-y-1 text-left">
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Acesso completo a todos os recursos
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Gestão completa de eventos e finanças
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Suporte prioritário
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Cancele a qualquer momento
            </li>
          </ul>
        </div>

        <div class="space-y-3">
          <button
            (click)="goToPlans()"
            class="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-md"
          >
            {{ buttonText }}
          </button>
          <button
            (click)="logout()"
            class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  `,
})
export class PaymentRequiredComponent implements OnInit {
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly authStateService = inject(AuthStateService)
  private readonly subscriptionService = inject(SubscriptionService)

  subscriptionStatus: string | null = null
  expirationDate: string | null = null
  pageTitle = 'Assinatura Necessária'
  pageDescription = 'Você precisa de uma assinatura ativa para acessar este recurso.'
  ctaMessage = 'Experimente gratuitamente por 7 dias!'
  buttonText = 'Começar Trial Gratuito'

  ngOnInit(): void {
    // Forçar atualização dos dados do usuário antes de verificar
    this.refreshUserData()
  }

  private async refreshUserData(): Promise<void> {
    try {
      // Atualizar dados do usuário do backend
      await this.authStateService.refreshUser()
      // Depois verificar o status
      this.checkSubscriptionStatus()
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error)
      // Mesmo com erro, tenta mostrar os dados que tem
      this.checkSubscriptionStatus()
    }
  }

  private checkSubscriptionStatus(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawUser = this.authStateService.user as any
    const userData = rawUser?.data || rawUser
    const subscription = userData?.subscription

    if (subscription) {
      this.subscriptionStatus = subscription.status
      
      if (subscription.status === 'trialing') {
        this.expirationDate = subscription.trialEndsAt
        this.pageTitle = 'Trial Expirado'
        this.pageDescription = 'Seu período de teste gratuito terminou.'
        this.ctaMessage = 'Continue aproveitando todos os recursos:'
        this.buttonText = 'Assinar Agora'
      } else if (subscription.status === 'canceled') {
        this.pageTitle = 'Assinatura Cancelada'
        this.pageDescription = 'Sua assinatura foi cancelada.'
        this.ctaMessage = 'Reative sua assinatura:'
        this.buttonText = 'Reativar Assinatura'
      } else if (subscription.status === 'past_due') {
        this.pageTitle = 'Pagamento Pendente'
        this.pageDescription = 'Há um problema com seu pagamento.'
        this.ctaMessage = 'Atualize seu método de pagamento:'
        this.buttonText = 'Atualizar Pagamento'
      }
    }
  }

  getStatusText(): string {
    switch (this.subscriptionStatus) {
      case 'trialing':
        return 'Trial Expirado'
      case 'active':
        return 'Assinatura Expirada'
      case 'canceled':
        return 'Assinatura Cancelada'
      case 'past_due':
        return 'Pagamento Pendente'
      default:
        return 'Sem Assinatura'
    }
  }

  getExpirationText(): string {
    if (!this.expirationDate) return ''
    
    const expDate = new Date(this.expirationDate)
    const now = new Date()
    const diffTime = expDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return `Expirou há ${Math.abs(diffDays)} dia(s)`
    } else {
      return `Expira em ${diffDays} dia(s)`
    }
  }

  goToPlans(): void {
    this.router.navigate(['/checkout'])
  }

  logout(): void {
    this.authStateService.logout()
  }
}
