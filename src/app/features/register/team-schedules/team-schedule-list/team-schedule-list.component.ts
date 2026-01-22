import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute, RouterModule } from '@angular/router'
import { LucideAngularModule, Plus, Edit, Trash2, Send, Calendar, Users, ArrowLeft } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'
import { MobileCardComponent } from '@shared/components/ui/mobile-card/mobile-card.component'
import { SkeletonComponent } from '@shared/components/ui/skeleton/skeleton.component'
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component'
import { TeamScheduleService } from '@core/services/team-schedule.service'
import { EventService } from '@core/services/event.service'
import { ToastService } from '@core/services/toast.service'
import type { TeamSchedule, Event, ConfirmationStatus } from '@shared/models/api.types'
import { formatDateBR, formatTime as formatTimeUtil } from '@shared/utils/date.utils'

@Component({
  selector: 'app-team-schedule-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    ConfirmationModalComponent,
    MobileCardComponent,
    SkeletonComponent,
    EmptyStateComponent
  ],
  templateUrl: './team-schedule-list.component.html'
})
export class TeamScheduleListComponent implements OnInit {
  readonly PlusIcon = Plus
  readonly EditIcon = Edit
  readonly Trash2Icon = Trash2
  readonly SendIcon = Send
  readonly CalendarIcon = Calendar
  readonly UsersIcon = Users
  readonly ArrowLeftIcon = ArrowLeft

  schedules: TeamSchedule[] = []
  event: Event | null = null
  eventId: string = ''
  isLoading: boolean = true
  error: string = ''
  showDeleteModal: boolean = false
  scheduleToDelete: TeamSchedule | null = null
  isDeleting: boolean = false
  sendingConfirmationId: string | null = null
  showSendConfirmationModal: boolean = false
  scheduleToSend: TeamSchedule | null = null
  isSending: boolean = false

  constructor(
    private teamScheduleService: TeamScheduleService,
    private eventService: EventService,
    private toastService: ToastService,
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
    
    await this.loadData()
  }

  async loadData(): Promise<void> {
    this.isLoading = true
    this.error = ''
    
    // Timeout de segurança - sempre finalizar loading após 10 segundos
    const timeoutId = setTimeout(() => {
      if (this.isLoading) {
        console.warn('Timeout ao carregar dados, finalizando loading')
        this.isLoading = false
        if (!this.error) {
          this.error = 'Tempo de carregamento excedido. Tente novamente.'
        }
      }
    }, 10000)
    
    try {
      // Carregar evento e escalas em paralelo, mas independentemente
      const eventPromise = this.loadEvent().catch(err => {
        console.error('Erro ao carregar evento:', err)
      })
      
      const schedulesPromise = this.loadSchedules().catch(err => {
        console.error('Erro ao carregar escalas:', err)
        if (!this.error) {
          this.error = err.error?.message || err.message || 'Erro ao carregar escalas'
        }
      })
      
      // Usar allSettled para garantir que ambas as promises sejam resolvidas/rejeitadas
      await Promise.allSettled([eventPromise, schedulesPromise])
    } catch (err: any) {
      console.error('Erro inesperado em loadData:', err)
      if (!this.error) {
        this.error = 'Erro ao carregar dados do evento'
      }
    } finally {
      clearTimeout(timeoutId)
      // Sempre finalizar o loading
      this.isLoading = false
    }
  }

  async loadEvent(): Promise<void> {
    const response = await firstValueFrom(this.eventService.getEventById(this.eventId))
    if (response.success && response.data) {
      this.event = response.data
    }
  }

  async loadSchedules(): Promise<void> {
    const response = await firstValueFrom(
      this.teamScheduleService.getEventTeamSchedules(this.eventId)
    )
    if (response.success && response.data) {
      this.schedules = response.data || []
    } else {
      this.error = response.message || 'Erro ao carregar escalas'
      this.schedules = []
    }
  }

  getStatusBadgeClass(status: ConfirmationStatus): string {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      case 'pendente':
      default:
        return 'bg-yellow-100 text-yellow-800'
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

  /**
   * @Function - handleDeleteClick
   * @description - Initiates the delete process by opening the confirmation modal
   * @author - Vitor Hugo
   * @param - schedule: TeamSchedule - The schedule to be deleted
   * @returns - void
   */
  handleDeleteClick(schedule: TeamSchedule): void {
    this.scheduleToDelete = schedule
    this.showDeleteModal = true
    this.error = ''
  }

  /**
   * @Function - handleConfirmDelete
   * @description - Handles the confirmation of schedule deletion
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmDelete(): Promise<void> {
    if (!this.scheduleToDelete) return

    try {
      this.isDeleting = true
      const response = await firstValueFrom(
        this.teamScheduleService.removeTeamMemberFromSchedule(
          this.eventId,
          this.scheduleToDelete.id
        )
      )
      if (response.success) {
        this.showDeleteModal = false
        this.scheduleToDelete = null
        this.toastService.success('Membro removido da escala com sucesso')
        // Recarregar sem mostrar loading
        await this.loadSchedules().catch(err => {
          console.error('Erro ao recarregar escalas:', err)
        })
      } else {
        this.error = response.message || 'Erro ao remover membro da escala'
        this.showDeleteModal = false
        this.scheduleToDelete = null
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else {
        this.error = 'Erro ao remover membro da escala'
      }
      this.showDeleteModal = false
      this.scheduleToDelete = null
    } finally {
      this.isDeleting = false
    }
  }

  handleCancelDelete(): void {
    this.showDeleteModal = false
    this.scheduleToDelete = null
  }

  /**
   * @Function - normalizeWhatsAppUrl
   * @description - Normalizes WhatsApp URL to ensure country code (55) is present
   * @author - Vitor Hugo
   * @param - url: string - The WhatsApp URL to normalize
   * @returns - string - Normalized WhatsApp URL with country code
   */
  private normalizeWhatsAppUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const phoneNumber = pathParts[pathParts.length - 1]
      
      // Remove non-numeric characters
      const cleanNumber = phoneNumber.replace(/\D/g, '')
      
      // If number doesn't start with 55 (Brazil), add it
      if (cleanNumber.length > 0 && !cleanNumber.startsWith('55')) {
        // If starts with 0, remove it and add 55
        const normalizedNumber = cleanNumber.startsWith('0') 
          ? `55${cleanNumber.substring(1)}` 
          : `55${cleanNumber}`
        return `https://wa.me/${normalizedNumber}${urlObj.search}`
      }
      
      return url
    } catch {
      // If URL parsing fails, try to extract number from URL string
      const match = url.match(/wa\.me\/(\d+)/)
      if (match && match[1]) {
        const phoneNumber = match[1].replace(/\D/g, '')
        if (!phoneNumber.startsWith('55')) {
          const normalizedNumber = phoneNumber.startsWith('0')
            ? `55${phoneNumber.substring(1)}`
            : `55${phoneNumber}`
          return url.replace(/wa\.me\/\d+/, `wa.me/${normalizedNumber}`)
        }
      }
      return url
    }
  }

  /**
   * @Function - handleSendConfirmationClick
   * @description - Opens confirmation modal before sending link
   * @author - Vitor Hugo
   * @param - schedule: TeamSchedule - The schedule to send confirmation for
   * @returns - void
   */
  handleSendConfirmationClick(schedule: TeamSchedule): void {
    this.scheduleToSend = schedule
    this.showSendConfirmationModal = true
    this.error = ''
  }

  /**
   * @Function - handleCancelSendConfirmation
   * @description - Closes the send confirmation modal
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancelSendConfirmation(): void {
    this.showSendConfirmationModal = false
    this.scheduleToSend = null
  }

  /**
   * @Function - handleSendConfirmation
   * @description - Sends confirmation link to a team member and opens WhatsApp
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleSendConfirmation(): Promise<void> {
    if (!this.scheduleToSend) return

    try {
      this.isSending = true
      this.sendingConfirmationId = this.scheduleToSend.id
      const response = await firstValueFrom(
        this.teamScheduleService.sendConfirmationLink(this.eventId, this.scheduleToSend.id)
      )
      if (response.success && response.data) {
        this.toastService.success('Link de confirmação gerado com sucesso')
        this.showSendConfirmationModal = false
        
        // Normalize and open WhatsApp URL if available
        if (response.data.whatsappUrl) {
          const normalizedUrl = this.normalizeWhatsAppUrl(response.data.whatsappUrl)
          window.open(normalizedUrl, '_blank')
        }
        
        // Recarregar sem mostrar loading
        await this.loadSchedules().catch(err => {
          console.error('Erro ao recarregar escalas:', err)
        })
      } else {
        this.toastService.error('Erro ao gerar link de confirmação')
        this.showSendConfirmationModal = false
      }
    } catch (err: any) {
      this.toastService.error(err.message || 'Erro ao gerar link de confirmação')
      this.showSendConfirmationModal = false
    } finally {
      this.sendingConfirmationId = null
      this.scheduleToSend = null
      this.isSending = false
    }
  }

  goToDayView(): void {
    this.router.navigate(['/cadastros/eventos', this.eventId, 'equipe', 'dia'])
  }

  goBack(): void {
    this.router.navigate(['/cadastros/eventos'])
  }
}
