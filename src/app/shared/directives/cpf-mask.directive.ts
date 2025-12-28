import { Directive, HostListener, ElementRef } from '@angular/core'

/**
 * @Directive - CpfMaskDirective
 * @description - Applies Brazilian CPF mask format to input fields
 * Format: 000.000.000-00
 * @author - Vitor Hugo
 */
@Directive({
  selector: '[appCpfMask]',
  standalone: true
})
export class CpfMaskDirective {
  constructor(private readonly element: ElementRef<HTMLInputElement>) {}

  /**
   * @Function - onInput
   * @description - Handles input event and applies CPF mask formatting
   * @author - Vitor Hugo
   * @param event - InputEvent - The input event
   * @returns void
   */
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '')

    if (value.length > 11) {
      value = value.slice(0, 11)
    }

    value = this.applyCpfMask(value)

    input.value = value
    this.updateFormControl(value)
  }

  /**
   * @Function - onBlur
   * @description - Handles blur event to ensure proper formatting
   * @author - Vitor Hugo
   * @returns void
   */
  @HostListener('blur')
  onBlur(): void {
    const input = this.element.nativeElement
    const value = input.value.replace(/\D/g, '')

    if (value.length > 0 && value.length < 11) {
      input.value = ''
      this.updateFormControl('')
    }
  }

  /**
   * @Function - applyCpfMask
   * @description - Applies the CPF mask format (000.000.000-00)
   * @author - Vitor Hugo
   * @param value - string - The numeric value without formatting
   * @returns string - The formatted CPF
   */
  private applyCpfMask(value: string): string {
    if (value.length === 0) {
      return ''
    }
    if (value.length <= 3) {
      return value
    } else if (value.length <= 6) {
      return value.replace(/^(\d{3})(\d+)/, '$1.$2')
    } else if (value.length <= 9) {
      return value.replace(/^(\d{3})(\d{3})(\d+)/, '$1.$2.$3')
    } else {
      return value.replace(/^(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4')
    }
  }

  /**
   * @Function - updateFormControl
   * @description - Updates the form control value with formatted CPF
   * @author - Vitor Hugo
   * @param value - string - The formatted value
   * @returns void
   */
  private updateFormControl(value: string): void {
    const input = this.element.nativeElement
    if (input.dispatchEvent) {
      const event = new Event('input', { bubbles: true })
      input.dispatchEvent(event)
    }
  }
}

