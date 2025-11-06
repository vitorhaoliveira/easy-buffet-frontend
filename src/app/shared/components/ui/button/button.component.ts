import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@shared/utils/classnames'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

type ButtonVariants = VariantProps<typeof buttonVariants>;

@Component({
  selector: 'app-button, button[appButton]',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'computedClass',
    '[attr.data-slot]': '"button"',
    '[attr.type]': 'type',
    '[attr.disabled]': 'isDisabled ? true : null'
  }
})
export class ButtonComponent {
  @Input() variant: ButtonVariants['variant'] = 'default'
  @Input() size: ButtonVariants['size'] = 'default'
  @Input() class: string = ''
  @Input() type: string = 'button'
  @Input() disabled: boolean | string = false

  get computedClass(): string {
    return cn(buttonVariants({ variant: this.variant, size: this.size }), this.class)
  }

  get isDisabled(): boolean {
    return this.disabled === true || this.disabled === ''
  }
}

