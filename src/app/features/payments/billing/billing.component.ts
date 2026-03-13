import { Component, inject, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SubscriptionService } from '@/app/core/services/subscription.service'
import { PaymentService } from '@/app/core/services/payment.service'
import { ToastService } from '@/app/core/services/toast.service'
import { Observable } from 'rxjs'
import type { SubscriptionResponse } from '@/app/shared/models/subscription.model'

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto p-4 sm:p-6">
      <div class="bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Gerenciar Assinatura</h2>

        <!-- Loading State -->
        <div *ngIf="loading$ | async" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>

        <!-- Subscription Info -->
        <ng-container *ngIf="(loading$ | async) === false">
          <ng-container *ngIf="subscription$ | async as subscription">
            <!-- Has Subscription -->
            <ng-container *ngIf="subscription.hasSubscription">
              <div class="space-y-6">
                <!-- Plan Info -->
                <div *ngIf="subscription.plan" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p class="text-sm text-blue-800">
                    <span class="font-semibold">Plano:</span>
                    {{ subscription.plan.name }}
                  </p>
                  <p class="text-sm text-blue-800 mt-1">
                    <span class="font-semibold">Preço:</span>
                    {{ subscription.plan.currency }} {{ subscription.plan.price }}/{{ subscription.plan.interval === 'month' ? 'mês' : 'ano' }}
                  </p>
                </div>

                <!-- Status Badge -->
                <div class="flex items-center space-x-3">
                  <span class="text-lg font-semibold text-gray-700">Status:</span>
                  <span
                    class="px-4 py-2 rounded-full text-sm font-semibold"
                    [ngClass]="{
                      'bg-green-100 text-green-800': subscription.status === 'active',
                      'bg-primary-100 text-primary-800': subscription.status === 'trialing',
                      'bg-yellow-100 text-yellow-800': subscription.status === 'past_due',
                      'bg-red-100 text-red-800': subscription.status === 'canceled'
                    }"
                  >
                    {{ getStatusLabel(subscription.status) }}
                  </span>
                </div>

                <!-- Trial Info -->
                <div *ngIf="subscription.status === 'trialing' && subscription.trial.endsAt" 
                     class="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <p class="text-sm text-primary-800">
                    <span class="font-semibold">Período de trial:</span>
                    Termina em {{ subscription.trial.endsAt | date: 'dd/MM/yyyy HH:mm' }}
                  </p>
                </div>

                <!-- Active Subscription Info -->
                <div *ngIf="subscription.status === 'active' && subscription.subscription.endsAt" 
                     class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p class="text-sm text-green-800">
                    <span class="font-semibold">Próxima renovação:</span>
                    {{ subscription.subscription.endsAt | date: 'dd/MM/yyyy' }}
                  </p>
                  <p *ngIf="subscription.subscription.willRenew !== null" class="text-sm text-green-800 mt-2">
                    <span class="font-semibold">Renovação automática:</span>
                    {{ subscription.subscription.willRenew ? '✅ Ativa' : '❌ Desativada' }}
                  </p>
                </div>

                <!-- Cancellation Notice -->
                <div *ngIf="subscription.status === 'canceled'" 
                     class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p class="text-sm text-red-800 font-semibold mb-2">⚠️ Assinatura Cancelada</p>
                  <p *ngIf="subscription.subscription.canceledAt" class="text-sm text-red-800">
                    <span class="font-semibold">Cancelada em:</span>
                    {{ subscription.subscription.canceledAt | date: 'dd/MM/yyyy' }}
                  </p>
                  <p *ngIf="subscription.cancellation && subscription.cancellation.reason" class="text-sm text-red-800 mt-1">
                    <span class="font-semibold">Motivo:</span>
                    {{ getCancellationReasonText(subscription.cancellation.reason) }}
                  </p>
                  <p *ngIf="subscription.subscription.endsAt" class="text-sm text-red-800 mt-1">
                    <span class="font-semibold">Acesso até:</span>
                    {{ subscription.subscription.endsAt | date: 'dd/MM/yyyy' }}
                  </p>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    (click)="openPortal()"
                    class="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-md">
                    {{ subscription.status === 'trialing' ? 'Adicionar cartão e gerenciar assinatura' : 'Gerenciar Assinatura' }}
                  </button>
                  <button
                    *ngIf="subscription.status === 'trialing'"
                    (click)="goToStripeCheckout()"
                    [disabled]="checkoutLoading"
                    class="flex-1 bg-white border-2 border-primary-500 text-primary-600 hover:bg-primary-50 font-semibold py-3 px-6 rounded-lg transition-all shadow-md">
                    {{ checkoutLoading ? 'Redirecionando...' : 'Assinar via checkout' }}
                  </button>
                </div>

                <p class="text-xs text-gray-500 text-center mt-4" *ngIf="subscription.status === 'trialing'">
                  Use o portal para cadastrar cartão (cobrança ao fim do trial) ou «Assinar via checkout» para concluir o pagamento no Stripe.
                </p>
                <p class="text-xs text-gray-500 text-center mt-4" *ngIf="subscription.status !== 'trialing'">
                  Você pode atualizar seu método de pagamento ou cancelar sua assinatura através do portal de gerenciamento.
                </p>
              </div>
            </ng-container>

            <!-- Trialing (no card yet) - trial is active -->
            <ng-container *ngIf="!subscription.hasSubscription && isTrialingWithAccess(subscription)">
              <div class="text-center py-8">
                <div class="mb-6">
                  <div class="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">
                    Você está no período de trial
                  </h3>
                  <p class="text-gray-600 mb-2" *ngIf="subscription.trial.endsAt">
                    Acesso trial até {{ subscription.trial.endsAt | date: 'dd/MM/yyyy' }}
                  </p>
                  <p class="text-sm text-gray-500 mb-6">
                    Não é necessário cadastrar cartão para usar o trial. Quando quiser assinar, clique abaixo.
                  </p>
                </div>
                <button
                  (click)="goToStripeCheckout()"
                  [disabled]="checkoutLoading"
                  class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 shadow-md inline-block">
                  {{ checkoutLoading ? 'Redirecionando...' : 'Assinar e continuar após o trial' }}
                </button>
              </div>
            </ng-container>

            <!-- No Subscription (expired or never had) -->
            <ng-container *ngIf="!subscription.hasSubscription && !isTrialingWithAccess(subscription)">
              <div class="text-center py-8">
                <div class="mb-6">
                  <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">
                    {{ getNoSubscriptionTitle(subscription) }}
                  </h3>
                  <p class="text-gray-600 mb-6">
                    {{ getNoSubscriptionDescription(subscription) }}
                  </p>
                </div>
                <button
                  (click)="goToStripeCheckout()"
                  [disabled]="checkoutLoading"
                  class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 shadow-md inline-block">
                  {{ checkoutLoading ? 'Redirecionando...' : 'Começar Trial Gratuito' }}
                </button>
              </div>
            </ng-container>
          </ng-container>
        </ng-container>
      </div>
    </div>

  `,
})
export class BillingComponent implements OnInit, OnDestroy {
  private readonly subscriptionService = inject(SubscriptionService)
  private readonly paymentService = inject(PaymentService)
  private readonly toastService = inject(ToastService)

  subscription$!: Observable<SubscriptionResponse | null>
  loading$!: Observable<boolean>
  checkoutLoading = false

  ngOnInit(): void {
    this.subscription$ = this.subscriptionService.getSubscription()
    this.loading$ = this.subscriptionService.isLoading()
    // Chama o endpoint de assinatura ao abrir a tela para disparar sincronização e obter dados atualizados (hasSubscription, stripeSubscriptionId, etc.)
    this.subscriptionService.refresh().subscribe()
  }

  ngOnDestroy(): void {}

  /**
   * @Function - isTrialingWithAccess
   * @description - True when user is in trialing status and trial end date is in the future
   * @param subscription - Current subscription response
   * @returns - boolean
   */
  isTrialingWithAccess(subscription: SubscriptionResponse): boolean {
    if (subscription.status !== 'trialing' || !subscription.trial?.endsAt) return false
    return new Date(subscription.trial.endsAt) > new Date()
  }

  /**
   * @Function - getNoSubscriptionTitle
   * @description - Title for the no-subscription block depending on status
   * @param subscription - Current subscription response
   * @returns - string
   */
  getNoSubscriptionTitle(subscription: SubscriptionResponse): string {
    if (subscription.status === 'expired') return 'Seu período de trial acabou'
    return 'Você não possui uma assinatura ativa'
  }

  /**
   * @Function - getNoSubscriptionDescription
   * @description - Description for the no-subscription block (trial without card context)
   * @param subscription - Current subscription response
   * @returns - string
   */
  getNoSubscriptionDescription(subscription: SubscriptionResponse): string {
    if (subscription.status === 'expired') {
      return 'Assine agora e tenha acesso completo à plataforma. Não é necessário cartão para começar o trial.'
    }
    return 'Crie sua conta e ganhe 7 dias grátis. Não é necessário cartão para o trial.'
  }

  /**
   * @Function - goToStripeCheckout
   * @description - Creates Stripe checkout session and redirects to Stripe
   */
  goToStripeCheckout(): void {
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
        const message = err?.status === 401
          ? 'Você precisa estar autenticado.'
          : err?.error?.message || 'Erro ao iniciar checkout. Tente novamente.'
        this.toastService.error(message)
      }
    })
  }

  getStatusLabel(status: string | null): string {
    const labels: Record<string, string> = {
      'active': 'Ativa',
      'trialing': 'Em Trial',
      'past_due': 'Pagamento Atrasado',
      'canceled': 'Cancelada',
      'expired': 'Expirada'
    }
    return labels[status || ''] || status || 'Desconhecido'
  }

  getCancellationReasonText(reason: string | null): string {
    if (!reason) return 'Motivo desconhecido'
    const reasons: Record<string, string> = {
      'cancellation_requested': 'Cancelamento solicitado',
      'payment_failed': 'Falha no pagamento',
      'payment_disputed': 'Pagamento contestado',
    }
    return reasons[reason] || reason
  }

  openPortal(): void {
    this.subscriptionService.openPortal()
  }
}
