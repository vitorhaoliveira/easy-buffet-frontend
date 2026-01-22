import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { environment } from '@environments/environment'
import type {
  ApiResponse,
  TeamSchedule,
  CreateTeamScheduleRequest,
  UpdateTeamScheduleRequest,
  TeamScheduleDayView,
  SendConfirmationResponse,
} from '@shared/models/api.types'

@Injectable({
  providedIn: 'root'
})
export class TeamScheduleService {
  private readonly apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) {}

  /**
   * @Function - getEventTeamSchedules
   * @description - Retrieves all team schedules for a specific event
   * @author - Vitor Hugo
   * @param - eventId: string - The event ID
   * @returns - Observable<ApiResponse<TeamSchedule[]>>
   */
  getEventTeamSchedules(eventId: string): Observable<ApiResponse<TeamSchedule[]>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/events/${eventId}/team-schedules`).pipe(
      map(response => {
        if (response.success && response.data) {
          // Se data é um objeto com schedules, extrair o array
          if (response.data.schedules && Array.isArray(response.data.schedules)) {
            return {
              success: response.success,
              message: response.message,
              data: response.data.schedules,
              errors: response.errors
            }
          }
          // Se data já é um array, retornar como está
          if (Array.isArray(response.data)) {
            return response
          }
        }
        // Fallback: retornar array vazio se não conseguir extrair
        return {
          success: response.success,
          message: response.message,
          data: [],
          errors: response.errors
        }
      })
    )
  }

  /**
   * @Function - getTeamScheduleById
   * @description - Retrieves a specific team schedule by ID
   * @author - Vitor Hugo
   * @param - eventId: string - The event ID
   * @param - scheduleId: string - The schedule ID
   * @returns - Observable<ApiResponse<TeamSchedule>>
   */
  getTeamScheduleById(eventId: string, scheduleId: string): Observable<ApiResponse<TeamSchedule>> {
    return this.http.get<ApiResponse<TeamSchedule>>(`${this.apiUrl}/events/${eventId}/team-schedules/${scheduleId}`)
  }

  /**
   * @Function - addTeamMemberToSchedule
   * @description - Adds a team member to an event schedule
   * @author - Vitor Hugo
   * @param - eventId: string - The event ID
   * @param - data: CreateTeamScheduleRequest - The schedule data
   * @returns - Observable<ApiResponse<TeamSchedule>>
   */
  addTeamMemberToSchedule(eventId: string, data: CreateTeamScheduleRequest): Observable<ApiResponse<TeamSchedule>> {
    return this.http.post<ApiResponse<TeamSchedule>>(`${this.apiUrl}/events/${eventId}/team-schedules`, data)
  }

  /**
   * @Function - updateTeamSchedule
   * @description - Updates an existing team schedule
   * @author - Vitor Hugo
   * @param - eventId: string - The event ID
   * @param - scheduleId: string - The schedule ID
   * @param - data: UpdateTeamScheduleRequest - The updated schedule data
   * @returns - Observable<ApiResponse<TeamSchedule>>
   */
  updateTeamSchedule(
    eventId: string,
    scheduleId: string,
    data: UpdateTeamScheduleRequest
  ): Observable<ApiResponse<TeamSchedule>> {
    return this.http.put<ApiResponse<TeamSchedule>>(
      `${this.apiUrl}/events/${eventId}/team-schedules/${scheduleId}`,
      data
    )
  }

  /**
   * @Function - removeTeamMemberFromSchedule
   * @description - Removes a team member from an event schedule
   * @author - Vitor Hugo
   * @param - eventId: string - The event ID
   * @param - scheduleId: string - The schedule ID
   * @returns - Observable<ApiResponse<null>>
   */
  removeTeamMemberFromSchedule(eventId: string, scheduleId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/events/${eventId}/team-schedules/${scheduleId}`)
  }

  /**
   * @Function - sendConfirmationLink
   * @description - Sends a confirmation link to a team member
   * @author - Vitor Hugo
   * @param - eventId: string - The event ID
   * @param - scheduleId: string - The schedule ID
   * @returns - Observable<ApiResponse<SendConfirmationResponse>>
   */
  sendConfirmationLink(eventId: string, scheduleId: string): Observable<ApiResponse<SendConfirmationResponse>> {
    return this.http.post<ApiResponse<SendConfirmationResponse>>(
      `${this.apiUrl}/events/${eventId}/team-schedules/${scheduleId}/send-confirmation`,
      {}
    )
  }

  /**
   * @Function - getEventDayView
   * @description - Retrieves the day view for an event with schedules grouped by role
   * @author - Vitor Hugo
   * @param - eventId: string - The event ID
   * @returns - Observable<ApiResponse<TeamScheduleDayView>>
   */
  getEventDayView(eventId: string): Observable<ApiResponse<TeamScheduleDayView>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/events/${eventId}/team-schedules/day-view`).pipe(
      map(response => {
        if (response.success && response.data) {
          // Normalizar schedules: se for array vazio, converter para objeto vazio
          if (Array.isArray(response.data.schedules)) {
            if (response.data.schedules.length === 0) {
              response.data.schedules = {}
            } else {
              // Se for array com itens, converter para objeto agrupado por role
              const grouped: Record<string, TeamSchedule[]> = {}
              response.data.schedules.forEach((schedule: TeamSchedule) => {
                if (!grouped[schedule.role]) {
                  grouped[schedule.role] = []
                }
                grouped[schedule.role].push(schedule)
              })
              response.data.schedules = grouped
            }
          }
        }
        return response as ApiResponse<TeamScheduleDayView>
      })
    )
  }

  /**
   * @Function - getPublicSchedule
   * @description - Retrieves a public schedule by confirmation token (no authentication required)
   * @author - Vitor Hugo
   * @param - token: string - The confirmation token
   * @returns - Observable<ApiResponse<TeamSchedule>>
   */
  getPublicSchedule(token: string): Observable<ApiResponse<TeamSchedule>> {
    return this.http.get<ApiResponse<TeamSchedule>>(`${this.apiUrl}/team-schedules/public/${token}`)
  }

  /**
   * @Function - confirmPresence
   * @description - Confirms presence for a team schedule (public, no authentication required)
   * @author - Vitor Hugo
   * @param - token: string - The confirmation token
   * @returns - Observable<ApiResponse<TeamSchedule>>
   */
  confirmPresence(token: string): Observable<ApiResponse<TeamSchedule>> {
    return this.http.patch<ApiResponse<TeamSchedule>>(`${this.apiUrl}/team-schedules/public/${token}/confirm`, {})
  }

  /**
   * @Function - cancelPresence
   * @description - Cancels presence for a team schedule (public, no authentication required)
   * @author - Vitor Hugo
   * @param - token: string - The confirmation token
   * @returns - Observable<ApiResponse<TeamSchedule>>
   */
  cancelPresence(token: string): Observable<ApiResponse<TeamSchedule>> {
    return this.http.patch<ApiResponse<TeamSchedule>>(`${this.apiUrl}/team-schedules/public/${token}/cancel`, {})
  }
}
