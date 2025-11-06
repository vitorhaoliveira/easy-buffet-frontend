import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'

/**
 * @Function - phoneValidator
 * @description - Validates Brazilian phone number format
 * Ensures the phone has at least 10 digits (DDD + number)
 * @author - Vitor Hugo
 * @returns ValidatorFn - Angular validator function
 */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null
    }

    const phoneDigits = control.value.replace(/\D/g, '')
    
    if (phoneDigits.length < 10) {
      return { invalidPhone: { value: control.value } }
    }

    return null
  }
}

