import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SubscriptionService } from '@/app/core/services/subscription.service'
import { ToastService } from '@/app/core/services/toast.service'
import { Observable } from 'rxjs'
import { Router } from '@angular/router'
import { ConfirmationModalComponent } from '@/app/shared/components/ui/confirmation-modal/confirmation-modal.component'

interface Subscription {
  hasSubscription: boolean;
  status: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  cancelAtPeriodEnd?: boolean;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent],
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
                <div *ngIf="subscription.status === 'trialing' && subscription.trialEndsAt" 
                     class="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <p class="text-sm text-primary-800">
                    <span class="font-semibold">Período de trial:</span>
                    Termina em {{ subscription.trialEndsAt | date: 'dd/MM/yyyy HH:mm' }}
                  </p>
                </div>

                <!-- Active Subscription Info -->
                <div *ngIf="subscription.status === 'active' && subscription.subscriptionEndsAt" 
                     class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p class="text-sm text-green-800">
                    <span class="font-semibold">Próxima renovação:</span>
                    {{ subscription.subscriptionEndsAt | date: 'dd/MM/yyyy' }}
                  </p>
                </div>

                <!-- Cancellation Notice -->
                <div *ngIf="subscription.cancelAtPeriodEnd" 
                     class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p class="text-sm text-yellow-800">
                    <span class="font-semibold">Cancelamento agendado:</span>
                    Sua assinatura será cancelada no final do período atual.
                  </p>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    (click)="openPortal()"
                    class="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-md">
                  >
                    Gerenciar Assinatura
                  </button>
                  <button
                    *ngIf="!subscription.cancelAtPeriodEnd"
                    (click)="cancelSubscription()"
                    class="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-md">
                  >
                    Cancelar Assinatura
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
                >
                  Começar Trial Gratuito
                </button>
              </div>
            </ng-container>
          </ng-container>
        </ng-container>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <app-confirmation-modal
      [isOpen]="showCancelModal"
      [title]="'Cancelar Assinatura'"
      [message]="'Tem certeza que deseja cancelar sua assinatura? Você perderá o acesso no final do período atual.'"
      [confirmText]="'Sim, Cancelar'"
      [cancelText]="'Não, Manter'"
      [variant]="'danger'"
      [loading]="isCancelling"
      (onClose)="showCancelModal = false"
      (onConfirm)="confirmCancelSubscription()"
    ></app-confirmation-modal>
  `,
})
export class BillingComponent {
  private readonly subscriptionService = inject(SubscriptionService)
  private readonly toastService = inject(ToastService)
  private readonly router = inject(Router)

  subscription$: Observable<Subscription | null>
  loading$: Observable<boolean>
  showCancelModal = false
  isCancelling = false

  constructor() {
    this.subscription$ = this.subscriptionService.getSubscription()
    this.loading$ = this.subscriptionService.isLoading()
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'active': 'Ativa',
      'trialing': 'Em Trial',
      'past_due': 'Pagamento Atrasado',
      'canceled': 'Cancelada',
      'incomplete': 'Incompleta',
      'incomplete_expired': 'Expirada',
      'unpaid': 'Não Paga'
    }
    return labels[status] || status
  }

  openPortal(): void {
    this.subscriptionService.openPortal()
  }

  cancelSubscription(): void {
    this.showCancelModal = true
  }

  confirmCancelSubscription(): void {
    this.isCancelling = true
    
    this.subscriptionService.cancel().subscribe({
      next: () => {
        this.isCancelling = false
        this.showCancelModal = false
        this.toastService.success('Assinatura cancelada com sucesso')
      },
      error: (error) => {
        console.error('Erro ao cancelar:', error)
        this.isCancelling = false
        this.toastService.error('Erro ao cancelar assinatura. Tente novamente.')
      }
    })
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout'])
  }
}
