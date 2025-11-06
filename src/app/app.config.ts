import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core'
import { provideRouter } from '@angular/router'
import { provideHttpClient, withInterceptors } from '@angular/common/http'

import { routes } from './app.routes'
import { authInterceptor } from './core/interceptors/auth.interceptor'
import { tokenRefreshInterceptor } from './core/interceptors/token-refresh.interceptor'
import { GlobalErrorHandler } from './core/services/global-error-handler.service'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, tokenRefreshInterceptor])
    ),
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
}
