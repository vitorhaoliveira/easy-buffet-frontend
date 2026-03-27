import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, X, Lock, Unlock } from 'lucide-angular'
import { firstValueFrom, Subject, takeUntil, filter } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'
import { EventService } from '@core/services/event.service'
import { ContractService } from '@core/services/contract.service'
import { ToastService } from '@core/services/toast.service'
import { EventHubRefreshService } from '@core/services/event-hub-refresh.service'
import { ClientService } from '@core/services/client.service'
import { PackageService } from '@core/services/package.service'
import { UnitService } from '@core/services/unit.service'
import type {
  Client,
  Package,
  Unit,
  Contract,
  CreateEventRequest,
  UpdateEventRequest,
  PaginationInfo,
  Event,
  EventHubData
} from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-events-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    LabelComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './events-form.component.html'
})
export class EventsFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly SaveIcon = Save
  readonly XIcon = X
  readonly LockIcon = Lock
  readonly UnlockIcon = Unlock

  eventForm!: FormGroup
  /** Contract linked to this event (hub Dados tab only) */
  hubContract: Contract | null = null
  isLoadingHubContract = false
  isClosingHubContract = false
  isOpeningHubContract = false
  /** Which hub action the confirmation modal is showing */
  hubConfirmAction: 'close' | 'reopen' | null = null
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

  private readonly destroy$ = new Subject<void>()

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private contractService: ContractService,
    private toastService: ToastService,
    private eventHubRefresh: EventHubRefreshService,
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

    if (this.isEditing && this.eventId && this.isInsideEventHub) {
      this.route.parent?.data.pipe(takeUntil(this.destroy$)).subscribe((d) => {
        const hub = d['eventHub'] as EventHubData | null
        if (hub) {
          this.applyHubData(hub)
        } else {
          void this.loadHubFallback()
        }
        this.isLoadingData = false
      })
      this.eventHubRefresh.refresh$
        .pipe(
          takeUntil(this.destroy$),
          filter((id) => id === this.eventId && this.isInsideEventHub)
        )
        .subscribe(() => {
          void this.refreshHubFromApi()
        })
      return
    }

    await this.loadClientsAndPackages()

    if (this.isEditing && this.eventId) {
      await this.loadEvent(this.eventId)
    }

    this.isLoadingData = false
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  /** Whether this form is shown inside the event hub (visualizar/:eventId/dados) */
  get isInsideEventHub(): boolean {
    return !!this.route.parent?.snapshot.paramMap.get('eventId')
  }

  /**
   * @Function - applyEventToForm
   * @description - Patches the form from an Event (shared by hub payload and GET /events/:id)
   * @param - event: Event
   * @returns - void
   */
  private applyEventToForm(event: Event): void {
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
    const client = (event as { client?: Client }).client
    if (client && !this.clients.some((c) => c.id === event.clientId)) {
      this.clients = [client, ...this.clients]
    }
  }

  /**
   * @Function - applyHubData
   * @description - Applies GET /events/:id/hub payload (event, reference lists, contract summary)
   * @param - data: EventHubData
   * @param - opts: { mergeReference?: boolean } - When true, keep existing packages/units/clients (e.g. after refresh without lists)
   * @returns - void
   */
  private applyHubData(data: EventHubData, opts?: { mergeReference?: boolean }): void {
    const mergeReference = opts?.mergeReference ?? false
    this.applyEventToForm(data.event)
    if (data.reference && !mergeReference) {
      this.packages = data.reference.packages
      this.units = data.reference.units
      this.clients = data.reference.clients.items
      this.clientsPagination = data.reference.clients.pagination
      this.clientsPage = 1
    }
    if (data.contract !== undefined) {
      this.hubContract = data.contract as Contract | null
    } else if (!mergeReference) {
      void this.loadHubContract()
    }
  }

  /**
   * @Function - loadHubFallback
   * @description - Legacy path when hub resolver returns null (API down or old backend)
   * @returns - Promise<void>
   */
  private async loadHubFallback(): Promise<void> {
    await this.loadClientsAndPackages()
    if (this.eventId) {
      await this.loadEvent(this.eventId)
    }
    await this.loadHubContract()
  }

  /**
   * @Function - refreshHubFromApi
   * @description - Reloads hub payload without reference lists (header refresh / after close contract errors)
   * @returns - Promise<void>
   */
  private async refreshHubFromApi(): Promise<void> {
    if (!this.eventId || !this.isInsideEventHub) return
    try {
      const res = await firstValueFrom(
        this.eventService.getEventHub(this.eventId, { includeReferenceLists: false })
      )
      if (res.success && res.data) {
        this.applyHubData(res.data, { mergeReference: true })
      }
    } catch {
      await this.loadHubContract()
    }
  }

  /**
   * @Function - loadHubContract
   * @description - Loads payment/contract record for this event (close-reopen UI on Dados tab)
   * @returns - Promise<void>
   */
  async loadHubContract(): Promise<void> {
    if (!this.eventId) return
    this.isLoadingHubContract = true
    try {
      const res = await firstValueFrom(
        this.contractService.getContractsPaginated({ eventId: this.eventId, page: 1, limit: 1 })
      )
      if (res.success && res.data?.length) {
        this.hubContract = res.data[0] as Contract
      } else {
        this.hubContract = null
      }
    } catch {
      this.hubContract = null
    } finally {
      this.isLoadingHubContract = false
    }
  }

  /**
   * @Function - isHubContractClosed
   * @description - Whether the event is financially closed (closedAt on linked contract)
   * @returns - boolean
   */
  isHubContractClosed(): boolean {
    return !!this.hubContract?.closedAt
  }

  /**
   * @Function - formatHubContractClosedDate
   * @description - Formats closed date for the hub situation card
   * @returns - string
   */
  formatHubContractClosedDate(): string {
    if (!this.hubContract?.closedAt) return ''
    return formatDateBR(this.hubContract.closedAt)
  }

  /**
   * @Function - openCloseHubModal
   * @description - Opens project confirmation modal before closing the event financially
   * @returns - void
   */
  openCloseHubModal(): void {
    if (!this.hubContract?.id) return
    this.errorMessage = ''
    this.hubConfirmAction = 'close'
  }

  /**
   * @Function - openReopenHubModal
   * @description - Opens project confirmation modal before reopening the event
   * @returns - void
   */
  openReopenHubModal(): void {
    if (!this.hubContract?.id) return
    this.errorMessage = ''
    this.hubConfirmAction = 'reopen'
  }

  /**
   * @Function - closeHubConfirmModal
   * @description - Dismisses hub close/reopen confirmation without acting
   * @returns - void
   */
  closeHubConfirmModal(): void {
    if (this.isClosingHubContract || this.isOpeningHubContract) return
    this.hubConfirmAction = null
  }

  /**
   * @Function - confirmHubAction
   * @description - Runs close or reopen after user confirms in the modal
   * @returns - Promise<void>
   */
  async confirmHubAction(): Promise<void> {
    if (this.hubConfirmAction === 'close') {
      await this.executeCloseHubEvent()
    } else if (this.hubConfirmAction === 'reopen') {
      await this.executeReopenHubEvent()
    }
  }

  /**
   * @Function - executeCloseHubEvent
   * @description - API call to close the event financially
   * @returns - Promise<void>
   */
  private async executeCloseHubEvent(): Promise<void> {
    if (!this.hubContract?.id) return
    try {
      this.isClosingHubContract = true
      this.errorMessage = ''
      const response = await firstValueFrom(this.contractService.closeContract(this.hubContract.id))
      if (response.success && response.data) {
        this.hubContract = response.data
        this.toastService.success('Evento fechado com sucesso')
        this.hubConfirmAction = null
      } else {
        const msg = response.message || 'Erro ao fechar evento'
        this.errorMessage = msg
        this.toastService.error(msg)
        this.hubConfirmAction = null
      }
    } catch (err: unknown) {
      await this.handleHubContractActionError(err, 'close')
    } finally {
      this.isClosingHubContract = false
    }
  }

  /**
   * @Function - executeReopenHubEvent
   * @description - API call to reopen the event financially
   * @returns - Promise<void>
   */
  private async executeReopenHubEvent(): Promise<void> {
    if (!this.hubContract?.id) return
    try {
      this.isOpeningHubContract = true
      this.errorMessage = ''
      const response = await firstValueFrom(this.contractService.openContract(this.hubContract.id))
      if (response.success && response.data) {
        this.hubContract = response.data
        this.toastService.success('Evento reaberto com sucesso')
        this.hubConfirmAction = null
      } else {
        const msg = response.message || 'Erro ao reabrir evento'
        this.errorMessage = msg
        this.toastService.error(msg)
        this.hubConfirmAction = null
      }
    } catch (err: unknown) {
      await this.handleHubContractActionError(err, 'reopen')
    } finally {
      this.isOpeningHubContract = false
    }
  }

  /**
   * @Function - handleHubContractActionError
   * @description - Maps 422 codes (CONTRACT_ALREADY_CLOSED / CONTRACT_ALREADY_OPEN) and refreshes hub contract state
   * @param - err: unknown
   * @param - action: 'close' | 'reopen'
   * @returns - Promise<void>
   */
  private async handleHubContractActionError(err: unknown, action: 'close' | 'reopen'): Promise<void> {
    const code = this.extractHubContractHttpErrorCode(err)
    if (code === 'CONTRACT_ALREADY_CLOSED' || code === 'CONTRACT_ALREADY_OPEN') {
      if (this.isInsideEventHub) {
        await this.refreshHubFromApi()
      } else {
        await this.loadHubContract()
      }
    }
    const msg = this.getHubContractActionUserMessage(err, action)
    this.errorMessage = msg
    this.toastService.error(msg)
    this.hubConfirmAction = null
  }

  /**
   * @Function - extractHubContractHttpErrorCode
   * @description - Reads API error code from HttpClient error body
   * @param - err: unknown
   * @returns - string | undefined
   */
  private extractHubContractHttpErrorCode(err: unknown): string | undefined {
    const e = err as { error?: { error?: { code?: string }; code?: string } }
    return e.error?.error?.code ?? e.error?.code
  }

  /**
   * @Function - getHubContractActionUserMessage
   * @description - User-facing message for close/reopen failures (422 codes or backend message)
   * @param - err: unknown
   * @param - action: 'close' | 'reopen'
   * @returns - string
   */
  private getHubContractActionUserMessage(err: unknown, action: 'close' | 'reopen'): string {
    const code = this.extractHubContractHttpErrorCode(err)
    if (code === 'CONTRACT_ALREADY_CLOSED') {
      return 'Este evento já está fechado.'
    }
    if (code === 'CONTRACT_ALREADY_OPEN') {
      return 'Este evento já está aberto (não estava fechado).'
    }
    const e = err as { error?: { error?: { message?: string }; message?: string }; message?: string }
    const fallback = action === 'close' ? 'Erro ao fechar evento' : 'Erro ao reabrir evento'
    return e.error?.error?.message || e.error?.message || e.message || fallback
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
        this.applyEventToForm(response.data)
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
        this.toastService.success(
          this.isEditing && this.eventId
            ? 'Evento atualizado com sucesso'
            : 'Evento criado com sucesso'
        )
        if (this.isInsideEventHub && this.eventId) {
          this.eventHubRefresh.notifyEventUpdated(this.eventId)
          this.router.navigate(['/cadastros/eventos/visualizar', this.eventId, 'dados'])
        } else if (response.data?.id) {
          this.router.navigate(['/cadastros/eventos/visualizar', response.data.id, 'dados'])
        } else {
          this.router.navigate(['/cadastros/eventos'])
        }
      } else {
        const msg = response.message || 'Erro ao salvar evento'
        this.errorMessage = msg
        this.toastService.error(msg)
      }
    } catch (err: any) {
      const msg = err.message || 'Erro ao salvar evento'
      this.errorMessage = msg
      this.toastService.error(msg)
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
