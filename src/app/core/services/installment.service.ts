import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Installment,
  CreateInstallmentRequest,
  UpdateInstallmentRequest,
  PayInstallmentRequest,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class InstallmentService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  getInstallments(): Observable<ApiResponse<Installment[]>> {
    return this.http.get<ApiResponse<Installment[]>>(`${this.apiUrl}/installments?limit=1000`)
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

