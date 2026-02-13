import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, X } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { EventService } from '@core/services/event.service'
import { ClientService } from '@core/services/client.service'
import { PackageService } from '@core/services/package.service'
import { UnitService } from '@core/services/unit.service'
import type { Client, Package, Unit, CreateEventRequest, UpdateEventRequest, PaginationInfo } from '@shared/models/api.types'

@Component({
  selector: 'app-events-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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

  /** Clients: pagination + search in field */
  readonly clientsPageSize = 20
  clientsPage = 1
  clientsPagination: PaginationInfo | null = null
  clientSearchTerm = ''
  clientDropdownOpen = false
  isLoadingMoreClients = false

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
      eventEndTime: [''],
      guestCount: ['', [Validators.required, Validators.min(1)]],
      status: ['Pendente'],
      notes: ['']
    })
  }

  async ngOnInit(): Promise<void> {
    this.eventId = this.route.parent?.snapshot.paramMap.get('eventId') || this.route.snapshot.paramMap.get('id')
    this.isEditing = !!this.eventId

    await this.loadClientsAndPackages()

    if (this.isEditing && this.eventId) {
      await this.loadEvent(this.eventId)
    }

    this.isLoadingData = false
  }

  /** Whether this form is shown inside the event hub (visualizar/:eventId/dados) */
  get isInsideEventHub(): boolean {
    return !!this.route.parent?.snapshot.paramMap.get('eventId')
  }

  /**
   * @Function - loadClientsAndPackages
   * @description - Loads first page of clients (paginated), packages and units for the form
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadClientsAndPackages(): Promise<void> {
    try {
      this.clientsPage = 1
      const [clientsResponse, packagesResponse, unitsResponse] = await Promise.all([
        firstValueFrom(this.clientService.getClientsPaginated({ page: 1, limit: this.clientsPageSize })),
        firstValueFrom(this.packageService.getPackages()),
        firstValueFrom(this.unitService.getUnits(true))
      ])

      if (clientsResponse.success && clientsResponse.data) {
        this.clients = clientsResponse.data
        this.clientsPagination = clientsResponse.pagination ?? null
      } else {
        this.clients = []
        this.clientsPagination = null
      }

      if (packagesResponse.success && packagesResponse.data) {
        this.packages = packagesResponse.data
      }

      if (unitsResponse.success && unitsResponse.data) {
        this.units = unitsResponse.data
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao carregar dados'
      this.clients = []
      this.clientsPagination = null
    }
  }

  /**
   * @Function - loadMoreClients
   * @description - Loads next page of clients and appends to the list
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadMoreClients(): Promise<void> {
    if (this.isLoadingMoreClients || !this.clientsPagination || this.clientsPage >= this.clientsPagination.totalPages) return
    this.isLoadingMoreClients = true
    try {
      const nextPage = this.clientsPage + 1
      const res = await firstValueFrom(
        this.clientService.getClientsPaginated({ page: nextPage, limit: this.clientsPageSize })
      )
      if (res.success && res.data?.length) {
        this.clients = [...this.clients, ...res.data]
        this.clientsPage = nextPage
        this.clientsPagination = res.pagination ?? this.clientsPagination
      }
    } finally {
      this.isLoadingMoreClients = false
    }
  }

  /** Filtered clients for dropdown (by search term) */
  get filteredClients(): Client[] {
    if (!this.clientSearchTerm.trim()) return this.clients
    const q = this.clientSearchTerm.toLowerCase().trim()
    return this.clients.filter(c => (c.name || '').toLowerCase().includes(q))
  }

  getSelectedClientName(): string {
    const id = this.eventForm.get('clientId')?.value
    if (!id) return ''
    const c = this.clients.find(cl => cl.id === id)
    return c?.name ?? ''
  }

  selectClient(client: Client): void {
    this.eventForm.patchValue({ clientId: client.id })
    this.clientDropdownOpen = false
    this.clientSearchTerm = ''
  }

  closeClientDropdown(): void {
    this.clientDropdownOpen = false
  }

  async loadEvent(id: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.eventService.getEventById(id))
      if (response.success && response.data) {
        const event = response.data
        this.eventForm.patchValue({
          clientId: event.clientId,
          packageId: event.packageId || '',
          unitId: event.unitId || '',
          name: event.name,
          eventDate: event.eventDate.split('T')[0],
          eventTime: this.formatTimeToString(event.eventTime),
          eventEndTime: event.eventEndTime ? this.formatTimeToString(event.eventEndTime) : '',
          guestCount: event.guestCount,
          status: event.status,
          notes: event.notes || ''
        })
        const client = (event as any).client
        if (client && !this.clients.some(c => c.id === event.clientId)) {
          this.clients = [client as Client, ...this.clients]
        }
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
      const eventEndTimeStr = formValue.eventEndTime ? this.formatTimeToString(formValue.eventEndTime) : null
      const baseData = {
        clientId: formValue.clientId,
        ...(formValue.packageId ? { packageId: formValue.packageId } : {}),
        unitId: formValue.unitId || undefined,
        name: formValue.name,
        eventDate: formValue.eventDate,
        eventTime: this.formatTimeToString(formValue.eventTime),
        guestCount: Number(formValue.guestCount),
        status: formValue.status,
        notes: formValue.notes || undefined
      }

      let response
      if (this.isEditing && this.eventId) {
        const updateData: UpdateEventRequest = { ...baseData, eventEndTime: eventEndTimeStr }
        response = await firstValueFrom(this.eventService.updateEvent(this.eventId, updateData))
      } else {
        const createData: CreateEventRequest = {
          ...baseData,
          ...(eventEndTimeStr ? { eventEndTime: eventEndTimeStr } : {})
        }
        response = await firstValueFrom(this.eventService.createEvent(createData))
      }

      if (response.success) {
        if (this.isInsideEventHub && this.eventId) {
          this.router.navigate(['/cadastros/eventos/visualizar', this.eventId, 'dados'])
        } else if (response.data?.id) {
          this.router.navigate(['/cadastros/eventos/visualizar', response.data.id, 'dados'])
        } else {
          this.router.navigate(['/cadastros/eventos'])
        }
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
    if (this.isInsideEventHub && this.eventId) {
      this.router.navigate(['/cadastros/eventos/visualizar', this.eventId, 'dados'])
    } else {
      this.router.navigate(['/cadastros/eventos'])
    }
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
