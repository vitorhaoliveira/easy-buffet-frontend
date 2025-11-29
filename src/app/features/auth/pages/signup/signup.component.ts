import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { AuthStateService } from '@core/services/auth-state.service'

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styles: []
})
export class SignupComponent {
  name = ''
  email = ''
  password = ''
  confirmPassword = ''
  organizationName = ''
  isLoading = false
  error = ''
  showPassword = false
  showConfirmPassword = false

  constructor(
    private authState: AuthStateService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword
  }

  async onSubmit() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword || !this.organizationName) {
      this.error = 'Por favor, preencha todos os campos'
      return
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'As senhas não coincidem'
      return
    }

    this.isLoading = true
    this.error = ''

    try {
      const success = await this.authState.signup(
        this.name,
        this.email,
        this.password,
        this.confirmPassword,
        this.organizationName
      )
      
      if (success) {
        this.router.navigate(['/'])
      } else {
        this.error = 'Erro ao criar conta. Tente novamente.'
      }
    } catch (err: any) {
      console.error('Signup component error:', err)
      this.error = err.message || 'Erro ao criar conta. Tente novamente.'
    } finally {
      this.isLoading = false
    }
  }
}

