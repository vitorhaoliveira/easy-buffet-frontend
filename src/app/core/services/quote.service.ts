import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Quote,
  CreateQuoteRequest,
  UpdateQuoteRequest,
  Contract
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private readonly apiUrl = environment.apiBaseUrl
  private readonly http = inject(HttpClient)

  getQuotes(): Observable<ApiResponse<Quote[]>> {
    return this.http.get<ApiResponse<Quote[]>>(`${this.apiUrl}/quotes`)
  }

  getQuoteById(id: string): Observable<ApiResponse<Quote>> {
    return this.http.get<ApiResponse<Quote>>(`${this.apiUrl}/quotes/${id}`)
  }

  createQuote(quoteData: CreateQuoteRequest): Observable<ApiResponse<Quote>> {
    return this.http.post<ApiResponse<Quote>>(`${this.apiUrl}/quotes`, quoteData)
  }

  updateQuote(id: string, quoteData: UpdateQuoteRequest): Observable<ApiResponse<Quote>> {
    return this.http.put<ApiResponse<Quote>>(`${this.apiUrl}/quotes/${id}`, quoteData)
  }

  deleteQuote(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/quotes/${id}`)
  }

  sendQuote(id: string): Observable<ApiResponse<Quote>> {
    return this.http.patch<ApiResponse<Quote>>(`${this.apiUrl}/quotes/${id}/send`, {})
  }

  acceptQuote(id: string): Observable<ApiResponse<Quote>> {
    return this.http.patch<ApiResponse<Quote>>(`${this.apiUrl}/quotes/${id}/accept`, {})
  }

  rejectQuote(id: string): Observable<ApiResponse<Quote>> {
    return this.http.patch<ApiResponse<Quote>>(`${this.apiUrl}/quotes/${id}/reject`, {})
  }

  convertToContract(quoteId: string): Observable<ApiResponse<Contract>> {
    return this.http.post<ApiResponse<Contract>>(`${this.apiUrl}/quotes/${quoteId}/convert-to-contract`, {})
  }
}
