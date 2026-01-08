import { Component, OnInit, OnDestroy, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LucideAngularModule, CheckCircle, X, Info, AlertTriangle, XCircle, LucideIconData } from 'lucide-angular'
import { Subject, takeUntil } from 'rxjs'
import { ToastService, Toast } from '@core/services/toast.service'
import { trigger, transition, style, animate } from '@angular/animations'

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div 
        *ngFor="let toast of toasts"
        @slideIn
        [class]="getToastClasses(toast)"
        class="pointer-events-auto shadow-lg rounded-lg p-4 flex items-start gap-3 min-w-[320px] max-w-md"
      >
        <!-- Icon -->
        <div [class]="getIconWrapperClasses(toast)">
          <lucide-icon 
            [img]="getIcon(toast)" 
            class="h-5 w-5"
          ></lucide-icon>
        </div>

        <!-- Message -->
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">{{ toast.message }}</p>
        </div>

        <!-- Close Button -->
        <button
          (click)="removeToast(toast.id)"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <lucide-icon [img]="XIcon" class="h-4 w-4"></lucide-icon>
        </button>
      </div>
    </div>
  `
})
export class ToastComponent implements OnInit, OnDestroy {
  private readonly toastService = inject(ToastService)
  
  toasts: Toast[] = []
  private destroy$ = new Subject<void>()

  readonly CheckCircleIcon = CheckCircle
  readonly XCircleIcon = XCircle
  readonly InfoIcon = Info
  readonly AlertTriangleIcon = AlertTriangle
  readonly XIcon = X

  ngOnInit(): void {
    this.toastService.toasts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(toasts => {
        this.toasts = toasts
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  removeToast(id: string): void {
    this.toastService.remove(id)
  }

  getToastClasses(toast: Toast): string {
    const baseClasses = 'bg-white border-l-4'
    switch (toast.type) {
      case 'success':
        return `${baseClasses} border-green-500`
      case 'error':
        return `${baseClasses} border-red-500`
      case 'warning':
        return `${baseClasses} border-yellow-500`
      case 'info':
        return `${baseClasses} border-primary-500`
      default:
        return baseClasses
    }
  }

  getIconWrapperClasses(toast: Toast): string {
    const baseClasses = 'flex-shrink-0 rounded-full p-1'
    switch (toast.type) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-600`
      case 'error':
        return `${baseClasses} bg-red-100 text-red-600`
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-600`
      case 'info':
        return `${baseClasses} bg-gradient-to-br from-primary-400 to-primary-600 text-white`
      default:
        return baseClasses
    }
  }

  getIcon(toast: Toast): LucideIconData {
    switch (toast.type) {
      case 'success':
        return this.CheckCircleIcon
      case 'error':
        return this.XCircleIcon
      case 'warning':
        return this.AlertTriangleIcon
      case 'info':
        return this.InfoIcon
      default:
        return this.InfoIcon
    }
  }
}
