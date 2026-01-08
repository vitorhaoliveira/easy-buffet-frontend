import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-mobile-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="computedClass">
      <ng-content></ng-content>
    </div>
  `
})
export class MobileCardComponent {
  @Input() class: string = ''
  @Input() data?: any

  get computedClass(): string {
    const baseClasses = 'bg-white rounded-lg shadow p-4 space-y-3 transition-colors active:bg-gray-50'
    return `${baseClasses} ${this.class}`
  }
}
