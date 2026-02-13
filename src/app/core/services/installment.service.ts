import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import { HttpParams } from '@angular/common/http'
import type {
  ApiResponse,
  Installment,
  CreateInstallmentRequest,
  UpdateInstallmentRequest,
  PayInstallmentRequest,
  PaginatedResponse
} from '@shared/models/api.types'

export interface GetInstallmentsParams {
  page?: number
  limit?: number
  status?: string
}

@Injectable({
  providedIn: 'root'
})
export class InstallmentService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  /**
   * @Function - getInstallments
   * @description - Fetches all installments with high limit (legacy). Prefer getInstallmentsPaginated for lists.
   * @returns - Observable<ApiResponse<Installment[]>>
   */
  getInstallments(): Observable<ApiResponse<Installment[]>> {
    return this.http.get<ApiResponse<Installment[]>>(`${this.apiUrl}/installments?limit=1000`)
  }

  /**
   * @Function - getInstallmentsPaginated
   * @description - Fetches installments with server-side pagination
   * @param - params: GetInstallmentsParams - page, limit, optional status
   * @returns - Observable<PaginatedResponse<Installment>>
   */
  getInstallmentsPaginated(params: GetInstallmentsParams = {}): Observable<PaginatedResponse<Installment>> {
    let httpParams = new HttpParams()
    if (params.page != null) httpParams = httpParams.set('page', String(params.page))
    if (params.limit != null) httpParams = httpParams.set('limit', String(params.limit))
    if (params.status && params.status !== 'todos') {
      httpParams = httpParams.set('status', params.status)
    }
    return this.http.get<PaginatedResponse<Installment>>(`${this.apiUrl}/installments`, { params: httpParams })
  }

  getInstallmentById(id: string): Observable<ApiResponse<Installment>> {
    return this.http.get<ApiResponse<Installment>>(`${this.apiUrl}/installments/${id}`)
  }

  createInstallment(installmentData: CreateInstallmentRequest): Observable<ApiResponse<Installment>> {
    return this.http.post<ApiResponse<Installment>>(`${this.apiUrl}/installments`, installmentData)
  }

  updateInstallment(id: string, installmentData: UpdateInstallmentRequest): Observable<ApiResponse<Installment>> {
    return this.http.put<ApiResponse<Installment>>(`${this.apiUrl}/installments/${id}`, installmentData)
  }

  getOverdueInstallments(): Observable<ApiResponse<Installment[]>> {
    return this.http.get<ApiResponse<Installment[]>>(`${this.apiUrl}/installments/overdue`)
  }

  getUpcomingInstallments(): Observable<ApiResponse<Installment[]>> {
    return this.http.get<ApiResponse<Installment[]>>(`${this.apiUrl}/installments/upcoming`)
  }

  payInstallment(id: string, paymentData: PayInstallmentRequest): Observable<ApiResponse<Installment>> {
    return this.http.patch<ApiResponse<Installment>>(`${this.apiUrl}/installments/${id}/pay`, paymentData)
  }

  deleteInstallment(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/installments/${id}`)
  }
}

