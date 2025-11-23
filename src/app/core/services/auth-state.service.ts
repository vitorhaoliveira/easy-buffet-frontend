import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs'
import { Router } from '@angular/router'
import { AuthService } from './auth.service'
import { StorageService } from './storage.service'
import type { User, Organization } from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private userSubject = new BehaviorSubject<User | null>(null)
  private organizationSubject = new BehaviorSubject<Organization | null>(null)
  private tokenSubject = new BehaviorSubject<string | null>(null)
  private loadingSubject = new BehaviorSubject<boolean>(true)

  public user$ = this.userSubject.asObservable()
  public organization$ = this.organizationSubject.asObservable()
  public token$ = this.tokenSubject.asObservable()
  public isLoading$ = this.loadingSubject.asObservable()

  get user(): User | null {
    return this.userSubject.value
  }

  get organization(): Organization | null {
    return this.organizationSubject.value
  }

  get token(): string | null {
    return this.tokenSubject.value
  }

  get isLoading(): boolean {
    return this.loadingSubject.value
  }

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.initializeAuth()
  }

  private async initializeAuth(): Promise<void> {
    if (this.storageService.isAuthenticated()) {
      const storedData = this.storageService.getStoredUserData()
      if (storedData) {
        this.tokenSubject.next(this.storageService.getAccessToken())
        this.userSubject.next(storedData.user)
        this.organizationSubject.next(storedData.organization)
      } else {
        const token = this.storageService.getAccessToken()
        const user = this.storageService.getUser()
        const organization = this.storageService.getOrganization()
        
        if (token && user && organization) {
          this.tokenSubject.next(token)
          this.userSubject.next(user)
          this.organizationSubject.next(organization)
        }
      }

      // Try to verify token with API
      try {
        const response = await firstValueFrom(this.authService.getMe())
        if (response.success && response.data?.user) {
          const user = response.data.user
          
          const organization = user.currentOrganization ? {
            id: user.currentOrganization.id,
            name: user.currentOrganization.name,
            role: user.currentOrganization.role,
            permissions: user.currentOrganization.permissions,
            createdAt: new Date().toISOString()
          } : user.organizations?.[0] ? {
            id: user.organizations[0].id,
            name: user.organizations[0].name,
            role: user.organizations[0].role,
            permissions: user.organizations[0].permissions,
            createdAt: new Date().toISOString()
          } : null
          
          if (organization) {
            this.userSubject.next(user)
            this.organizationSubject.next(organization)
            this.storageService.setUser(user)
            this.storageService.setOrganization(organization)
          }
        }
      } catch (error) {
        console.error('Error verifying token:', error)
      }
    } else {
      this.storageService.clearAll()
      this.tokenSubject.next(null)
      this.userSubject.next(null)
      this.organizationSubject.next(null)
    }
    
    this.loadingSubject.next(false)
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.authService.login(email, password))
      
      if (response.success && response.data) {
        const { user, tokens } = response.data
        
        const organization = user.organizations?.[0] ? {
          id: user.organizations[0].id,
          name: user.organizations[0].name,
          role: user.organizations[0].role,
          permissions: user.organizations[0].permissions,
          createdAt: new Date().toISOString()
        } : null
        
        if (!organization) {
          console.error('No organization found for user')
          return false
        }
        
        this.storageService.setTokens(tokens)
        this.storageService.setUser(user)
        this.storageService.setOrganization(organization)
        this.storageService.setCurrentOrganizationId(organization.id)
        
        this.tokenSubject.next(tokens.accessToken)
        this.userSubject.next(user)
        this.organizationSubject.next(organization)
        
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.storageService.getRefreshToken()
      if (refreshToken) {
        await firstValueFrom(this.authService.logout(refreshToken))
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.storageService.clearAll()
      this.tokenSubject.next(null)
      this.userSubject.next(null)
      this.organizationSubject.next(null)
      this.router.navigate(['/signin'])
    }
  }

  async signup(name: string, email: string, password: string, confirmPassword: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.authService.register(name, email, password, confirmPassword)
      )
      
      if (response.success && response.data) {
        const { user, tokens } = response.data
        
        const organization = user.organizations?.[0] ? {
          id: user.organizations[0].id,
          name: user.organizations[0].name,
          role: user.organizations[0].role,
          permissions: user.organizations[0].permissions,
          createdAt: new Date().toISOString()
        } : null
        
        if (!organization) {
          console.error('No organization found for user')
          return false
        }
        
        this.storageService.setTokens(tokens)
        this.storageService.setUser(user)
        this.storageService.setOrganization(organization)
        this.storageService.setCurrentOrganizationId(organization.id)
        
        this.tokenSubject.next(tokens.accessToken)
        this.userSubject.next(user)
        this.organizationSubject.next(organization)
        
        return true
      }
      return false
    } catch (error) {
      console.error('Signup error:', error)
      return false
    }
  }

  async updateUser(userData: Partial<User>): Promise<boolean> {
    const currentUser = this.userSubject.value
    if (!currentUser) {
      return false
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedUser = { ...currentUser, ...userData }
      this.userSubject.next(updatedUser)
      this.storageService.setUser(updatedUser)
      
      return true
    } catch (error) {
      console.error('Error updating user:', error)
      return false
    }
  }
}

