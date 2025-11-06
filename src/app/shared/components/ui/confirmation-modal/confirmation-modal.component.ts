import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LucideAngularModule, AlertTriangle, X } from 'lucide-angular'
import { ButtonComponent } from '../button/button.component'

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b">
          <div class="flex items-center space-x-3">
            <div [class]="'p-2 rounded-full ' + styles.iconBg">
              <lucide-icon [img]="AlertTriangleIcon" [class]="'h-5 w-5 ' + styles.iconColor"></lucide-icon>
            </div>
            <h2 class="text-lg font-semibold">{{ title }}</h2>
          </div>
          <button 
            appButton
            variant="ghost"
            size="sm"
            (click)="onClose.emit()"
            [disabled]="loading"
          >
            <lucide-icon [img]="XIcon" class="h-4 w-4"></lucide-icon>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <p class="text-gray-600 mb-6">{{ message }}</p>
          
          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3">
            <button
              appButton
              variant="outline"
              (click)="onClose.emit()"
              [disabled]="loading"
            >
              {{ cancelText }}
            </button>
            <button
              appButton
              [class]="styles.confirmButton"
              (click)="onConfirm.emit()"
              [disabled]="loading"
            >
              {{ loading ? 'Processando...' : confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfirmationModalComponent {
  @Input() isOpen: boolean = false
  @Input() title: string = ''
  @Input() message: string = ''
  @Input() confirmText: string = 'Confirmar'
  @Input() cancelText: string = 'Cancelar'
  @Input() variant: 'danger' | 'warning' | 'info' = 'danger'
  @Input() loading: boolean = false
  
  @Output() onClose = new EventEmitter<void>()
  @Output() onConfirm = new EventEmitter<void>()

  readonly AlertTriangleIcon = AlertTriangle
  readonly XIcon = X

  get styles() {
    switch (this.variant) {
      case 'danger':
        return {
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        }
      case 'warning':
        return {
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        }
      case 'info':
        return {
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
        }
      default:
        return {
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        }
    }
  }
}

