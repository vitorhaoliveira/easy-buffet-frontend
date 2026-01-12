import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Quote,
  CreateQuoteRequest,
  UpdateQuoteRequest,
  SendQuoteRequest,
  AcceptQuoteRequest,
  RejectQuoteRequest,
  GenerateContractRequest,
  QuoteResponse,
  QuoteAcceptanceResponse,
  ContractGenerationResponse,
  Contract
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private readonly apiUrl = environment.apiBaseUrl
  private readonly http = inject(HttpClient)

  // ==================== CRUD Básico ====================

  getQuotes(params?: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/quotes`, { params })
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

  // ==================== Ações de Status ====================

  /**
   * Enviar orçamento com link público
   * Status: Rascunho → Enviado
   */
  sendQuote(id: string, data: SendQuoteRequest): Observable<ApiResponse<Quote>> {
    return this.http.patch<ApiResponse<Quote>>(`${this.apiUrl}/quotes/${id}/send`, data)
  }

  /**
   * Aceitar orçamento (privado - com autenticação)
   * Status: Enviado/Visualizado → Aceito
   */
  acceptQuote(id: string, data: AcceptQuoteRequest): Observable<ApiResponse<QuoteAcceptanceResponse>> {
    return this.http.patch<ApiResponse<QuoteAcceptanceResponse>>(`${this.apiUrl}/quotes/${id}/accept`, data)
  }

  /**
   * Rejeitar orçamento
   * Status: * → Rejeitado
   */
  rejectQuote(id: string, data?: RejectQuoteRequest): Observable<ApiResponse<Quote>> {
    return this.http.patch<ApiResponse<Quote>>(`${this.apiUrl}/quotes/${id}/reject`, data || {})
  }

  // ==================== Link Público ====================

  /**
   * Visualizar orçamento via link público (sem autenticação)
   * Automaticamente atualiza status de Enviado para Visualizado na primeira visualização
   */
  getPublicQuote(token: string): Observable<ApiResponse<Quote>> {
    return this.http.get<ApiResponse<Quote>>(`${this.apiUrl}/quotes/public/${token}`)
  }

  /**
   * Download PDF do orçamento via link público
   */
  downloadPublicQuotePdf(token: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/quotes/public/${token}/pdf`, { responseType: 'blob' })
  }

  /**
   * Aceitar orçamento via link público (sem autenticação)
   * Status: Enviado/Visualizado → Aceito
   */
  acceptPublicQuote(token: string, data: AcceptQuoteRequest): Observable<ApiResponse<QuoteAcceptanceResponse>> {
    return this.http.patch<ApiResponse<QuoteAcceptanceResponse>>(
      `${this.apiUrl}/quotes/public/${token}/accept`,
      data
    )
  }

  /**
   * Rejeitar orçamento via link público (sem autenticação)
   */
  rejectPublicQuote(token: string, data?: RejectQuoteRequest): Observable<ApiResponse<Quote>> {
    return this.http.patch<ApiResponse<Quote>>(`${this.apiUrl}/quotes/public/${token}/reject`, data || {})
  }

  // ==================== Contrato ====================

  /**
   * Gerar contrato automático a partir do orçamento
   * Status: Aceito → Contrato gerado
   */
  generateContract(id: string, data?: GenerateContractRequest): Observable<ApiResponse<ContractGenerationResponse>> {
    return this.http.post<ApiResponse<ContractGenerationResponse>>(
      `${this.apiUrl}/quotes/${id}/generate-contract`,
      data || { generatePdf: true }
    )
  }

  /**
   * Obter dados do contrato gerado
   */
  getQuoteContract(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/quotes/${id}/contract`)
  }

  /**
   * Download PDF do contrato
   */
  downloadContractPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/quotes/${id}/contract/pdf`, { responseType: 'blob' })
  }

  // ==================== Legado (Compatibilidade) ====================

  /**
   * Converter orçamento aceito para contrato (método legado)
   * @deprecated Use generateContract() em vez disso
   */
  convertToContract(quoteId: string): Observable<ApiResponse<Contract>> {
    return this.http.post<ApiResponse<Contract>>(`${this.apiUrl}/quotes/${quoteId}/convert-to-contract`, {})
  }
}
