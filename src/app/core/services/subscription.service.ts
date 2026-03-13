import { Injectable, inject, NgZone } from '@angular/core'
import { HttpErrorResponse } from '@angular/common/http'
import { BehaviorSubject, Observable, map, combineLatest, of } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { PaymentService } from './payment.service'
import { AuthStateService } from './auth-state.service'
import { ToastService } from './toast.service'
import { environment } from '@environments/environment'
import type { SubscriptionResponse } from '@shared/models/subscription.model'

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly paymentService = inject(PaymentService)
  private readonly authStateService = inject(AuthStateService)
  private readonly toastService = inject(ToastService)
  private readonly ngZone = inject(NgZone)
  
  private readonly subscription$ = new BehaviorSubject<SubscriptionResponse | null>(null)
  private readonly loading$ = new BehaviorSubject<boolean>(true)

  constructor() {
    this.loadSubscriptionFromUser()
  }

  /**
   * Carrega os dados da assinatura do usuário autenticado
   */
  private loadSubscriptionFromUser(): void {
    this.authStateService.user$.subscribe(() => {
      this.loadSubscriptionFromBackend().subscribe()
    })
  }

  /**
   * Normalizes API subscription payload to SubscriptionResponse (supports flat trialEndsAt or nested trial.endsAt)
   */
  private normalizeSubscriptionResponse(data: Record<string, unknown> | null): SubscriptionResponse | null {
    if (!data || typeof data !== 'object') return null
    const status = data['status'] as SubscriptionResponse['status']
    const hasSubscription = Boolean(data['hasSubscription'])
    const trialObj = data['trial'] as Record<string, unknown> | undefined
    const subObj = data['subscription'] as Record<string, unknown> | undefined
    const trialEndsAt = (data['trialEndsAt'] as string | undefined) ?? (trialObj?.['endsAt'] as string | undefined)
    const subscriptionEndsAt = (data['subscriptionEndsAt'] as string | undefined) ?? (subObj?.['endsAt'] as string | undefined)
    const trial: SubscriptionResponse['trial'] = {
      isActive: status === 'trialing',
      endsAt: (trialEndsAt ?? (trialObj?.['endsAt'] as string)) ?? null
    }
    const subscription: SubscriptionResponse['subscription'] = {
      endsAt: (subscriptionEndsAt ?? (subObj?.['endsAt'] as string)) ?? null,
      canceledAt: (subObj?.['canceledAt'] as string) ?? null,
      willRenew: (subObj?.['willRenew'] as boolean) ?? null
    }
    return {
      hasSubscription,
      status: status ?? null,
      plan: (data['plan'] as SubscriptionResponse['plan']) ?? null,
      trial,
      subscription,
      cancellation: (data['cancellation'] as SubscriptionResponse['cancellation']) ?? null
    }
  }

  /**
   * Carrega os dados da assinatura do backend (GET subscription - dispara sincronização no backend)
   * @returns Observable que emite os dados normalizados quando a chamada terminar
   */
  private loadSubscriptionFromBackend(): Observable<SubscriptionResponse | null> {
    this.loading$.next(true)
    return this.paymentService.getSubscription().pipe(
      map((response) => this.normalizeSubscriptionResponse(response.data as unknown as Record<string, unknown>)),
      tap((normalized) => {
        this.subscription$.next(normalized)
        this.loading$.next(false)
      }),
      catchError((error) => {
        console.error('Erro ao carregar assinatura:', error)
        this.subscription$.next(null)
        this.loading$.next(false)
        return of(null)
      })
    )
  }

  /**
   * Retorna os dados da assinatura
   */
  getSubscription(): Observable<SubscriptionResponse | null> {
    return this.subscription$.asObservable()
  }

  /**
   * Retorna o estado de carregamento
   */
  isLoading(): Observable<boolean> {
    return this.loading$.asObservable()
  }

  /**
   * Verifica se a assinatura está ativa
   */
  isActive(): Observable<boolean> {
    return this.subscription$.pipe(
      map((sub) => {
        if (!sub) return false
        const now = new Date()
        
        if (sub.status === 'trialing' && sub.trial.endsAt) {
          return new Date(sub.trial.endsAt) > now
        }

        if (sub.status === 'active' && sub.subscription.endsAt) {
          return new Date(sub.subscription.endsAt) > now
        }

        return false
      })
    )
  }

  /**
   * Verifica se a assinatura está em período de trial
   */
  isTrialing(): Observable<boolean> {
    return this.subscription$.pipe(
      map((sub) => {
        if (!sub) return false
        return sub.status === 'trialing' && sub.trial.isActive
      })
    )
  }

  /**
   * Verifica se o usuário tem acesso à plataforma
   */
  hasAccess(): Observable<boolean> {
    return this.subscription$.pipe(
      map((sub) => {
        if (!sub?.hasSubscription) return false
        return sub.status === 'active' || sub.status === 'trialing'
      })
    )
  }

  /**
   * @Function - openPortal
   * @description - Opens the Stripe customer portal for subscription management
   * @author - Vitor Hugo
   * @returns - void
   */
  openPortal(): void {
    console.log('🌐 SubscriptionService: Chamando openPortal...')
    this.paymentService.openPortal().subscribe({
      next: (response) => {
        if (response.success && response.data?.url) {
          console.log('✅ Portal URL recebida:', response.data.url)
          // Redireciona para o portal na mesma aba
          window.location.href = response.data.url
        } else {
          console.error('❌ Resposta inválida do portal:', response)
          this.toastService.error('Erro ao abrir portal de pagamento. Por favor, tente novamente.')
        }
      },
      error: (error: HttpErrorResponse | any) => {
        console.error('❌ Erro ao abrir portal - Tipo:', typeof error)
        console.error('❌ Erro ao abrir portal - Objeto completo:', error)
        console.error('❌ Erro ao abrir portal - error.error:', error?.error)
        console.error('❌ Erro ao abrir portal - error.error?.error:', error?.error?.error)
        
        let errorMessage = ''
        let errorCode = null
        
        // HttpErrorResponse structure: error.error contains the response body
        const errorBody = error?.error || error
        
        // Structure 1: {success: false, error: {code: "LIFETIME_SUBSCRIPTION", message: "..."}}
        if (errorBody?.error?.code === 'LIFETIME_SUBSCRIPTION') {
          errorCode = 'LIFETIME_SUBSCRIPTION'
          errorMessage = errorBody.error.message || 
            'Organizações com plano lifetime não podem acessar o portal do Stripe. Entre em contato com o suporte para alterações.'
        }
        // Structure 2: errorBody.error.message (nested error object)
        else if (errorBody?.error?.message) {
          errorMessage = errorBody.error.message
          errorCode = errorBody.error.code
        }
        // Structure 3: errorBody.message (direct message)
        else if (errorBody?.message) {
          errorMessage = errorBody.message
          errorCode = errorBody.code
        }
        // Structure 4: error.message (HttpErrorResponse message)
        else if (error?.message) {
          errorMessage = error.message
        }
        // Structure 5: errorBody is a string
        else if (typeof errorBody === 'string') {
          errorMessage = errorBody
        }
        
        // Default message if nothing was found
        if (!errorMessage || errorMessage.trim() === '') {
          errorMessage = 'Erro ao abrir portal de pagamento. Por favor, tente novamente.'
        }
        
        // Use NgZone to ensure toast is displayed in Angular context
        this.ngZone.run(() => {
          // Show appropriate toast based on error code
          if (errorCode === 'LIFETIME_SUBSCRIPTION') {
            this.toastService.errorWithSupport(errorMessage, environment.supportUrl)
          } else {
            this.toastService.error(errorMessage)
          }
        })
      },
    })
  }

  /**
   * Cancela a assinatura
   */
  cancel(): Observable<void> {
    return new Observable((observer) => {
      this.paymentService.cancelSubscription().subscribe({
        next: () => {
          this.loadSubscriptionFromBackend()
          observer.next()
          observer.complete()
        },
        error: (error) => {
          console.error('Erro ao cancelar assinatura:', error)
          observer.error(error)
        },
      })
    })
  }

  /**
   * Recarrega os dados da assinatura (chama GET /payments/subscription e dispara sincronização no backend)
   * @returns Observable que emite os dados atualizados quando a chamada terminar
   */
  refresh(): Observable<SubscriptionResponse | null> {
    return this.loadSubscriptionFromBackend()
  }

  /**
   * Calcula quantos dias faltam até a expiração da assinatura
   */
  getDaysUntilExpiration(): Observable<number | null> {
    return this.subscription$.pipe(
      map((sub) => {
        if (!sub) return null

        const now = new Date()
        let expirationDate: Date | null = null

        if (sub.status === 'trialing' && sub.trial.endsAt) {
          expirationDate = new Date(sub.trial.endsAt)
        } else if (sub.status === 'active' && sub.subscription.endsAt) {
          expirationDate = new Date(sub.subscription.endsAt)
        }

        if (!expirationDate) return null

        const diffTime = expirationDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return diffDays > 0 ? diffDays : 0
      })
    )
  }

  /**
   * Retorna mensagem de status da assinatura
   */
  getStatusMessage(): Observable<string> {
    return combineLatest([
      this.subscription$,
      this.getDaysUntilExpiration()
    ]).pipe(
      map(([sub, daysLeft]) => {
        if (!sub || !sub.status) {
          return 'Sem assinatura'
        }

        switch (sub.status) {
          case 'trialing':
            return daysLeft !== null ? `Trial: ${daysLeft} dias restantes` : 'Trial ativo'
          case 'active':
            return 'Assinatura ativa ✅'
          case 'past_due':
            return 'Pagamento pendente ⚠️'
          case 'canceled':
            return 'Assinatura cancelada'
          case 'expired':
            return 'Assinatura expirada'
          default:
            return 'Status desconhecido'
        }
      })
    )
  }

  /**
   * Verifica se deve exibir aviso de expiração próxima
   */
  shouldShowWarning(): Observable<boolean> {
    return this.getDaysUntilExpiration().pipe(
      map((daysLeft) => daysLeft !== null && daysLeft <= 3 && daysLeft > 0)
    )
  }

  /**
   * Verifica se a subscription está expirada
   */
  isExpired(): Observable<boolean> {
    return this.subscription$.pipe(
      map((sub) => {
        if (!sub || !sub.status) return true

        const now = new Date()

        if (sub.status === 'trialing' && sub.trial.endsAt) {
          const trialEndsAt = new Date(sub.trial.endsAt)
          return now > trialEndsAt
        }

        if (sub.status === 'active' && sub.subscription.endsAt) {
          const subscriptionEndsAt = new Date(sub.subscription.endsAt)
          return now > subscriptionEndsAt
        }

        return ['canceled', 'expired', 'past_due'].includes(sub.status)
      })
    )
  }

  /**
   * Retorna a data de expiração formatada
   */
  getExpirationDate(): Observable<string | null> {
    return this.subscription$.pipe(
      map((sub) => {
        if (!sub) return null

        if (sub.status === 'trialing' && sub.trial.endsAt) {
          return new Date(sub.trial.endsAt).toLocaleDateString('pt-BR')
        }

        if (sub.status === 'active' && sub.subscription.endsAt) {
          return new Date(sub.subscription.endsAt).toLocaleDateString('pt-BR')
        }

        return null
      })
    )
  }

  /**
   * Verifica se tem acesso ativo à plataforma
   */
  hasActiveSubscription(): Observable<boolean> {
    return this.subscription$.pipe(
      map((sub) => {
        if (!sub || !sub.hasSubscription) return false

        const now = new Date()

        if (sub.status === 'trialing') {
          if (!sub.trial.endsAt) return false
          return new Date(sub.trial.endsAt) > now
        }

        if (sub.status === 'active') {
          if (!sub.subscription.endsAt) return true
          return new Date(sub.subscription.endsAt) > now
        }

        return false
      })
    )
  }

  /**
   * Retorna informações do plano formatadas
   */
  getPlanDescription(): Observable<string> {
    return this.subscription$.pipe(
      map((sub) => {
        if (!sub?.plan) return ''

        const { name, price, currency, interval } = sub.plan
        const intervalText = interval === 'month' ? 'mês' : 'ano'

        return `${name} - ${currency} ${price}/${intervalText}`
      })
    )
  }

  /**
   * Obtém motivo do cancelamento formatado
   */
  getCancellationReasonText(reason: string): string {
    const reasons: Record<string, string> = {
      'cancellation_requested': 'Cancelamento solicitado',
      'payment_failed': 'Falha no pagamento',
      'payment_disputed': 'Pagamento contestado',
    }

    return reasons[reason] || reason
  }
}
