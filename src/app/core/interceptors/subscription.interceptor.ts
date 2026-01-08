import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { catchError } from 'rxjs/operators'
import { throwError } from 'rxjs'
import { ToastService } from '../services/toast.service'

/**
 * Interceptor que captura erros 402 (Payment Required) do backend
 * Quando o backend detecta subscription expirada, redireciona para página de pagamento
 */
export const subscriptionInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)
  const toastService = inject(ToastService)

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Erro 402 = Payment Required (subscription expirada/inválida)
      if (error.status === 402) {
        console.warn('⚠️ Subscription Interceptor: Erro 402 detectado', error)
        
        const errorMessage = error.error?.message || 
          'Sua assinatura expirou ou está inativa. Por favor, renove para continuar.'
        
        // Não mostrar toast se já estiver na página de payment-required
        const currentUrl = router.url
        if (!currentUrl.includes('/payment-required') && !currentUrl.includes('/checkout')) {
          toastService.error(errorMessage)
          
          // Redirecionar para página de payment-required apenas se não estiver em rotas de pagamento
          router.navigate(['/payment-required'], {
            queryParams: {
              reason: error.error?.code || 'SUBSCRIPTION_REQUIRED',
              message: errorMessage
            }
          })
        }
      }

      return throwError(() => error)
    })
  )
}
