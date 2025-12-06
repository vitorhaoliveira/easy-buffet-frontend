import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  Unit,
  CreateUnitRequest,
  UpdateUnitRequest,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  /**
   * @Function - getUnits
   * @description - Retrieves a list of units, optionally filtered by active status
   * @author - Vitor Hugo
   * @param - isActive?: boolean - Optional filter for active/inactive units
   * @returns - Observable<ApiResponse<Unit[]>>
   */
  getUnits(isActive?: boolean): Observable<ApiResponse<Unit[]>> {
    let params = new HttpParams()
    if (isActive !== undefined) {
      params = params.set('isActive', isActive.toString())
    }
    return this.http.get<ApiResponse<Unit[]>>(`${this.apiUrl}/units`, { params })
  }

  /**
   * @Function - getUnitById
   * @description - Retrieves a single unit by its ID
   * @author - Vitor Hugo
   * @param - id: string - The unit ID
   * @returns - Observable<ApiResponse<Unit>>
   */
  getUnitById(id: string): Observable<ApiResponse<Unit>> {
    return this.http.get<ApiResponse<Unit>>(`${this.apiUrl}/units/${id}`)
  }

  /**
   * @Function - createUnit
   * @description - Creates a new unit
   * @author - Vitor Hugo
   * @param - unitData: CreateUnitRequest - The unit data to create
   * @returns - Observable<ApiResponse<Unit>>
   */
  createUnit(unitData: CreateUnitRequest): Observable<ApiResponse<Unit>> {
    return this.http.post<ApiResponse<Unit>>(`${this.apiUrl}/units`, unitData)
  }

  /**
   * @Function - updateUnit
   * @description - Updates an existing unit
   * @author - Vitor Hugo
   * @param - id: string - The unit ID
   * @param - unitData: UpdateUnitRequest - The unit data to update
   * @returns - Observable<ApiResponse<Unit>>
   */
  updateUnit(id: string, unitData: UpdateUnitRequest): Observable<ApiResponse<Unit>> {
    return this.http.put<ApiResponse<Unit>>(`${this.apiUrl}/units/${id}`, unitData)
  }

  /**
   * @Function - deleteUnit
   * @description - Deletes a unit (soft delete)
   * @author - Vitor Hugo
   * @param - id: string - The unit ID
   * @returns - Observable<ApiResponse<null>>
   */
  deleteUnit(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/units/${id}`)
  }
}

