import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../environments/environment'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

interface CheckoutSessionData {
  sessionId: string
  url: string
}

interface PortalData {
  url: string
}

interface SubscriptionData {
  hasSubscription: boolean
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid'
  trialEndsAt?: string
  subscriptionEndsAt?: string
  cancelAtPeriodEnd?: boolean
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly http = inject(HttpClient)
  private readonly apiUrl = `${environment.apiBaseUrl}/payments`

  /**
   * Cria uma sessão de checkout do Stripe
   */
  createCheckoutSession(): Observable<ApiResponse<CheckoutSessionData>> {
    return this.http.post<ApiResponse<CheckoutSessionData>>(`${this.apiUrl}/checkout`, {})
  }

  /**
   * Obtém os detalhes da assinatura do usuário
   */
  getSubscription(): Observable<ApiResponse<SubscriptionData>> {
    return this.http.get<ApiResponse<SubscriptionData>>(`${this.apiUrl}/subscription`)
  }

  /**
   * Abre o portal de gerenciamento de assinatura do Stripe
   */
  openPortal(): Observable<ApiResponse<PortalData>> {
    return this.http.post<ApiResponse<PortalData>>(`${this.apiUrl}/portal`, {})
  }

  /**
   * Cancela a assinatura do usuário
   */
  cancelSubscription(): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/subscription`)
  }
}
