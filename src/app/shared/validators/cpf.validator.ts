import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'

/**
 * @Function - cpfValidator
 * @description - Validates Brazilian CPF format and checksum
 * Validates both format (000.000.000-00) and CPF algorithm
 * @author - Vitor Hugo
 * @returns ValidatorFn - Angular validator function
 */
export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null
    }

    const cpfDigits = control.value.replace(/\D/g, '')

    if (cpfDigits.length !== 11) {
      return { invalidCpf: { value: control.value } }
    }

    if (!isValidCpf(cpfDigits)) {
      return { invalidCpf: { value: control.value } }
    }

    return null
  }
}

/**
 * @Function - isValidCpf
 * @description - Validates CPF using the official algorithm
 * @author - Vitor Hugo
 * @param cpf - string - CPF digits only (11 digits)
 * @returns boolean - true if CPF is valid
 */
function isValidCpf(cpf: string): boolean {
  if (cpf.length !== 11) {
    return false
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  let sum = 0
  let remainder

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) {
    remainder = 0
  }
  if (remainder !== parseInt(cpf.substring(9, 10))) {
    return false
  }

  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) {
    remainder = 0
  }
  if (remainder !== parseInt(cpf.substring(10, 11))) {
    return false
  }

  return true
}


