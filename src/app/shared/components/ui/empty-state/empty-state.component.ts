import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LucideAngularModule } from 'lucide-angular'
import { ButtonComponent } from '../button/button.component'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Icon = any

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent],
  template: `
    <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
      <!-- Icon -->
      <div class="mb-4 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 p-4 shadow-lg">
        <lucide-icon 
          [img]="icon" 
          class="h-8 w-8 text-white"
        ></lucide-icon>
      </div>

      <!-- Title -->
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        {{ title }}
      </h3>

      <!-- Message -->
      <p class="text-gray-600 mb-6 max-w-md">
        {{ message }}
      </p>

      <!-- Action Button -->
      <button
        *ngIf="actionLabel"
        appButton
        class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white"
        (click)="action.emit()"
      >
        <lucide-icon 
          *ngIf="actionIcon" 
          [img]="actionIcon" 
          class="h-4 w-4"
        ></lucide-icon>
        {{ actionLabel }}
      </button>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon!: Icon
  @Input() title: string = ''
  @Input() message: string = ''
  @Input() actionLabel?: string
  @Input() actionIcon?: Icon
  
  @Output() action = new EventEmitter<void>()
}
