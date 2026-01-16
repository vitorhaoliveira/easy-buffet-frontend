import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { AuthService } from '@core/services/auth.service'

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup
  token = ''
  loading = false
  submitted = false
  message = ''
  messageType: 'success' | 'error' = 'success'
  showPassword = false
  showConfirmPassword = false

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Tenta pegar o token do path parameter primeiro, depois do query parameter
    this.token = this.route.snapshot.paramMap.get('token') || 
                 this.route.snapshot.queryParamMap.get('token') || ''

    if (!this.token) {
      this.messageType = 'error'
      this.message = 'Link inválido ou expirado. Solicite um novo link.'
    }

    this.initializeForm()
  }

  initializeForm(): void {
    this.resetPasswordForm = this.formBuilder.group(
      {
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
    return this.resetPasswordForm.controls
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword
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

    if (this.resetPasswordForm.invalid || !this.token) {
      return
    }

    this.loading = true
    this.message = ''

    this.authService
      .resetPassword(
        this.token,
        this.f['newPassword'].value,
        this.f['confirmPassword'].value
      )
      .subscribe({
        next: () => {
          this.loading = false
          this.messageType = 'success'
          this.message =
            'Senha redefinida com sucesso! Redirecionando para login...'
          this.resetPasswordForm.reset()
          this.submitted = false

          setTimeout(() => {
            this.router.navigate(['/entrar'])
          }, 2000)
        },
        error: (error) => {
          this.loading = false
          this.messageType = 'error'

          if (error.error?.error?.code === 'INVALID_TOKEN') {
            this.message = 'Link expirado ou inválido. Solicite um novo link.'
          } else {
            this.message =
              error.error?.message ||
              'Erro ao redefinir senha. Tente novamente.'
          }
        }
      })
  }

  goToLogin(): void {
    this.router.navigate(['/entrar'])
  }
}
