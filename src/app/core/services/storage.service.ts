import { Injectable } from '@angular/core'
import type { User, Organization, UserPermissions } from '@shared/models/api.types'

export interface StoredUserData {
  user: User;
  organization: Organization;
  currentOrganizationId: string;
  permissions: UserPermissions;
}

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly USER_KEY = 'user'
  private readonly ORGANIZATION_KEY = 'organization'
  private readonly CURRENT_ORG_ID_KEY = 'currentOrganizationId'
  private readonly ACCESS_TOKEN_KEY = 'accessToken'
  private readonly REFRESH_TOKEN_KEY = 'refreshToken'

  // User data methods
  getUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY)
      if (!userData || userData === 'null' || userData === 'undefined') {
        return null
      }
      return JSON.parse(userData)
    } catch (error) {
      console.error('Error parsing stored user:', error)
      return null
    }
  }

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  // Organization data methods
  getOrganization(): Organization | null {
    try {
      const orgData = localStorage.getItem(this.ORGANIZATION_KEY)
      if (!orgData || orgData === 'null' || orgData === 'undefined') {
        return null
      }
      return JSON.parse(orgData)
    } catch (error) {
      console.error('Error parsing stored organization:', error)
      return null
    }
  }

  setOrganization(organization: Organization): void {
    localStorage.setItem(this.ORGANIZATION_KEY, JSON.stringify(organization))
  }

  getCurrentOrganizationId(): string | null {
    return localStorage.getItem(this.CURRENT_ORG_ID_KEY)
  }

  setCurrentOrganizationId(organizationId: string): void {
    localStorage.setItem(this.CURRENT_ORG_ID_KEY, organizationId)
  }

  // Token methods
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  getTokens(): StoredTokens | null {
    const accessToken = this.getAccessToken()
    const refreshToken = this.getRefreshToken()
    
    if (!accessToken || !refreshToken) {
      return null
    }

    return { accessToken, refreshToken }
  }

  setTokens(tokens: StoredTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken)
  }

  // Combined data methods
  getStoredUserData(): StoredUserData | null {
    const user = this.getUser()
    const organization = this.getOrganization()
    const currentOrganizationId = this.getCurrentOrganizationId()

    if (!user || !organization || !currentOrganizationId) {
      return null
    }

    // Get permissions from user's current organization or first organization
    const permissions = user.currentOrganization?.permissions || 
                       user.organizations?.[0]?.permissions || 
                       user.permissions

    if (!permissions) {
      return null
    }

    return {
      user,
      organization,
      currentOrganizationId,
      permissions
    }
  }

  setStoredUserData(userData: StoredUserData): void {
    this.setUser(userData.user)
    this.setOrganization(userData.organization)
    this.setCurrentOrganizationId(userData.currentOrganizationId)
  }

  // Permission methods
  getUserPermissions(): UserPermissions | null {
    const user = this.getUser()
    if (!user) return null

    return user.currentOrganization?.permissions || 
           user.organizations?.[0]?.permissions || 
           user.permissions || 
           null
  }

  hasPermission(module: keyof UserPermissions, action: string): boolean {
    const permissions = this.getUserPermissions()
    if (!permissions) return false

    const modulePermissions = permissions[module]
    if (!modulePermissions) return false

    return (modulePermissions as any)[action] === true
  }

  // Organization switching
  switchOrganization(organizationId: string): boolean {
    const user = this.getUser()
    if (!user || !user.organizations) return false

    const targetOrg = user.organizations.find(org => org.id === organizationId)
    if (!targetOrg) return false

    // Update current organization in user data
    const updatedUser = {
      ...user,
      currentOrganization: {
        id: targetOrg.id,
        name: targetOrg.name,
        role: targetOrg.role,
        permissions: targetOrg.permissions
      }
    }

    // Create organization object
    const organization = {
      id: targetOrg.id,
      name: targetOrg.name,
      createdAt: new Date().toISOString()
    }

    // Update stored data
    this.setUser(updatedUser)
    this.setOrganization(organization)
    this.setCurrentOrganizationId(organizationId)

    return true
  }

  // Clear all data
  clearAll(): void {
    localStorage.removeItem(this.USER_KEY)
    localStorage.removeItem(this.ORGANIZATION_KEY)
    localStorage.removeItem(this.CURRENT_ORG_ID_KEY)
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    const user = this.getUser()
    return !!(token && user)
  }

  // Get user's organizations
  getUserOrganizations(): Organization[] {
    const user = this.getUser()
    if (!user || !user.organizations) return []

    return user.organizations.map(org => ({
      id: org.id,
      name: org.name,
      createdAt: new Date().toISOString()
    }))
  }
}

