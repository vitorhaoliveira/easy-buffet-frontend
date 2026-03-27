import { Injectable, inject, Injector } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { tap } from 'rxjs'
import { ReferenceDataCacheService } from './reference-data-cache.service'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  PaginatedResponse,
} from '@shared/models/api.types'

export interface GetClientsParams {
  page?: number
  limit?: number
  /** Full-text search (sent as `search` query param; backend also accepts q/term) */
  search?: string
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly apiUrl = environment.apiBaseUrl
  private readonly http = inject(HttpClient)
  private readonly injector = inject(Injector)

  /**
   * @Function - invalidateReferenceCache
   * @description - Clears reference list cache after mutating clients (lazy to avoid circular DI)
   * @returns - void
   */
  private invalidateReferenceCache(): void {
    void this.injector.get(ReferenceDataCacheService).invalidateClients()
  }

  getClients(): Observable<ApiResponse<Client[]>> {
    return this.http.get<ApiResponse<Client[]>>(`${this.apiUrl}/clients`)
  }

  /**
   * @Function - getClientsPaginated
   * @description - Retrieves a paginated list of clients
   * @author - Vitor Hugo
   * @param - params: GetClientsParams - page, limit, search
   * @returns - Observable<PaginatedResponse<Client>>
   */
  getClientsPaginated(params: GetClientsParams = {}): Observable<PaginatedResponse<Client>> {
    let httpParams = new HttpParams()
    if (params.page != null) httpParams = httpParams.set('page', String(params.page))
    if (params.limit != null) httpParams = httpParams.set('limit', String(params.limit))
    if (params.search) httpParams = httpParams.set('search', params.search)
    return this.http.get<PaginatedResponse<Client>>(`${this.apiUrl}/clients`, { params: httpParams })
  }

  getClientById(id: string): Observable<ApiResponse<Client>> {
    return this.http.get<ApiResponse<Client>>(`${this.apiUrl}/clients/${id}`)
  }

  createClient(clientData: CreateClientRequest): Observable<ApiResponse<Client>> {
    return this.http.post<ApiResponse<Client>>(`${this.apiUrl}/clients`, clientData).pipe(
      tap(res => {
        if (res.success) this.invalidateReferenceCache()
      })
    )
  }

  updateClient(id: string, clientData: UpdateClientRequest): Observable<ApiResponse<Client>> {
    return this.http.put<ApiResponse<Client>>(`${this.apiUrl}/clients/${id}`, clientData).pipe(
      tap(res => {
        if (res.success) this.invalidateReferenceCache()
      })
    )
  }

  deleteClient(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/clients/${id}`).pipe(
      tap(res => {
        if (res.success) this.invalidateReferenceCache()
      })
    )
  }
}

