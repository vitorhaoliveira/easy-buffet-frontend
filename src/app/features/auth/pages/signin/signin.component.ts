import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { AuthStateService } from '@core/services/auth-state.service'
import { AuthService } from '@core/services/auth.service'

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signin.component.html',
  styles: []
})
export class SigninComponent implements OnInit {
  email = ''
  password = ''
  isLoading = false
  error = ''
  showPassword = false

  // Properties for server wake-up feedback
  isServerWaking = true
  serverAwake = false
  loadingMessage = 'Conectando ao servidor...'

  constructor(
    private authState: AuthStateService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.wakeUpServer()
  }

  /**
   * @Function - wakeUpServer
   * @description - Silently pings the server to wake it from cold start
   * @author - EasyBuffet Team
   */
  private wakeUpServer(): void {
    this.isServerWaking = true
    this.serverAwake = false

    this.authService.wakeUpServer().subscribe({
      next: () => {
        this.isServerWaking = false
        this.serverAwake = true

        // Hide the "server ready" message after 3 seconds
        setTimeout(() => {
          this.serverAwake = false
        }, 3000)
      },
      error: () => {
        this.isServerWaking = false
        this.serverAwake = true
      }
    })
  }

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
    this.loadingMessage = this.serverAwake ? 'Autenticando...' : 'Conectando ao servidor...'

    try {
      const success = await this.authState.login(this.email, this.password)
      if (success) {
        this.loadingMessage = 'Entrando...'
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

