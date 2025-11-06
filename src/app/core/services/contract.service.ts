import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
  CreateContractResponse,
  Installment,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  getContracts(): Observable<ApiResponse<Contract[]>> {
    return this.http.get<ApiResponse<Contract[]>>(`${this.apiUrl}/contracts`)
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

  deleteContract(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/contracts/${id}`)
  }
}

