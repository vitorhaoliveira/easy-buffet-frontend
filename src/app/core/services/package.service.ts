import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
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

  constructor(private http: HttpClient) {}

  getPackages(): Observable<ApiResponse<Package[]>> {
    return this.http.get<ApiResponse<Package[]>>(`${this.apiUrl}/packages`)
  }

  getPackageById(id: string): Observable<ApiResponse<Package>> {
    return this.http.get<ApiResponse<Package>>(`${this.apiUrl}/packages/${id}`)
  }

  createPackage(packageData: CreatePackageRequest): Observable<ApiResponse<Package>> {
    return this.http.post<ApiResponse<Package>>(`${this.apiUrl}/packages`, packageData)
  }

  updatePackage(id: string, packageData: UpdatePackageRequest): Observable<ApiResponse<Package>> {
    return this.http.put<ApiResponse<Package>>(`${this.apiUrl}/packages/${id}`, packageData)
  }

  deletePackage(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/packages/${id}`)
  }
}

