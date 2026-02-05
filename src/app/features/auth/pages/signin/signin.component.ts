import { Component, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { AuthStateService } from '@core/services/auth-state.service'
import { AuthService } from '@core/services/auth.service'
import { environment } from '@environments/environment'

interface Testimonial {
  quote: string
  author: string
  role: string
  initials: string
}

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signin.component.html',
  styles: [`
    .testimonial-slide {
      animation: testimonialFadeIn 0.5s ease-out;
    }
    @keyframes testimonialFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class SigninComponent implements OnInit, OnDestroy {
  readonly supportUrl = environment.supportUrl

  readonly testimonials: Testimonial[] = [
    {
      quote: 'Antes eu vivia apagando incêndio no dia do evento. Hoje está tudo organizado antes mesmo de começar. O sistema mudou a forma como eu trabalho.',
      author: 'André Correa',
      role: 'Dono de buffet',
      initials: 'AC'
    },
    {
      quote: 'A gente trabalhava muito, mas não sabia se estava lucrando. Agora vejo tudo claro por evento.',
      author: 'Simone Tenorio',
      role: 'Buffet de eventos',
      initials: 'ST'
    },
    {
      quote: 'Eu não tinha clareza do lucro dos eventos. Trabalhava muito, mas não sabia exatamente quanto ganhava. Com o sistema, passei a enxergar os números e tomar decisões melhores.',
      author: 'Ricardo Henrique',
      role: 'Buffet corporativo',
      initials: 'RH'
    }
  ]

  currentTestimonialIndex = 0
  private testimonialInterval: ReturnType<typeof setInterval> | null = null

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
    this.startTestimonialCarousel()
  }

  ngOnDestroy(): void {
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval)
    }
  }

  /**
   * @Function - startTestimonialCarousel
   * @description - Starts the testimonial carousel that advances every 6 seconds
   * @author - EasyBuffet Team
   */
  private startTestimonialCarousel(): void {
    this.testimonialInterval = setInterval(() => {
      this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % this.testimonials.length
    }, 6000)
  }

  /**
   * @Function - goToTestimonial
   * @description - Jumps to a specific testimonial by index (e.g. dot click) and resets the carousel timer
   * @param - index: number - testimonial index
   */
  goToTestimonial(index: number): void {
    this.currentTestimonialIndex = index
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval)
    }
    this.startTestimonialCarousel()
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

