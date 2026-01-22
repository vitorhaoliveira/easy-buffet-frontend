import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute, RouterModule } from '@angular/router'
import { LucideAngularModule, ArrowLeft, Calendar, MapPin, Users, Phone, Mail, Clock, UserPlus } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { SkeletonComponent } from '@shared/components/ui/skeleton/skeleton.component'
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component'
import { TeamScheduleService } from '@core/services/team-schedule.service'
import type { TeamScheduleDayView, ConfirmationStatus } from '@shared/models/api.types'
import { formatDateBR, formatTime as formatTimeUtil } from '@shared/utils/date.utils'

@Component({
  selector: 'app-event-day-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    SkeletonComponent,
    EmptyStateComponent
  ],
  templateUrl: './event-day-view.component.html'
})
export class EventDayViewComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly CalendarIcon = Calendar
  readonly MapPinIcon = MapPin
  readonly UsersIcon = Users
  readonly PhoneIcon = Phone
  readonly MailIcon = Mail
  readonly ClockIcon = Clock
  readonly UserPlusIcon = UserPlus

  dayView: TeamScheduleDayView | null = null
  eventId: string = ''
  isLoading: boolean = true
  error: string = ''

  constructor(
    private teamScheduleService: TeamScheduleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    this.eventId = this.route.snapshot.paramMap.get('eventId') || ''
    if (!this.eventId) {
      this.error = 'ID do evento não encontrado'
      this.isLoading = false
      return
    }
    await this.loadDayView()
  }

  async loadDayView(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const response = await firstValueFrom(
        this.teamScheduleService.getEventDayView(this.eventId)
      )
      if (response.success && response.data) {
        this.dayView = response.data
      } else {
        this.error = 'Erro ao carregar visualização do dia'
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar visualização do dia'
    } finally {
      this.isLoading = false
    }
  }

  getStatusBadgeClass(status: ConfirmationStatus): string {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pendente':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  getStatusLabel(status: ConfirmationStatus): string {
    switch (status) {
      case 'confirmado':
        return 'Confirmado'
      case 'cancelado':
        return 'Cancelado'
      case 'pendente':
      default:
        return 'Pendente'
    }
  }

  formatTime(dateString: string): string {
    return formatTimeUtil(dateString)
  }

  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }

  getRoleGroups(): Array<{ role: string; schedules: any[] }> {
    if (!this.dayView) return []
    
    // Se schedules é um array vazio, retornar array vazio
    if (Array.isArray(this.dayView.schedules)) {
      return []
    }
    
    // Se schedules é um objeto (Record), processar normalmente
    return Object.entries(this.dayView.schedules).map(([role, schedules]) => ({
      role,
      schedules
    }))
  }

  /**
   * @Function - hasSchedules
   * @description - Checks if there are any schedules in the day view
   * @author - Vitor Hugo
   * @returns - boolean
   */
  hasSchedules(): boolean {
    if (!this.dayView) return false
    if (this.dayView.total === 0) return false
    
    const groups = this.getRoleGroups()
    return groups.length > 0 && groups.some(group => group.schedules.length > 0)
  }

  goBack(): void {
    this.router.navigate(['/cadastros/eventos', this.eventId, 'equipe'])
  }
}
