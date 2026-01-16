import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms'
import { AuthService } from '@core/services/auth.service'
import { ToastService } from '@core/services/toast.service'

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  changePasswordForm!: FormGroup
  loading = false
  submitted = false
  message = ''
  messageType: 'success' | 'error' = 'success'
  showCurrentPassword = false
  showNewPassword = false
  showConfirmPassword = false

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toast: ToastService
  ) {
    this.initializeForm()
  }

  initializeForm(): void {
    this.changePasswordForm = this.formBuilder.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(6)
          ]
        ],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    )
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value
    if (!value) return null

    const hasUpperCase = /[A-Z]/.test(value)
    const hasLowerCase = /[a-z]/.test(value)
    const hasNumbers = /\d/.test(value)

    const passwordValid = hasUpperCase && hasLowerCase && hasNumbers

    return passwordValid
      ? null
      : { passwordStrength: { value: control.value } }
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('newPassword')
    const confirmPassword = group.get('confirmPassword')

    if (!password || !confirmPassword) return null

    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true }
  }

  get f() {
    return this.changePasswordForm.controls
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword
  }

  hasUpperCase(): boolean {
    const password = this.f['newPassword'].value
    return /[A-Z]/.test(password)
  }

  hasLowerCase(): boolean {
    const password = this.f['newPassword'].value
    return /[a-z]/.test(password)
  }

  hasNumber(): boolean {
    const password = this.f['newPassword'].value
    return /\d/.test(password)
  }

  hasMinLength(): boolean {
    const password = this.f['newPassword'].value
    return password && password.length >= 6
  }

  onSubmit(): void {
    this.submitted = true

    if (this.changePasswordForm.invalid) {
      return
    }

    this.loading = true
    this.message = ''

    this.authService
      .changePassword(
        this.f['currentPassword'].value,
        this.f['newPassword'].value,
        this.f['confirmPassword'].value
      )
      .subscribe({
        next: () => {
          this.loading = false
          this.messageType = 'success'
          this.message = 'Senha alterada com sucesso!'
          this.changePasswordForm.reset()
          this.submitted = false

          // Toast notification
          this.toast.success('Senha alterada com sucesso!')

          // Clear message after 3 seconds
          setTimeout(() => {
            this.message = ''
          }, 3000)
        },
        error: (error) => {
          this.loading = false
          this.messageType = 'error'
          this.message =
            error.error?.message ||
            'Erro ao alterar senha. Tente novamente.'

          // Toast notification
          this.toast.error(this.message)
        }
      })
  }

  resetForm(): void {
    this.changePasswordForm.reset()
    this.submitted = false
    this.message = ''
  }
}
