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
    this.paymentService.openPortal().subscribe({
      next: (response) => {
        window.location.href = response.data.url
      },
      error: (error) => {
        console.error('Erro ao abrir portal:', error)
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
}
