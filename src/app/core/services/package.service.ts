import { Injectable, inject, Injector } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, tap } from 'rxjs'
import { ReferenceDataCacheService } from './reference-data-cache.service'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Package,
  CreatePackageRequest,
  UpdatePackageRequest,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private readonly apiUrl = environment.apiBaseUrl
  private readonly http = inject(HttpClient)
  private readonly injector = inject(Injector)

  /**
   * @Function - invalidateReferenceCache
   * @description - Clears reference list cache after mutating packages
   * @returns - void
   */
  private invalidateReferenceCache(): void {
    void this.injector.get(ReferenceDataCacheService).invalidatePackages()
  }

  getPackages(): Observable<ApiResponse<Package[]>> {
    return this.http.get<ApiResponse<Package[]>>(`${this.apiUrl}/packages`)
  }

  getPackageById(id: string): Observable<ApiResponse<Package>> {
    return this.http.get<ApiResponse<Package>>(`${this.apiUrl}/packages/${id}`)
  }

  createPackage(packageData: CreatePackageRequest): Observable<ApiResponse<Package>> {
    return this.http.post<ApiResponse<Package>>(`${this.apiUrl}/packages`, packageData).pipe(
      tap(res => {
        if (res.success) this.invalidateReferenceCache()
      })
    )
  }

  updatePackage(id: string, packageData: UpdatePackageRequest): Observable<ApiResponse<Package>> {
    return this.http.put<ApiResponse<Package>>(`${this.apiUrl}/packages/${id}`, packageData).pipe(
      tap(res => {
        if (res.success) this.invalidateReferenceCache()
      })
    )
  }

  deletePackage(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/packages/${id}`).pipe(
      tap(res => {
        if (res.success) this.invalidateReferenceCache()
      })
    )
  }
}

