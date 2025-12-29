import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { LucideAngularModule, ArrowLeft, Calendar, MapPin, Users, Package, Clock } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { EventChecklistComponent } from '../event-checklist/event-checklist.component'
import { EventService } from '@core/services/event.service'
import type { Event, EventChecklist } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-event-checklist-page',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    EventChecklistComponent
  ],
  templateUrl: './event-checklist-page.component.html'
})
export class EventChecklistPageComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly CalendarIcon = Calendar
  readonly MapPinIcon = MapPin
  readonly UsersIcon = Users
  readonly PackageIcon = Package
  readonly ClockIcon = Clock

  eventId: string = ''
  event: Event | null = null
  isLoading = true
  error = ''

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  async ngOnInit(): Promise<void> {
    this.eventId = this.route.snapshot.paramMap.get('eventId') || ''
    
    if (!this.eventId) {
      this.error = 'ID do evento não informado'
      this.isLoading = false
      return
    }

    await this.loadEvent()
  }

  /**
   * @Function - loadEvent
   * @description - Loads event data
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadEvent(): Promise<void> {
    try {
      const response = await firstValueFrom(this.eventService.getEventById(this.eventId))
      if (response.success && response.data) {
        this.event = response.data
      } else {
        this.error = 'Evento não encontrado'
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar evento'
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - formatDate
   * @description - Formats date to Brazilian format
   * @author - Vitor Hugo
   * @param - dateString: string
   * @returns - string
   */
  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }

  /**
   * @Function - formatTime
   * @description - Formats time string to HH:mm format
   * @author - Vitor Hugo
   * @param - timeString: string
   * @returns - string
   */
  formatTime(timeString: string): string {
    if (!timeString) return 'Não informado'
    
    // If it's already in HH:mm format
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      return timeString
    }
    
    // If it's an ISO date string, extract the time
    if (timeString.includes('T')) {
      const date = new Date(timeString)
      const hours = date.getUTCHours().toString().padStart(2, '0')
      const minutes = date.getUTCMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }
    
    // Try to parse as date
    try {
      const date = new Date(timeString)
      if (!isNaN(date.getTime())) {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
      }
    } catch {
      // If parsing fails, return as is
    }
    
    return timeString
  }

  /**
   * @Function - onChecklistUpdated
   * @description - Handles checklist update events
   * @author - Vitor Hugo
   * @param - checklist: EventChecklist
   * @returns - void
   */
  onChecklistUpdated(checklist: EventChecklist): void {
    console.log('Checklist updated:', checklist)
  }

  /**
   * @Function - getStatusColor
   * @description - Returns CSS classes for event status
   * @author - Vitor Hugo
   * @param - status: string
   * @returns - string
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Confirmado': 'bg-green-100 text-green-800',
      'Realizado': 'bg-blue-100 text-blue-800',
      'Cancelado': 'bg-gray-100 text-gray-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  /**
   * @Function - goBack
   * @description - Navigates back to events list
   * @author - Vitor Hugo
   * @returns - void
   */
  goBack(): void {
    this.router.navigate(['/cadastros/eventos'])
  }
}

