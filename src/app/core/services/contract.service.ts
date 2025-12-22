import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
  CreateContractResponse,
  Installment,
  ContractItem,
  CreateContractItemRequest,
  UpdateContractItemRequest,
} from '@shared/models/api.types'

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

  getContractById(id: string): Observable<ApiResponse<Contract>> {
    return this.http.get<ApiResponse<Contract>>(`${this.apiUrl}/contracts/${id}`)
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

  // Close Contract
  closeContract(contractId: string): Observable<ApiResponse<Contract>> {
    return this.http.post<ApiResponse<Contract>>(`${this.apiUrl}/contracts/${contractId}/close`, {})
  }

  // Export Installments PDF
  exportInstallmentsPDF(contractId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/contracts/${contractId}/installments/export`, {
      responseType: 'blob'
    })
  }
}

