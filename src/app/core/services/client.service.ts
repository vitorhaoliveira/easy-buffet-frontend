import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Client,
  CreateClientRequest,
  UpdateClientRequest,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  getClients(): Observable<ApiResponse<Client[]>> {
    return this.http.get<ApiResponse<Client[]>>(`${this.apiUrl}/clients`)
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

