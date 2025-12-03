import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { AuthStateService } from '@core/services/auth-state.service'

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signin.component.html',
  styles: []
})
export class SigninComponent {
  email = ''
  password = ''
  isLoading = false
  error = ''
  showPassword = false

  constructor(
    private authState: AuthStateService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  async onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Por favor, preencha todos os campos'
      return
    }

    this.isLoading = true
    this.error = ''

    try {
      const success = await this.authState.login(this.email, this.password)
      if (success) {
        this.router.navigate(['/'])
      } else {
        this.error = 'Email ou senha inválidos'
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao fazer login. Tente novamente.'
    } finally {
      this.isLoading = false
    }
  }

  navigateToSignup() {
    this.router.navigate(['/cadastrar'])
  }
}

