import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Contract,
  ContractDetailPayload,
  CreateContractRequest,
  UpdateContractRequest,
  CreateContractResponse,
  Installment,
  ContractItem,
  CreateContractItemRequest,
  UpdateContractItemRequest,
  PaginatedResponse,
} from '@shared/models/api.types'

export interface GetContractsParams {
  page?: number
  limit?: number
  paymentStatus?: 'received' | 'pending' | 'all'
  status?: string
  eventId?: string
}

/** Query for GET /contracts/:id/detail (includeSellers as string on wire) */
export interface ContractDetailQueryOptions {
  includeSellers?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  getContracts(paymentStatus?: 'received' | 'pending' | 'all'): Observable<ApiResponse<Contract[]>> {
    let params = new HttpParams()
    if (paymentStatus) {
      params = params.set('paymentStatus', paymentStatus)
    }
    return this.http.get<ApiResponse<Contract[]>>(`${this.apiUrl}/contracts`, { params })
  }

  /**
   * @Function - getContractsPaginated
   * @description - Retrieves a paginated list of contracts with optional filters
   * @author - Vitor Hugo
   * @param - params: GetContractsParams - page, limit, paymentStatus, status
   * @returns - Observable<PaginatedResponse<Contract>>
   */
  getContractsPaginated(params: GetContractsParams = {}): Observable<PaginatedResponse<Contract>> {
    let httpParams = new HttpParams()
    if (params.page != null) httpParams = httpParams.set('page', String(params.page))
    if (params.limit != null) httpParams = httpParams.set('limit', String(params.limit))
    if (params.paymentStatus && params.paymentStatus !== 'all') {
      httpParams = httpParams.set('paymentStatus', params.paymentStatus)
    }
    if (params.status) httpParams = httpParams.set('status', params.status)
    if (params.eventId) httpParams = httpParams.set('eventId', params.eventId)
    return this.http.get<PaginatedResponse<Contract>>(`${this.apiUrl}/contracts`, { params: httpParams })
  }

  getContractById(id: string): Observable<ApiResponse<Contract>> {
    return this.http.get<ApiResponse<Contract>>(`${this.apiUrl}/contracts/${id}`)
  }

  /**
   * @Function - getContractDetail
   * @description - Aggregated contract screen payload: contract, installments, items, additional payments, commission, sellers
   * @param - id: string - contract UUID
   * @param - options: ContractDetailQueryOptions - includeSellers (default true on backend; send false to omit sellers list)
   * @returns - Observable<ApiResponse<ContractDetailPayload>>
   */
  getContractDetail(id: string, options: ContractDetailQueryOptions = {}): Observable<ApiResponse<ContractDetailPayload>> {
    let params = new HttpParams()
    if (options.includeSellers === false) {
      params = params.set('includeSellers', 'false')
    }
    return this.http.get<ApiResponse<ContractDetailPayload>>(`${this.apiUrl}/contracts/${id}/detail`, { params })
  }

  createContract(contractData: CreateContractRequest): Observable<ApiResponse<CreateContractResponse>> {
    return this.http.post<ApiResponse<CreateContractResponse>>(`${this.apiUrl}/contracts`, contractData)
  }

  updateContract(id: string, contractData: UpdateContractRequest): Observable<ApiResponse<Contract>> {
    return this.http.put<ApiResponse<Contract>>(`${this.apiUrl}/contracts/${id}`, contractData)
  }

  getContractInstallments(id: string): Observable<ApiResponse<Installment[]>> {
    return this.http.get<ApiResponse<Installment[]>>(`${this.apiUrl}/contracts/${id}/installments`)
  }

  getContractAdditionalPayments(id: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/contracts/${id}/additional-payments`)
  }

  deleteContract(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/contracts/${id}`)
  }

  // Contract Items Methods
  getContractItems(contractId: string): Observable<ApiResponse<ContractItem[]>> {
    return this.http.get<ApiResponse<ContractItem[]>>(`${this.apiUrl}/contracts/${contractId}/items`)
  }

  addContractItem(contractId: string, itemData: CreateContractItemRequest): Observable<ApiResponse<ContractItem>> {
    return this.http.post<ApiResponse<ContractItem>>(`${this.apiUrl}/contracts/${contractId}/items`, itemData)
  }

  updateContractItem(contractId: string, itemId: string, itemData: UpdateContractItemRequest): Observable<ApiResponse<ContractItem>> {
    return this.http.put<ApiResponse<ContractItem>>(`${this.apiUrl}/contracts/${contractId}/items/${itemId}`, itemData)
  }

  deleteContractItem(contractId: string, itemId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/contracts/${contractId}/items/${itemId}`)
  }

  /**
   * @Function - closeContract
   * @description - Financial closure: POST `{apiBaseUrl}/contracts/{contractId}/close` (apiBaseUrl already includes `/api`).
   * Request body: `{}`. Same auth/org headers as other contract routes (via HttpClient interceptors).
   * Success 200: `{ success: true, data: Contract, message }`. 422 `CONTRACT_ALREADY_CLOSED` if already closed.
   * @param - contractId: string - UUID
   * @returns - Observable<ApiResponse<Contract>>
   */
  closeContract(contractId: string): Observable<ApiResponse<Contract>> {
    return this.http.post<ApiResponse<Contract>>(`${this.apiUrl}/contracts/${contractId}/close`, {})
  }

  /**
   * @Function - openContract
   * @description - Reopen contract: POST `{apiBaseUrl}/contracts/{contractId}/open`. Body `{}`.
   * Success 200: `{ success: true, data: Contract, message }`. 422 `CONTRACT_ALREADY_OPEN` if `closedAt` is already null.
   * @param - contractId: string - UUID
   * @returns - Observable<ApiResponse<Contract>>
   */
  openContract(contractId: string): Observable<ApiResponse<Contract>> {
    return this.http.post<ApiResponse<Contract>>(`${this.apiUrl}/contracts/${contractId}/open`, {})
  }

  // Export Installments PDF
  exportInstallmentsPDF(contractId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/contracts/${contractId}/installments/export`, {
      responseType: 'blob'
    })
  }
}

