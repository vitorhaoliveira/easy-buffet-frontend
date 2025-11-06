import { ErrorHandler, Injectable, NgZone } from '@angular/core'
import { Router } from '@angular/router'

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private zone: NgZone,
    private router: Router
  ) {}

  handleError(error: any): void {
    // Log the error to console
    console.error('Global error caught:', error)

    // Get the error message
    const errorMessage = error?.message || error?.toString() || 'Unknown error'
    
    // Check for specific error types
    if (errorMessage.includes('ChunkLoadError') || errorMessage.includes('Loading chunk')) {
      console.warn('Chunk load error detected - reloading page')
      this.zone.run(() => {
        window.location.reload()
      })
      return
    }

    // For navigation errors, try to navigate to home
    if (errorMessage.includes('Cannot match any routes')) {
      console.warn('Navigation error - redirecting to home')
      this.zone.run(() => {
        this.router.navigate(['/'])
      })
      return
    }

    // Don't show error for common expected errors
    if (
      errorMessage.includes('ExpressionChangedAfterItHasBeenCheckedError') ||
      errorMessage.includes('NG0100')
    ) {
      return
    }

    // Log other errors but don't crash the app
    console.error('Error details:', {
      message: errorMessage,
      stack: error?.stack,
      error: error
    })
  }
}

