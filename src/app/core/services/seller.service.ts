import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Seller,
  CreateSellerRequest,
  UpdateSellerRequest,
  PaginatedResponse,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  getSellers(params?: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Observable<PaginatedResponse<Seller> | ApiResponse<Seller[]>> {
    let httpParams = new HttpParams()
    
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString())
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString())
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search)
    }
    if (params?.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy)
    }
    if (params?.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder)
    }

    return this.http.get<PaginatedResponse<Seller> | ApiResponse<Seller[]>>(
      `${this.apiUrl}/sellers`,
      { params: httpParams }
    )
  }

  getSellerById(id: string): Observable<ApiResponse<Seller>> {
    return this.http.get<ApiResponse<Seller>>(`${this.apiUrl}/sellers/${id}`)
  }

  createSeller(sellerData: CreateSellerRequest): Observable<ApiResponse<Seller>> {
    return this.http.post<ApiResponse<Seller>>(`${this.apiUrl}/sellers`, sellerData)
  }

  updateSeller(id: string, sellerData: UpdateSellerRequest): Observable<ApiResponse<Seller>> {
    return this.http.put<ApiResponse<Seller>>(`${this.apiUrl}/sellers/${id}`, sellerData)
  }

  deleteSeller(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/sellers/${id}`)
  }
}

