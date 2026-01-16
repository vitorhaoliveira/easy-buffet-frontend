import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { AuthService } from '@core/services/auth.service'

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotPasswordForm!: FormGroup
  loading = false
  submitted = false
  message = ''
  messageType: 'success' | 'error' = 'success'

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForm()
  }

  initializeForm(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    })
  }

  get f() {
    return this.forgotPasswordForm.controls
  }

  onSubmit(): void {
    this.submitted = true

    if (this.forgotPasswordForm.invalid) {
      return
    }

    this.loading = true
    this.message = ''

    this.authService.forgotPassword(this.f['email'].value).subscribe({
      next: () => {
        this.loading = false
        this.messageType = 'success'
        this.message =
          'Email enviado! Verifique sua caixa de entrada para redefinir sua senha.'
        this.forgotPasswordForm.reset()
        this.submitted = false

        // Redireciona para login após 3 segundos
        setTimeout(() => {
          this.router.navigate(['/entrar'])
        }, 3000)
      },
      error: (error) => {
        this.loading = false
        this.messageType = 'error'
        this.message =
          error.error?.message ||
          'Erro ao processar solicitação. Tente novamente.'
      }
    })
  }

  goBack(): void {
    this.router.navigate(['/entrar'])
  }
}
