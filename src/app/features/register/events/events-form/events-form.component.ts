import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, X } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { EventService } from '@core/services/event.service'
import { ClientService } from '@core/services/client.service'
import { PackageService } from '@core/services/package.service'
import { UnitService } from '@core/services/unit.service'
import type { Client, Package, Unit, CreateEventRequest, UpdateEventRequest } from '@shared/models/api.types'

@Component({
  selector: 'app-events-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    LabelComponent
  ],
  templateUrl: './events-form.component.html'
})
export class EventsFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly SaveIcon = Save
  readonly XIcon = X

  eventForm!: FormGroup
  clients: Client[] = []
  packages: Package[] = []
  units: Unit[] = []
  isEditing: boolean = false
  eventId: string | null = null
  isLoading: boolean = false
  isLoadingData: boolean = true
  errorMessage: string = ''

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private clientService: ClientService,
    private packageService: PackageService,
    private unitService: UnitService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.eventForm = this.fb.group({
      clientId: ['', [Validators.required]],
      packageId: [''],
      unitId: [''],
      name: ['', [Validators.required]],
      eventDate: ['', [Validators.required]],
      eventTime: ['', [Validators.required]],
      location: ['', [Validators.required]],
      guestCount: ['', [Validators.required, Validators.min(1)]],
      status: ['Pendente'],
      notes: ['']
    })
  }

  async ngOnInit(): Promise<void> {
    this.eventId = this.route.snapshot.paramMap.get('id')
    this.isEditing = !!this.eventId

    await this.loadClientsAndPackages()

    if (this.isEditing && this.eventId) {
      await this.loadEvent(this.eventId)
    }
    
    this.isLoadingData = false
  }

  async loadClientsAndPackages(): Promise<void> {
    try {
      const [clientsResponse, packagesResponse, unitsResponse] = await Promise.all([
        firstValueFrom(this.clientService.getClients()),
        firstValueFrom(this.packageService.getPackages()),
        firstValueFrom(this.unitService.getUnits(true))
      ])

      if (clientsResponse.success && clientsResponse.data) {
        this.clients = clientsResponse.data as Client[]
      }

      if (packagesResponse.success && packagesResponse.data) {
        this.packages = packagesResponse.data
      }

      if (unitsResponse.success && unitsResponse.data) {
        this.units = unitsResponse.data
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao carregar dados'
    }
  }

  async loadEvent(id: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.eventService.getEventById(id))
      if (response.success && response.data) {
        const event = response.data
        this.eventForm.patchValue({
          clientId: event.clientId,
          packageId: event.packageId,
          unitId: event.unitId || '',
          name: event.name,
          eventDate: event.eventDate.split('T')[0],
          eventTime: this.formatTimeToString(event.eventTime),
          location: event.location,
          guestCount: event.guestCount,
          status: event.status,
          notes: event.notes || ''
        })
      } else {
        this.errorMessage = 'Erro ao carregar evento'
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao carregar evento'
    }
  }

  formatTimeToString(time: any): string {
    if (!time) return ''
    if (typeof time === 'string') {
      if (time.match(/^\d{2}:\d{2}$/)) return time
      if (time.includes('T')) {
        const date = new Date(time)
        return date.toTimeString().slice(0, 5)
      }
      return time
    }
    if (time instanceof Date) {
      return time.toTimeString().slice(0, 5)
    }
    return String(time)
  }

  async handleSubmit(): Promise<void> {
    if (this.eventForm.invalid) {
      Object.keys(this.eventForm.controls).forEach(key => {
        this.eventForm.controls[key].markAsTouched()
      })
      return
    }

    this.isLoading = true
    this.errorMessage = ''

    try {
      const formValue = this.eventForm.value
      const eventData = {
        clientId: formValue.clientId,
        packageId: formValue.packageId || undefined,
        unitId: formValue.unitId || undefined,
        name: formValue.name,
        eventDate: formValue.eventDate,
        eventTime: this.formatTimeToString(formValue.eventTime),
        location: formValue.location,
        guestCount: Number(formValue.guestCount),
        status: formValue.status,
        notes: formValue.notes || undefined
      }

      let response
      if (this.isEditing && this.eventId) {
        const updateData: UpdateEventRequest = eventData
        response = await firstValueFrom(this.eventService.updateEvent(this.eventId, updateData))
      } else {
        const createData: CreateEventRequest = eventData
        response = await firstValueFrom(this.eventService.createEvent(createData))
      }

      if (response.success) {
        this.router.navigate(['/cadastros/eventos'])
      } else {
        this.errorMessage = 'Erro ao salvar evento'
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao salvar evento'
    } finally {
      this.isLoading = false
    }
  }

  handleCancel(): void {
    this.router.navigate(['/cadastros/eventos'])
  }

  hasError(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }

  getFieldError(fieldName: string): string {
    const field = this.eventForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      return 'Campo obrigatório'
    }
    if (field?.hasError('min') && field.touched) {
      return 'Valor deve ser maior que zero'
    }
    return ''
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }
}

