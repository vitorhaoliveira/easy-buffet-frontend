import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
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
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  getClients(): Observable<ApiResponse<Client[]>> {
    return this.http.get<ApiResponse<Client[]>>(`${this.apiUrl}/clients`)
  }

  /**
   * @Function - getClientsPaginated
   * @description - Retrieves a paginated list of clients
   * @author - Vitor Hugo
   * @param - params: GetClientsParams - page, limit
   * @returns - Observable<PaginatedResponse<Client>>
   */
  getClientsPaginated(params: GetClientsParams = {}): Observable<PaginatedResponse<Client>> {
    let httpParams = new HttpParams()
    if (params.page != null) httpParams = httpParams.set('page', String(params.page))
    if (params.limit != null) httpParams = httpParams.set('limit', String(params.limit))
    return this.http.get<PaginatedResponse<Client>>(`${this.apiUrl}/clients`, { params: httpParams })
  }

  getClientById(id: string): Observable<ApiResponse<Client>> {
    return this.http.get<ApiResponse<Client>>(`${this.apiUrl}/clients/${id}`)
  }

  createClient(clientData: CreateClientRequest): Observable<ApiResponse<Client>> {
    return this.http.post<ApiResponse<Client>>(`${this.apiUrl}/clients`, clientData)
  }

  updateClient(id: string, clientData: UpdateClientRequest): Observable<ApiResponse<Client>> {
    return this.http.put<ApiResponse<Client>>(`${this.apiUrl}/clients/${id}`, clientData)
  }

  deleteClient(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/clients/${id}`)
  }
}

