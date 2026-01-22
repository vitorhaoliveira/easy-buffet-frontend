import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, X } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { TeamScheduleService } from '@core/services/team-schedule.service'
import { TeamMemberService } from '@core/services/team-member.service'
import { EventService } from '@core/services/event.service'
import { ToastService } from '@core/services/toast.service'
import type { CreateTeamScheduleRequest, UpdateTeamScheduleRequest, TeamMember, Event } from '@shared/models/api.types'

@Component({
  selector: 'app-team-schedule-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    LabelComponent
  ],
  templateUrl: './team-schedule-form.component.html'
})
export class TeamScheduleFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly SaveIcon = Save
  readonly XIcon = X

  scheduleForm!: FormGroup
  isEditing: boolean = false
  eventId: string = ''
  scheduleId: string | null = null
  isLoading: boolean = false
  isLoadingData: boolean = false
  errorMessage: string = ''
  
  teamMembers: TeamMember[] = []
  event: Event | null = null

  constructor(
    private fb: FormBuilder,
    private teamScheduleService: TeamScheduleService,
    private teamMemberService: TeamMemberService,
    private eventService: EventService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.scheduleForm = this.fb.group({
      teamMemberId: ['', [Validators.required]],
      role: ['', [Validators.required, Validators.maxLength(100)]],
      arrivalTime: ['', [Validators.required, Validators.pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)]],
      notes: ['']
    })
  }

  async ngOnInit(): Promise<void> {
    this.eventId = this.route.snapshot.paramMap.get('eventId') || ''
    this.scheduleId = this.route.snapshot.paramMap.get('scheduleId')
    this.isEditing = !!this.scheduleId

    if (!this.eventId) {
      this.errorMessage = 'ID do evento não encontrado'
      return
    }

    await Promise.all([this.loadEvent(), this.loadTeamMembers()])

    if (this.isEditing && this.scheduleId) {
      await this.loadSchedule()
    }
  }

  async loadEvent(): Promise<void> {
    try {
      const response = await firstValueFrom(this.eventService.getEventById(this.eventId))
      if (response.success && response.data) {
        this.event = response.data
      }
    } catch (err: any) {
      console.error('Erro ao carregar evento:', err)
    }
  }

  async loadTeamMembers(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.teamMemberService.getTeamMembers({ limit: 1000 })
      )
      if (response.success && response.data) {
        this.teamMembers = response.data
      }
    } catch (err: any) {
      console.error('Erro ao carregar membros:', err)
    }
  }

  async loadSchedule(): Promise<void> {
    if (!this.scheduleId) return

    try {
      this.isLoadingData = true
      const response = await firstValueFrom(
        this.teamScheduleService.getTeamScheduleById(this.eventId, this.scheduleId)
      )
      if (response.success && response.data) {
        const schedule = response.data
        const arrivalDate = new Date(schedule.arrivalTime)
        const timeString = `${arrivalDate.getHours().toString().padStart(2, '0')}:${arrivalDate.getMinutes().toString().padStart(2, '0')}`
        
        this.scheduleForm.patchValue({
          teamMemberId: schedule.teamMemberId,
          role: schedule.role,
          arrivalTime: timeString,
          notes: schedule.notes || ''
        })
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao carregar escala'
    } finally {
      this.isLoadingData = false
    }
  }

  async handleSubmit(): Promise<void> {
    if (this.scheduleForm.invalid) {
      Object.keys(this.scheduleForm.controls).forEach(key => {
        this.scheduleForm.controls[key].markAsTouched()
      })
      return
    }

    this.isLoading = true
    this.errorMessage = ''

    try {
      const formValue = this.scheduleForm.value
      
      if (this.isEditing && this.scheduleId) {
        const updateData: UpdateTeamScheduleRequest = {
          role: formValue.role,
          arrivalTime: formValue.arrivalTime,
          notes: formValue.notes || undefined
        }
        
        const response = await firstValueFrom(
          this.teamScheduleService.updateTeamSchedule(this.eventId, this.scheduleId, updateData)
        )
        
        if (response.success) {
          this.toastService.success('Escala atualizada com sucesso')
          this.router.navigate(['/cadastros/eventos', this.eventId, 'equipe'])
        } else {
          this.errorMessage = 'Erro ao atualizar escala'
        }
      } else {
        const createData: CreateTeamScheduleRequest = {
          teamMemberId: formValue.teamMemberId,
          role: formValue.role,
          arrivalTime: formValue.arrivalTime,
          notes: formValue.notes || undefined
        }
        
        const response = await firstValueFrom(
          this.teamScheduleService.addTeamMemberToSchedule(this.eventId, createData)
        )
        
        if (response.success) {
          this.toastService.success('Membro adicionado à escala com sucesso')
          this.router.navigate(['/cadastros/eventos', this.eventId, 'equipe'])
        } else {
          this.errorMessage = 'Erro ao adicionar membro à escala'
        }
      }
    } catch (error: any) {
      if (error.error?.error?.message) {
        this.errorMessage = error.error.error.message
      } else if (error.error?.message) {
        this.errorMessage = error.error.message
      } else {
        this.errorMessage = error.message || 'Erro ao salvar escala'
      }
      this.toastService.error(this.errorMessage)
    } finally {
      this.isLoading = false
    }
  }

  handleCancel(): void {
    this.router.navigate(['/cadastros/eventos', this.eventId, 'equipe'])
  }

  getFieldError(fieldName: string): string {
    const field = this.scheduleForm.get(fieldName)
    if (!field || !field.errors || !field.touched) {
      return ''
    }

    if (field.errors['required']) {
      return 'Este campo é obrigatório'
    }
    if (field.errors['maxlength']) {
      return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`
    }
    if (field.errors['pattern']) {
      return 'Formato inválido. Use HH:MM (ex: 08:00)'
    }

    return 'Campo inválido'
  }

  hasError(fieldName: string): boolean {
    const field = this.scheduleForm.get(fieldName)
    return !!(field && field.invalid && field.touched)
  }
}
