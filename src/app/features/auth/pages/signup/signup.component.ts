import { Component, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { AuthStateService } from '@core/services/auth-state.service'
import { environment } from '@environments/environment'

interface Testimonial {
  quote: string
  author: string
  role: string
  initials: string
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html',
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
export class SignupComponent implements OnInit, OnDestroy {
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

  ngOnInit(): void {
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
        this.router.navigate(['/checkout'])
      } else {
        this.error = 'Erro ao criar conta. Tente novamente.'
      }
    } catch (err: unknown) {
      this.error = (err as Error).message || 'Erro ao criar conta. Tente novamente.'
    } finally {
      this.isLoading = false
    }
  }
}

