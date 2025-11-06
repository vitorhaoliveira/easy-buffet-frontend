import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="class">
      <label [for]="inputId" class="sr-only">{{ placeholder }}</label>
      <input
        [id]="inputId"
        type="text"
        [(ngModel)]="value"
        (ngModelChange)="onValueChange($event)"
        [placeholder]="placeholder"
        class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchBarComponent),
      multi: true
    }
  ]
})
export class SearchBarComponent implements ControlValueAccessor {
  @Input() placeholder: string = 'Pesquisar…'
  @Input() class: string = ''
  @Output() valueChange = new EventEmitter<string>()

  value: string = ''
  inputId: string = `search-${Math.random().toString(36).substr(2, 9)}`

  onChange: any = () => {}
  onTouched: any = () => {}

  onValueChange(value: string): void {
    this.value = value
    this.onChange(value)
    this.valueChange.emit(value)
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
    // Handle disabled state if needed
  }
}

