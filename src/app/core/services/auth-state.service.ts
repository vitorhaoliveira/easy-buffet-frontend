import { Injectable } from '@angular/core'
import { BehaviorSubject, firstValueFrom } from 'rxjs'
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

  /**
   * @Function - initializeAuth
   * @description - Initializes authentication state from stored data and verifies token
   * @author - EasyBuffet Team
   * @returns - Promise<void>
   */
  private async initializeAuth(): Promise<void> {
    try {
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

        // Verify token with API
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
          // Clear invalid auth data
          this.storageService.clearAll()
          this.tokenSubject.next(null)
          this.userSubject.next(null)
          this.organizationSubject.next(null)
        }
      } else {
        this.storageService.clearAll()
        this.tokenSubject.next(null)
        this.userSubject.next(null)
        this.organizationSubject.next(null)
      }
    } catch (error) {
      // Silent fail - auth will be handled by login
    } finally {
      this.loadingSubject.next(false)
    }
  }

  /**
   * @Function - login
   * @description - Authenticates user and sets up application state
   * @author - EasyBuffet Team
   * @param - email: string - User's email
   * @param - password: string - User's password
   * @returns - Promise<boolean> - True if login successful
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.authService.login(email, password))
      
      if (response.success && response.data) {
        const { user, tokens } = response.data
        
        // Get organization from user data or currentOrganization
        const orgData = user.currentOrganization || user.organizations?.[0]
        
        if (!orgData) {
          throw new Error('Nenhuma organização encontrada para este usuário')
        }

        const organization: Organization = {
          id: orgData.id,
          name: orgData.name,
          role: orgData.role,
          permissions: orgData.permissions,
          createdAt: new Date().toISOString()
        }

        // Ensure user object has proper structure
        const updatedUser = {
          ...user,
          organizations: user.organizations || [{
            id: orgData.id,
            name: orgData.name,
            role: orgData.role,
            permissions: orgData.permissions
          }],
          currentOrganization: {
            id: orgData.id,
            name: orgData.name,
            role: orgData.role,
            permissions: orgData.permissions
          }
        }
        
        this.storageService.setTokens(tokens)
        this.storageService.setUser(updatedUser)
        this.storageService.setOrganization(organization)
        this.storageService.setCurrentOrganizationId(organization.id)
        
        this.tokenSubject.next(tokens.accessToken)
        this.userSubject.next(updatedUser)
        this.organizationSubject.next(organization)
        
        return true
      }
      return false
    } catch (error: any) {
      if (error.error) {
        const errorMessage = error.error.error?.message || error.error.message
        throw new Error(errorMessage || 'Erro ao fazer login')
      }
      
      throw error
    }
  }

  /**
   * @Function - logout
   * @description - Logs out user and clears application state
   * @author - EasyBuffet Team
   * @returns - Promise<void>
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.storageService.getRefreshToken()
      if (refreshToken) {
        await firstValueFrom(this.authService.logout(refreshToken))
      }
    } catch (error) {
      // Silent fail on logout error
    } finally {
      this.storageService.clearAll()
      this.tokenSubject.next(null)
      this.userSubject.next(null)
      this.organizationSubject.next(null)
      this.router.navigate(['/entrar'])
    }
  }

  /**
   * @Function - signup
   * @description - Registers new user and sets up application state
   * @author - EasyBuffet Team
   * @param - name: string - User's full name
   * @param - email: string - User's email
   * @param - password: string - User's password
   * @param - confirmPassword: string - Password confirmation
   * @param - organizationName: string - Organization/company name
   * @returns - Promise<boolean> - True if signup successful
   */
  async signup(name: string, email: string, password: string, confirmPassword: string, organizationName: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.authService.register(name, email, password, confirmPassword, organizationName)
      )
      
      if (response.success && response.data) {
        const { user, tokens, organization } = response.data
        
        if (!organization) {
          throw new Error('Organização não encontrada na resposta')
        }

        const defaultPermissions = {
          dashboard: { view: true },
          cadastros: { create: true, edit: true, delete: true, view: true },
          financeiro: { create: true, edit: true, delete: true, view: true },
          relatorios: { view: true, export: true }
        }

        const organizationData: Organization = {
          id: organization.id,
          name: organization.name,
          role: 'Administrador',
          permissions: defaultPermissions,
          createdAt: new Date().toISOString()
        }

        // Update user object to include organizations array with permissions
        const updatedUser = {
          ...user,
          organizations: [{
            id: organization.id,
            name: organization.name,
            role: 'Administrador',
            permissions: defaultPermissions
          }],
          currentOrganization: {
            id: organization.id,
            name: organization.name,
            role: 'Administrador',
            permissions: defaultPermissions
          }
        }
        
        this.storageService.setTokens(tokens)
        this.storageService.setUser(updatedUser)
        this.storageService.setOrganization(organizationData)
        this.storageService.setCurrentOrganizationId(organization.id)
        
        this.tokenSubject.next(tokens.accessToken)
        this.userSubject.next(updatedUser)
        this.organizationSubject.next(organizationData)
        
        return true
      }
      return false
    } catch (error: any) {
      if (error.error) {
        const errorMessage = error.error.error?.message || error.error.message
        throw new Error(errorMessage || 'Erro ao criar conta')
      }
      
      throw error
    }
  }

  /**
   * @Function - updateUser
   * @description - Updates current user data
   * @author - EasyBuffet Team
   * @param - userData: Partial<User> - User data to update
   * @returns - Promise<boolean> - True if update successful
   */
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
    } catch (error: any) {
      return false
    }
  }

  /**
   * @Function - refreshUser
   * @description - Recarrega os dados do usuário do backend
   * @author - EasyBuffet Team
   * @returns - Promise<boolean> - True if refresh successful
   */
  async refreshUser(): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.authService.getMe())
      
      
      if (response.success && response.data) {
        // O response.data JÁ É o user (não tem response.data.user)
        const user = response.data as unknown as User
        
        this.userSubject.next(user)
        this.storageService.setUser(user)
        
        // Atualiza também a organização se necessário
        if (user.currentOrganization) {
          const organization: Organization = {
            id: user.currentOrganization.id,
            name: user.currentOrganization.name,
            role: user.currentOrganization.role,
            permissions: user.currentOrganization.permissions,
            createdAt: new Date().toISOString()
          }
          this.organizationSubject.next(organization)
          this.storageService.setOrganization(organization)
        }
        
        console.log('✅ refreshUser concluído com sucesso')
        return true
      }
      
      console.warn('⚠️ response.success é false ou data está vazio')
      return false
    } catch (error) {
      console.error('❌ Erro ao recarregar dados do usuário:', error)
      return false
    }
  }
}

