import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  AdditionalPayment,
  CreateAdditionalPaymentRequest,
  UpdateAdditionalPaymentRequest,
  PaginatedResponse,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class AdditionalPaymentService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  /**
   * @Function - getAdditionalPayments
   * @description - Get paginated list of additional payments with optional filters
   * @author - Vitor Hugo
   * @param - filters: object - Optional filters (page, limit, contractId, clientId, dateFrom, dateTo)
   * @returns - Observable<PaginatedResponse<AdditionalPayment>>
   */
  getAdditionalPayments(filters?: {
    page?: number
    limit?: number
    contractId?: string
    clientId?: string
    dateFrom?: string
    dateTo?: string
  }): Observable<PaginatedResponse<AdditionalPayment>> {
    let params = new HttpParams()
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString())
      if (filters.limit) params = params.set('limit', filters.limit.toString())
      if (filters.contractId) params = params.set('contractId', filters.contractId)
      if (filters.clientId) params = params.set('clientId', filters.clientId)
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom)
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo)
    }
    return this.http.get<PaginatedResponse<AdditionalPayment>>(`${this.apiUrl}/additional-payments`, { params })
  }

  /**
   * @Function - getAdditionalPaymentById
   * @description - Get additional payment by ID
   * @author - Vitor Hugo
   * @param - id: string - Additional payment ID
   * @returns - Observable<ApiResponse<AdditionalPayment>>
   */
  getAdditionalPaymentById(id: string): Observable<ApiResponse<AdditionalPayment>> {
    return this.http.get<ApiResponse<AdditionalPayment>>(`${this.apiUrl}/additional-payments/${id}`)
  }

  /**
   * @Function - createAdditionalPayment
   * @description - Create a new additional payment
   * @author - Vitor Hugo
   * @param - paymentData: CreateAdditionalPaymentRequest - Payment data
   * @returns - Observable<ApiResponse<AdditionalPayment>>
   */
  createAdditionalPayment(paymentData: CreateAdditionalPaymentRequest): Observable<ApiResponse<AdditionalPayment>> {
    return this.http.post<ApiResponse<AdditionalPayment>>(`${this.apiUrl}/additional-payments`, paymentData)
  }

  /**
   * @Function - updateAdditionalPayment
   * @description - Update an existing additional payment
   * @author - Vitor Hugo
   * @param - id: string - Additional payment ID
   * @param - paymentData: UpdateAdditionalPaymentRequest - Updated payment data
   * @returns - Observable<ApiResponse<AdditionalPayment>>
   */
  updateAdditionalPayment(id: string, paymentData: UpdateAdditionalPaymentRequest): Observable<ApiResponse<AdditionalPayment>> {
    return this.http.put<ApiResponse<AdditionalPayment>>(`${this.apiUrl}/additional-payments/${id}`, paymentData)
  }

  /**
   * @Function - deleteAdditionalPayment
   * @description - Delete an additional payment
   * @author - Vitor Hugo
   * @param - id: string - Additional payment ID
   * @returns - Observable<ApiResponse<null>>
   */
  deleteAdditionalPayment(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/additional-payments/${id}`)
  }

  /**
   * @Function - getAdditionalPaymentsByContract
   * @description - Get all additional payments for a specific contract
   * @author - Vitor Hugo
   * @param - contractId: string - Contract ID
   * @returns - Observable<ApiResponse<AdditionalPayment[]>>
   */
  getAdditionalPaymentsByContract(contractId: string): Observable<ApiResponse<AdditionalPayment[]>> {
    return this.http.get<ApiResponse<AdditionalPayment[]>>(`${this.apiUrl}/additional-payments/contract/${contractId}`)
  }
}

