import { Component, Input, forwardRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { cn } from '@shared/utils/classnames'

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <input
      [type]="type"
      [class]="computedClass"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [value]="value"
      (input)="onInput($event)"
      (blur)="onTouched()"
      data-slot="input"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: string = 'text'
  @Input() placeholder: string = ''
  @Input() class: string = ''
  @Input() disabled: boolean = false

  value: string = ''
  onChange: any = () => {}
  onTouched: any = () => {}

  get computedClass(): string {
    return cn(
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      this.class
    )
  }

  writeValue(value: any): void {
    this.value = value || ''
  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement
    this.value = target.value
    this.onChange(this.value)
  }
}

