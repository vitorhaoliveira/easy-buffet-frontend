import { Injectable, inject } from '@angular/core'
import { BehaviorSubject, Observable, map, combineLatest } from 'rxjs'
import { PaymentService } from './payment.service'
import { AuthStateService } from './auth-state.service'

interface Subscription {
  hasSubscription: boolean;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid' | 'paused';
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  cancelAtPeriodEnd?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly paymentService = inject(PaymentService)
  private readonly authStateService = inject(AuthStateService)
  
  private readonly subscription$ = new BehaviorSubject<Subscription | null>(null)
  private readonly loading$ = new BehaviorSubject<boolean>(true)

  constructor() {
    this.loadSubscriptionFromUser()
  }

  /**
   * Carrega os dados da assinatura do usuário autenticado
   */
  private loadSubscriptionFromUser(): void {
    this.authStateService.user$.subscribe(user => {
      if (user?.subscription) {
        const subscription: Subscription = {
          hasSubscription: true,
          status: user.subscription.status,
          trialEndsAt: user.subscription.trialEndsAt || undefined,
          subscriptionEndsAt: user.subscription.subscriptionEndsAt || undefined,
          cancelAtPeriodEnd: false
        }
        this.subscription$.next(subscription)
        this.loading$.next(false)
      } else {
        // Se não tiver subscription no user, tenta buscar do backend
        this.loadSubscriptionFromBackend()
      }
    })
  }

  /**
   * Carrega os dados da assinatura do backend (fallback)
   */
  private loadSubscriptionFromBackend(): void {
    this.loading$.next(true)
    this.paymentService.getSubscription().subscribe({
      next: (response) => {
        this.subscription$.next(response.data)
        this.loading$.next(false)
      },
      error: (error) => {
        console.error('Erro ao carregar assinatura:', error)
        this.subscription$.next(null)
        this.loading$.next(false)
      },
    })
  }

  /**
   * Retorna os dados da assinatura
   */
  getSubscription(): Observable<Subscription | null> {
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
      map((sub) => sub?.status === 'active')
    )
  }

  /**
   * Verifica se a assinatura está em período de trial
   */
  isTrialing(): Observable<boolean> {
    return this.subscription$.pipe(
      map((sub) => sub?.status === 'trialing')
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
   * Recarrega os dados da assinatura
   */
  reloadSubscription(): void {
    this.loadSubscriptionFromBackend()
  }

  /**
   * Abre o portal de gerenciamento de assinatura do Stripe
   */
  openPortal(): void {
    console.log('🌐 SubscriptionService: Chamando openPortal...')
    this.paymentService.openPortal().subscribe({
      next: (response) => {
        console.log('✅ Portal URL recebida:', response.data.url)
        window.location.href = response.data.url
      },
      error: (error) => {
        console.error('❌ Erro ao abrir portal:', error)
        alert('Erro ao abrir portal de pagamento. Por favor, tente novamente.')
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
   * Recarrega os dados da assinatura
   */
  refresh(): void {
    this.loadSubscriptionFromBackend()
  }

  /**
   * Calcula quantos dias faltam até a expiração da assinatura
   * Retorna null se não houver data de expiração
   */
  getDaysUntilExpiration(): Observable<number | null> {
    return this.subscription$.pipe(
      map((sub) => {
        if (!sub) return null

        const now = new Date()
        let expirationDate: Date | null = null

        if (sub.status === 'trialing' && sub.trialEndsAt) {
          expirationDate = new Date(sub.trialEndsAt)
        } else if (sub.status === 'active' && sub.subscriptionEndsAt) {
          expirationDate = new Date(sub.subscriptionEndsAt)
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
          case 'incomplete':
          case 'incomplete_expired':
            return 'Assinatura incompleta'
          case 'unpaid':
            return 'Pagamento não realizado'
          case 'paused':
            return 'Assinatura pausada'
          default:
            return 'Status desconhecido'
        }
      })
    )
  }

  /**
   * Verifica se deve exibir aviso de expiração próxima
   * Retorna true se faltar 3 dias ou menos
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

        // Verificar trial expirado
        if (sub.status === 'trialing' && sub.trialEndsAt) {
          const trialEndsAt = new Date(sub.trialEndsAt)
          return now > trialEndsAt
        }

        // Verificar subscription expirada
        if (sub.status === 'active' && sub.subscriptionEndsAt) {
          const subscriptionEndsAt = new Date(sub.subscriptionEndsAt)
          return now > subscriptionEndsAt
        }

        // Status que indicam expiração
        return ['canceled', 'past_due', 'incomplete_expired', 'unpaid'].includes(sub.status)
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

        if (sub.status === 'trialing' && sub.trialEndsAt) {
          return new Date(sub.trialEndsAt).toLocaleDateString('pt-BR')
        }

        if (sub.status === 'active' && sub.subscriptionEndsAt) {
          return new Date(sub.subscriptionEndsAt).toLocaleDateString('pt-BR')
        }

        return null
      })
    )
  }
}
