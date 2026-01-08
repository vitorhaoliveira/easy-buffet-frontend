import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

type SkeletonShape = 'rectangle' | 'circle'

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [class]="computedClass" 
      [style.width]="width"
      [style.height]="height"
    ></div>
  `
})
export class SkeletonComponent {
  @Input() width: string = '100%'
  @Input() height: string = '20px'
  @Input() shape: SkeletonShape = 'rectangle'
  @Input() class: string = ''

  get computedClass(): string {
    const baseClasses = 'bg-gray-200 animate-pulse'
    const shapeClasses = this.shape === 'circle' ? 'rounded-full' : 'rounded-md'
    
    return `${baseClasses} ${shapeClasses} ${this.class}`
  }
}
