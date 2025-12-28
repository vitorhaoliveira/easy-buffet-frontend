import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  CommissionDetails,
  SetCommissionRequest,
  MarkCommissionPaidRequest,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class CommissionService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  /**
   * @Function - getCommission
   * @description - Get commission details for a contract
   * @author - Vitor Hugo
   * @param - contractId: string - Contract ID
   * @returns - Observable<ApiResponse<CommissionDetails>>
   */
  getCommission(contractId: string): Observable<ApiResponse<CommissionDetails>> {
    return this.http.get<ApiResponse<CommissionDetails>>(
      `${this.apiUrl}/contracts/${contractId}/commission`
    )
  }

  /**
   * @Function - setCommission
   * @description - Set or update commission for a contract
   * @author - Vitor Hugo
   * @param - contractId: string - Contract ID
   * @param - data: SetCommissionRequest - Commission data
   * @returns - Observable<ApiResponse<CommissionDetails>>
   */
  setCommission(
    contractId: string,
    data: SetCommissionRequest
  ): Observable<ApiResponse<CommissionDetails>> {
    return this.http.put<ApiResponse<CommissionDetails>>(
      `${this.apiUrl}/contracts/${contractId}/commission`,
      data
    )
  }

  /**
   * @Function - markAsPaid
   * @description - Mark commission as paid
   * @author - Vitor Hugo
   * @param - contractId: string - Contract ID
   * @param - data: MarkCommissionPaidRequest - Payment data (optional)
   * @returns - Observable<ApiResponse<CommissionDetails>>
   */
  markAsPaid(
    contractId: string,
    data?: MarkCommissionPaidRequest
  ): Observable<ApiResponse<CommissionDetails>> {
    return this.http.post<ApiResponse<CommissionDetails>>(
      `${this.apiUrl}/contracts/${contractId}/commission/pay`,
      data || {}
    )
  }

  /**
   * @Function - markAsUnpaid
   * @description - Revert commission payment
   * @author - Vitor Hugo
   * @param - contractId: string - Contract ID
   * @returns - Observable<ApiResponse<CommissionDetails>>
   */
  markAsUnpaid(contractId: string): Observable<ApiResponse<CommissionDetails>> {
    return this.http.post<ApiResponse<CommissionDetails>>(
      `${this.apiUrl}/contracts/${contractId}/commission/unpay`,
      {}
    )
  }

  /**
   * @Function - removeCommission
   * @description - Remove commission from contract
   * @author - Vitor Hugo
   * @param - contractId: string - Contract ID
   * @returns - Observable<ApiResponse<null>>
   */
  removeCommission(contractId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.apiUrl}/contracts/${contractId}/commission`
    )
  }
}

