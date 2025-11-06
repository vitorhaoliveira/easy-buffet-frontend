import { Directive, HostListener, ElementRef } from '@angular/core'

/**
 * @Directive - PhoneMaskDirective
 * @description - Applies Brazilian phone mask format to input fields
 * Supports both formats:
 * - (XX) XXXX-XXXX - 10 digits (landline)
 * - (XX) XXXXX-XXXX - 11 digits (mobile)
 * @author - Vitor Hugo
 */
@Directive({
  selector: '[appPhoneMask]',
  standalone: true
})
export class PhoneMaskDirective {
  constructor(private readonly element: ElementRef<HTMLInputElement>) {}

  /**
   * @Function - onInput
   * @description - Handles input event and applies phone mask formatting
   * @author - Vitor Hugo
   * @param event - InputEvent - The input event
   * @returns void
   */
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '')
    
    value = this.applyPhoneMask(value)
    
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
    
    if (value.length > 0 && value.length < 10) {
      input.value = ''
      this.updateFormControl('')
    }
  }

  /**
   * @Function - applyPhoneMask
   * @description - Applies the phone mask based on the number of digits
   * @author - Vitor Hugo
   * @param value - string - The numeric value without formatting
   * @returns string - The formatted phone number
   */
  private applyPhoneMask(value: string): string {
    if (value.length <= 10) {
      // Format: (XX) XXXX-XXXX
      return value
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    } else {
      // Format: (XX) XXXXX-XXXX
      return value
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15)
    }
  }

  /**
   * @Function - updateFormControl
   * @description - Updates the form control value with clean phone number
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

