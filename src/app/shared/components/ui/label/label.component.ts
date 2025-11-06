import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { cn } from '@shared/utils/classnames'

@Component({
  selector: 'app-label, label[appLabel]',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'computedClass',
    '[attr.for]': 'htmlFor'
  }
})
export class LabelComponent {
  @Input() htmlFor: string = ''
  @Input() class: string = ''

  get computedClass(): string {
    return cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      this.class
    )
  }
}

