import { Component, inject, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SubscriptionService } from '@/app/core/services/subscription.service'
import { ToastService } from '@/app/core/services/toast.service'
import { Observable } from 'rxjs'
import { Router } from '@angular/router'
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
                    Gerenciar Assinatura
                  </button>
                </div>

                <p class="text-xs text-gray-500 text-center mt-4">
                  Você pode atualizar seu método de pagamento ou cancelar sua assinatura através do portal de gerenciamento.
                </p>
              </div>
            </ng-container>

            <!-- No Subscription -->
            <ng-container *ngIf="!subscription.hasSubscription">
              <div class="text-center py-8">
                <div class="mb-6">
                  <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">
                    Você não possui uma assinatura ativa
                  </h3>
                  <p class="text-gray-600 mb-6">
                    Assine agora e tenha acesso completo à plataforma
                  </p>
                </div>
                <button
                  (click)="goToCheckout()"
                  class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-md inline-block">
                  Começar Trial Gratuito
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
  private readonly toastService = inject(ToastService)
  private readonly router = inject(Router)

  subscription$!: Observable<SubscriptionResponse | null>
  loading$!: Observable<boolean>

  ngOnInit(): void {
    this.subscription$ = this.subscriptionService.getSubscription()
    this.loading$ = this.subscriptionService.isLoading()
  }

  ngOnDestroy(): void {}

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
    console.log('🔓 Opening Stripe portal...')
    this.subscriptionService.openPortal()
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout'])
  }
}
