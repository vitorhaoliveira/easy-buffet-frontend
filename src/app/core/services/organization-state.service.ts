import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { StorageService } from './storage.service'
import type { Organization, UserPermissions } from '@shared/models/api.types'

export interface UserOrganizationRole {
  organizationId: string;
  role: 'Administrador' | 'Auxiliar';
  permissions: UserPermissions;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationStateService {
  private currentOrganizationSubject = new BehaviorSubject<Organization | null>(null)
  private userOrganizationsSubject = new BehaviorSubject<Organization[]>([])
  private loadingSubject = new BehaviorSubject<boolean>(true)

  public currentOrganization$ = this.currentOrganizationSubject.asObservable()
  public userOrganizations$ = this.userOrganizationsSubject.asObservable()
  public isLoading$ = this.loadingSubject.asObservable()

  get currentOrganization(): Organization | null {
    return this.currentOrganizationSubject.value
  }

  get userOrganizations(): Organization[] {
    return this.userOrganizationsSubject.value
  }

  constructor(private storageService: StorageService) {
    this.loadOrganizations()
  }

  private loadOrganizations(): void {
    try {
      this.loadingSubject.next(true)
      
      if (!this.storageService.isAuthenticated()) {
        this.loadingSubject.next(false)
        return
      }
      
      const storedData = this.storageService.getStoredUserData()
      if (storedData) {
        this.currentOrganizationSubject.next(storedData.organization)
        const organizations = this.storageService.getUserOrganizations()
        this.userOrganizationsSubject.next(organizations)
      } else {
        const user = this.storageService.getUser()
        const organization = this.storageService.getOrganization()
        
        if (user && organization) {
          this.currentOrganizationSubject.next(organization)
          this.userOrganizationsSubject.next([organization])
        }
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
      this.userOrganizationsSubject.next([])
      this.currentOrganizationSubject.next(null)
    } finally {
      this.loadingSubject.next(false)
    }
  }

  switchOrganization(organizationId: string): void {
    const success = this.storageService.switchOrganization(organizationId)
    if (success) {
      const newOrg = this.storageService.getOrganization()
      if (newOrg) {
        this.currentOrganizationSubject.next(newOrg)
      }
    }
  }
}

