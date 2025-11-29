import { Component, signal, OnInit } from '@angular/core'
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router'
import { CommonModule } from '@angular/common'
import { AuthStateService } from './core/services/auth-state.service'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('easybuffet-angular')
  isNavigating = false

  constructor(
    private router: Router,
    private authState: AuthStateService
  ) {
    // Monitor navigation events
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isNavigating = true
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isNavigating = false
        
        if (event instanceof NavigationError) {
          console.error('Navigation error:', event.error)
          // Try to recover by navigating to home
          setTimeout(() => {
            if (this.authState.token) {
              this.router.navigate(['/'])
            } else {
              this.router.navigate(['/entrar'])
            }
          }, 100)
        }
      }
    })
  }

  ngOnInit(): void {
    // Ensure app initializes properly
    console.log('App initialized')
  }
}
