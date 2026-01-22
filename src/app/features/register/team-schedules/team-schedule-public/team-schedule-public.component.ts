import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { LucideAngularModule, CheckCircle, XCircle, Calendar, MapPin, Users, Phone, Mail, Clock, AlertCircle } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'
import { SkeletonComponent } from '@shared/components/ui/skeleton/skeleton.component'
import { TeamScheduleService } from '@core/services/team-schedule.service'
import type { TeamSchedule, ConfirmationStatus } from '@shared/models/api.types'
import { formatDateBR, formatTime as formatTimeUtil } from '@shared/utils/date.utils'

@Component({
  selector: 'app-team-schedule-public',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ButtonComponent,
    ConfirmationModalComponent,
    SkeletonComponent
  ],
  templateUrl: './team-schedule-public.component.html'
})
export class TeamSchedulePublicComponent implements OnInit {
  readonly CheckCircleIcon = CheckCircle
  readonly XCircleIcon = XCircle
  readonly CalendarIcon = Calendar
  readonly MapPinIcon = MapPin
  readonly UsersIcon = Users
  readonly PhoneIcon = Phone
  readonly MailIcon = Mail
  readonly ClockIcon = Clock
  readonly AlertCircleIcon = AlertCircle

  schedule: TeamSchedule | null = null
  token: string = ''
  isLoading: boolean = true
  error: string = ''
  isConfirming: boolean = false
  isCancelling: boolean = false
  showConfirmModal: boolean = false
  showCancelModal: boolean = false
  successMessage: string = ''

  constructor(
    private teamScheduleService: TeamScheduleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.token = this.route.snapshot.paramMap.get('token') || ''
    
    if (!this.token) {
      this.error = 'Token inválido ou expirado'
      this.isLoading = false
      return
    }

    await this.loadSchedule()
  }

  async loadSchedule(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      this.successMessage = ''
      const response = await firstValueFrom(
        this.teamScheduleService.getPublicSchedule(this.token)
      )
      if (response.success && response.data) {
        this.schedule = response.data
      } else {
        this.error = 'Erro ao carregar escala'
      }
    } catch (err: any) {
      if (err.status === 410) {
        this.error = 'O link de confirmação expirou. Entre em contato com a organização.'
      } else {
        this.error = err.message || 'Erro ao carregar escala'
      }
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

  canConfirm(): boolean {
    return this.schedule?.confirmationStatus === 'pendente'
  }

  canCancel(): boolean {
    return this.schedule?.confirmationStatus === 'pendente'
  }

  handleConfirmClick(): void {
    if (!this.canConfirm()) return
    this.showConfirmModal = true
  }

  handleCancelClick(): void {
    if (!this.canCancel()) return
    this.showCancelModal = true
  }

  /**
   * @Function - handleConfirmPresence
   * @description - Confirms presence for the team schedule
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmPresence(): Promise<void> {
    try {
      this.isConfirming = true
      const response = await firstValueFrom(
        this.teamScheduleService.confirmPresence(this.token)
      )
      if (response.success && response.data) {
        this.schedule = response.data
        this.successMessage = 'Presença confirmada com sucesso!'
        this.showConfirmModal = false
        setTimeout(() => {
          this.successMessage = ''
        }, 5000)
      } else {
        this.error = 'Erro ao confirmar presença'
        this.showConfirmModal = false
      }
    } catch (err: any) {
      if (err.status === 409) {
        this.error = 'Esta escala já foi confirmada ou cancelada'
      } else if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else {
        this.error = 'Erro ao confirmar presença'
      }
      this.showConfirmModal = false
    } finally {
      this.isConfirming = false
    }
  }

  /**
   * @Function - handleCancelPresence
   * @description - Cancels presence for the team schedule
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleCancelPresence(): Promise<void> {
    try {
      this.isCancelling = true
      const response = await firstValueFrom(
        this.teamScheduleService.cancelPresence(this.token)
      )
      if (response.success && response.data) {
        this.schedule = response.data
        this.successMessage = 'Presença cancelada com sucesso'
        this.showCancelModal = false
        setTimeout(() => {
          this.successMessage = ''
        }, 5000)
      } else {
        this.error = 'Erro ao cancelar presença'
        this.showCancelModal = false
      }
    } catch (err: any) {
      if (err.status === 409) {
        this.error = 'Esta escala já foi confirmada ou cancelada'
      } else if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else {
        this.error = 'Erro ao cancelar presença'
      }
      this.showCancelModal = false
    } finally {
      this.isCancelling = false
    }
  }

  handleCloseConfirmModal(): void {
    this.showConfirmModal = false
  }

  handleCloseCancelModal(): void {
    this.showCancelModal = false
  }
}
