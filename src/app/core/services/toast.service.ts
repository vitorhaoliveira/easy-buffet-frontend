import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([])
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable()
  private maxToasts = 3

  success(message: string, duration: number = 4000): void {
    this.show('success', message, duration)
  }

  error(message: string, duration: number = 5000): void {
    this.show('error', message, duration)
  }

  info(message: string, duration: number = 4000): void {
    this.show('info', message, duration)
  }

  warning(message: string, duration: number = 4000): void {
    this.show('warning', message, duration)
  }

  private show(type: Toast['type'], message: string, duration: number): void {
    const id = this.generateId()
    const toast: Toast = { id, type, message, duration }

    const currentToasts = this.toastsSubject.value
    
    // Limit to max toasts
    const updatedToasts = [...currentToasts, toast].slice(-this.maxToasts)
    this.toastsSubject.next(updatedToasts)

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, duration)
    }
  }

  remove(id: string): void {
    const currentToasts = this.toastsSubject.value
    const updatedToasts = currentToasts.filter(toast => toast.id !== id)
    this.toastsSubject.next(updatedToasts)
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
