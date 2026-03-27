import { Injectable, inject } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { ClientService } from './client.service'
import { PackageService } from './package.service'
import { UnitService } from './unit.service'
import { StorageService } from './storage.service'
import { IndexedDbCacheService } from './indexed-db-cache.service'
import type { ApiResponse, Client, Package, Unit } from '@shared/models/api.types'

/** Default TTL for reference lists (clients, packages, units) in IndexedDB */
const REFERENCE_LIST_TTL_MS = 30 * 60 * 1000

/**
 * @description - In-memory + IndexedDB cache for reference lists with stale-while-revalidate
 * when loading from persistence after a full page reload.
 */
@Injectable({
  providedIn: 'root'
})
export class ReferenceDataCacheService {
  private readonly clientService = inject(ClientService)
  private readonly packageService = inject(PackageService)
  private readonly unitService = inject(UnitService)
  private readonly storageService = inject(StorageService)
  private readonly idb = inject(IndexedDbCacheService)

  private clientsCache: Client[] | null = null
  private packagesCache: ApiResponse<Package[]> | null = null
  private readonly unitsCache = new Map<string, ApiResponse<Unit[]>>()

  /**
   * @Function - orgPrefix
   * @description - Prefix for IndexedDB keys for the current organization
   * @returns - string
   */
  private orgPrefix(): string {
    return `${this.storageService.getCurrentOrganizationId() || 'anon'}:ref:`
  }

  private clientsIdbKey(): string {
    return `${this.orgPrefix()}clients`
  }

  private packagesIdbKey(): string {
    return `${this.orgPrefix()}packages`
  }

  private unitsIdbKey(isActive?: boolean): string {
    const key = isActive === undefined ? 'all' : String(isActive)
    return `${this.orgPrefix()}units:${key}`
  }

  /**
   * @Function - getClientsList
   * @description - Returns cached clients; fetches from API or IDB with background revalidate
   * @returns - Promise<Client[]>
   */
  async getClientsList(): Promise<Client[]> {
    if (this.clientsCache) {
      return this.clientsCache
    }
    const idbKey = this.clientsIdbKey()
    const entry = await this.idb.get<Client[]>(idbKey)
    if (entry) {
      this.clientsCache = entry.value
      void this.refreshClientsFromNetwork(idbKey)
      return this.clientsCache
    }
    return this.fetchClientsFresh(idbKey)
  }

  /**
   * @Function - fetchClientsFresh
   * @description - Loads clients from API and updates memory + IndexedDB
   * @param - idbKey: string
   * @returns - Promise<Client[]>
   */
  private async fetchClientsFresh(idbKey: string): Promise<Client[]> {
    const response = await firstValueFrom(this.clientService.getClients())
    const list = response.success && response.data ? response.data : []
    this.clientsCache = list
    await this.idb.set(idbKey, list, REFERENCE_LIST_TTL_MS)
    return list
  }

  /**
   * @Function - refreshClientsFromNetwork
   * @description - Background revalidate after serving IndexedDB snapshot
   * @param - idbKey: string
   * @returns - Promise<void>
   */
  private async refreshClientsFromNetwork(idbKey: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.clientService.getClients())
      const list = response.success && response.data ? response.data : []
      this.clientsCache = list
      await this.idb.set(idbKey, list, REFERENCE_LIST_TTL_MS)
    } catch {
      // Keep in-memory / last IDB snapshot
    }
  }

  /**
   * @Function - getPackagesResponse
   * @description - Returns cached packages API response; IDB + background revalidate when needed
   * @returns - Promise<ApiResponse<Package[]>>
   */
  async getPackagesResponse(): Promise<ApiResponse<Package[]>> {
    if (this.packagesCache) {
      return Promise.resolve(this.packagesCache)
    }
    const idbKey = this.packagesIdbKey()
    const entry = await this.idb.get<ApiResponse<Package[]>>(idbKey)
    if (entry) {
      this.packagesCache = entry.value
      void this.refreshPackagesFromNetwork(idbKey)
      return this.packagesCache
    }
    return this.fetchPackagesFresh(idbKey)
  }

  private async fetchPackagesFresh(idbKey: string): Promise<ApiResponse<Package[]>> {
    const response = await firstValueFrom(this.packageService.getPackages())
    this.packagesCache = response
    await this.idb.set(idbKey, response, REFERENCE_LIST_TTL_MS)
    return response
  }

  private async refreshPackagesFromNetwork(idbKey: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.packageService.getPackages())
      this.packagesCache = response
      await this.idb.set(idbKey, response, REFERENCE_LIST_TTL_MS)
    } catch {
      // keep snapshot
    }
  }

  /**
   * @Function - getUnitsList
   * @description - Returns cached units for the given active filter; IDB + background revalidate
   * @param - isActive?: boolean - Optional active-only filter
   * @returns - Promise<Unit[]>
   */
  async getUnitsList(isActive?: boolean): Promise<Unit[]> {
    const key = isActive === undefined ? 'all' : String(isActive)
    if (this.unitsCache.has(key)) {
      const cached = this.unitsCache.get(key)!
      const list = cached.success && cached.data ? cached.data : []
      return list
    }
    const idbKey = this.unitsIdbKey(isActive)
    const entry = await this.idb.get<ApiResponse<Unit[]>>(idbKey)
    if (entry) {
      this.unitsCache.set(key, entry.value)
      void this.refreshUnitsFromNetwork(isActive, idbKey, key)
      const list = entry.value.success && entry.value.data ? entry.value.data : []
      return list
    }
    return this.fetchUnitsFresh(isActive, idbKey, key)
  }

  private async fetchUnitsFresh(
    isActive: boolean | undefined,
    idbKey: string,
    mapKey: string
  ): Promise<Unit[]> {
    const response = await firstValueFrom(this.unitService.getUnits(isActive))
    this.unitsCache.set(mapKey, response)
    await this.idb.set(idbKey, response, REFERENCE_LIST_TTL_MS)
    const list = response.success && response.data ? response.data : []
    return list
  }

  private async refreshUnitsFromNetwork(
    isActive: boolean | undefined,
    idbKey: string,
    mapKey: string
  ): Promise<void> {
    try {
      const response = await firstValueFrom(this.unitService.getUnits(isActive))
      this.unitsCache.set(mapKey, response)
      await this.idb.set(idbKey, response, REFERENCE_LIST_TTL_MS)
    } catch {
      // keep snapshot
    }
  }

  /**
   * @Function - invalidateClients
   * @description - Clears clients cache after create/update/delete
   * @returns - Promise<void>
   */
  async invalidateClients(): Promise<void> {
    this.clientsCache = null
    await this.idb.delete(this.clientsIdbKey())
  }

  /**
   * @Function - invalidatePackages
   * @description - Clears packages cache after create/update/delete
   * @returns - Promise<void>
   */
  async invalidatePackages(): Promise<void> {
    this.packagesCache = null
    await this.idb.delete(this.packagesIdbKey())
  }

  /**
   * @Function - invalidateUnits
   * @description - Clears all unit list variants from memory and IndexedDB
   * @returns - Promise<void>
   */
  async invalidateUnits(): Promise<void> {
    this.unitsCache.clear()
    const prefix = this.orgPrefix()
    await this.idb.deleteByPrefix(`${prefix}units:`)
  }

  /**
   * @Function - invalidateAll
   * @description - Clears in-memory reference data (e.g. after organization switch). IndexedDB keys are org-scoped, so persisted entries for other orgs are left until TTL.
   * @returns - Promise<void>
   */
  invalidateAll(): void {
    this.clientsCache = null
    this.packagesCache = null
    this.unitsCache.clear()
  }

  /**
   * @Function - clearAllStorage
   * @description - Clears memory and full IndexedDB cache on logout
   * @returns - Promise<void>
   */
  async clearAllStorage(): Promise<void> {
    this.clientsCache = null
    this.packagesCache = null
    this.unitsCache.clear()
    await this.idb.clearAll()
  }
}
