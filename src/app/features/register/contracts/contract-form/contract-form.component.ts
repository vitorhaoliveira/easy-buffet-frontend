import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, X, FileText } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { ContractService } from '@core/services/contract.service'
import { ToastService } from '@core/services/toast.service'
import { QuoteService } from '@core/services/quote.service'
import { EventService, GetEventsParams } from '@core/services/event.service'
import { ClientService, GetClientsParams } from '@core/services/client.service'
import { SellerService } from '@core/services/seller.service'
import type { Event, Client, Seller, CreateContractRequest, UpdateContractRequest, QuoteItem, PaginationInfo } from '@shared/models/api.types'

@Component({
  selector: 'app-contract-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    LabelComponent
  ],
  templateUrl: './contract-form.component.html'
})
export class ContractFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly SaveIcon = Save
  readonly XIcon = X
  readonly FileTextIcon = FileText

  contractForm!: FormGroup
  events: Event[] = []
  clients: Client[] = []
  sellers: Seller[] = []
  isEditing: boolean = false
  contractId: string | null = null
  quoteIdFromConversion: string | null = null
  quoteItemsFromConversion: QuoteItem[] = []
  isLoading: boolean = false
  isLoadingData: boolean = true
  errorMessage: string = ''
  /** When editing, minimum installment count allowed (number of already paid installments) */
  paidInstallmentsCount: number = 0

  /** Events: pagination + search in field */
  readonly eventsPageSize = 20
  eventsPage = 1
  eventsPagination: PaginationInfo | null = null
  eventSearchTerm = ''
  eventDropdownOpen = false
  isLoadingMoreEvents = false

  /** Clients: pagination + search in field */
  readonly clientsPageSize = 20
  clientsPage = 1
  clientsPagination: PaginationInfo | null = null
  clientSearchTerm = ''
  clientDropdownOpen = false
  isLoadingMoreClients = false

  constructor(
    private fb: FormBuilder,
    private contractService: ContractService,
    private quoteService: QuoteService,
    private eventService: EventService,
    private clientService: ClientService,
    private sellerService: SellerService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.contractForm = this.fb.group({
      eventId: ['', [Validators.required]],
      clientId: ['', [Validators.required]],
      sellerId: [''],
      totalAmount: ['', [Validators.required, Validators.min(0)]],
      entrada: [null as number | null, [Validators.min(0)]],
      installmentCount: ['', [Validators.required, Validators.min(1)]],
      firstDueDate: ['', [Validators.required]],
      periodicity: ['Mensal'],
      notes: [''],
      status: ['Pendente'],
      signedAt: ['']
    })
  }

  async ngOnInit(): Promise<void> {
    this.contractId = this.route.snapshot.paramMap.get('id')
    this.isEditing = !!this.contractId
    const fromQuoteId = this.route.snapshot.queryParamMap.get('fromQuote')

    await this.loadData()

    if (this.isEditing && this.contractId) {
      await this.loadContract(this.contractId)
    } else if (fromQuoteId) {
      await this.prefillFromQuote(fromQuoteId)
    }

    this.isLoadingData = false
  }

  /**
   * Pre-fill contract form from an accepted quote (convert orçamento em contrato)
   */
  async prefillFromQuote(quoteId: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.quoteService.getQuoteById(quoteId))
      if (!response.success || !response.data) return
      const quote = response.data
      const clientId = quote.clientId ?? quote.client?.id
      if (quote.status !== 'Aceito' || !clientId) return
      this.quoteIdFromConversion = quoteId
      this.quoteItemsFromConversion = quote.items?.length ? [...quote.items] : []
      const eventId = quote.eventId ?? (quote as any).event?.id ?? ''
      this.contractForm.patchValue({
        eventId,
        clientId,
        totalAmount: quote.totalAmount
      })
      if ((quote as any).event && !this.events.some(e => e.id === eventId)) {
        this.events = [(quote as any).event as Event, ...this.events]
      }
      if ((quote as any).client && !this.clients.some(c => c.id === clientId)) {
        this.clients = [(quote as any).client as Client, ...this.clients]
      }
    } catch {
      this.errorMessage = 'Erro ao carregar orçamento para conversão'
    }
  }

  /**
   * @Function - loadData
   * @description - Loads first page of events, first page of clients, and sellers for the form
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadData(): Promise<void> {
    try {
      this.eventsPage = 1
      this.clientsPage = 1
      const [eventsResponse, clientsResponse, sellersResponse] = await Promise.all([
        firstValueFrom(this.eventService.getEventsPaginated({ page: 1, limit: this.eventsPageSize })),
        firstValueFrom(this.clientService.getClientsPaginated({ page: 1, limit: this.clientsPageSize })),
        firstValueFrom(this.sellerService.getSellers())
      ])

      if (eventsResponse.success && eventsResponse.data) {
        this.events = eventsResponse.data
        this.eventsPagination = eventsResponse.pagination ?? null
      } else {
        this.events = []
        this.eventsPagination = null
      }

      if (clientsResponse.success && clientsResponse.data) {
        this.clients = clientsResponse.data
        this.clientsPagination = clientsResponse.pagination ?? null
      } else {
        this.clients = []
        this.clientsPagination = null
      }

      if (sellersResponse.success && sellersResponse.data) {
        this.sellers = Array.isArray(sellersResponse.data)
          ? sellersResponse.data
          : (sellersResponse.data as any).data || []
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao carregar dados'
      this.events = []
      this.clients = []
      this.eventsPagination = null
      this.clientsPagination = null
    }
  }

  /**
   * @Function - loadMoreEvents
   * @description - Loads next page of events and appends to the list
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadMoreEvents(): Promise<void> {
    if (this.isLoadingMoreEvents || !this.eventsPagination || this.eventsPage >= this.eventsPagination.totalPages) return
    this.isLoadingMoreEvents = true
    try {
      const nextPage = this.eventsPage + 1
      const res = await firstValueFrom(
        this.eventService.getEventsPaginated({ page: nextPage, limit: this.eventsPageSize })
      )
      if (res.success && res.data?.length) {
        this.events = [...this.events, ...res.data]
        this.eventsPage = nextPage
        this.eventsPagination = res.pagination ?? this.eventsPagination
      }
    } finally {
      this.isLoadingMoreEvents = false
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

  /** Filtered events for dropdown (by search term) */
  get filteredEvents(): Event[] {
    if (!this.eventSearchTerm.trim()) return this.events
    const q = this.eventSearchTerm.toLowerCase().trim()
    return this.events.filter(e => e.name.toLowerCase().includes(q))
  }

  /** Filtered clients for dropdown (by search term) */
  get filteredClients(): Client[] {
    if (!this.clientSearchTerm.trim()) return this.clients
    const q = this.clientSearchTerm.toLowerCase().trim()
    return this.clients.filter(c => (c.name || '').toLowerCase().includes(q))
  }

  getSelectedEventName(): string {
    const id = this.contractForm.get('eventId')?.value
    if (!id) return ''
    const e = this.events.find(ev => ev.id === id)
    return e?.name ?? ''
  }

  getSelectedClientName(): string {
    const id = this.contractForm.get('clientId')?.value
    if (!id) return ''
    const c = this.clients.find(cl => cl.id === id)
    return c?.name ?? ''
  }

  /** Whether to show entrada in summary (optional field with value > 0) */
  get showEntradaInSummary(): boolean {
    const v = this.contractForm.get('entrada')?.value
    return v != null && v !== '' && Number(v) > 0
  }

  get entradaSummaryValue(): number {
    return Number(this.contractForm.get('entrada')?.value) || 0
  }

  selectEvent(event: Event): void {
    this.contractForm.patchValue({ eventId: event.id })
    this.eventDropdownOpen = false
    this.eventSearchTerm = ''
  }

  selectClient(client: Client): void {
    this.contractForm.patchValue({ clientId: client.id })
    this.clientDropdownOpen = false
    this.clientSearchTerm = ''
  }

  closeEventDropdown(): void {
    this.eventDropdownOpen = false
  }

  closeClientDropdown(): void {
    this.clientDropdownOpen = false
  }

  /**
   * @Function - loadContract
   * @description - Loads contract data for editing, including installments to enforce min installment count
   * @author - Vitor Hugo
   * @param - id: string - Contract ID
   * @returns - Promise<void>
   */
  async loadContract(id: string): Promise<void> {
    try {
      const [contractResponse, installmentsResponse] = await Promise.all([
        firstValueFrom(this.contractService.getContractById(id)),
        firstValueFrom(this.contractService.getContractInstallments(id))
      ])
      if (contractResponse.success && contractResponse.data) {
        const contract = contractResponse.data
        this.contractForm.patchValue({
          eventId: contract.eventId,
          clientId: contract.clientId,
          sellerId: contract.sellerId || '',
          totalAmount: contract.totalAmount,
          entrada: (contract as any).entrada ?? null,
          installmentCount: contract.installmentCount,
          firstDueDate: contract.firstDueDate.split('T')[0],
          periodicity: contract.periodicity,
          notes: contract.notes || '',
          status: contract.status,
          signedAt: contract.signedAt || ''
        })
        if (contract.event && !this.events.some(e => e.id === contract.eventId)) {
          this.events = [contract.event as Event, ...this.events]
        }
        if (contract.client && !this.clients.some(c => c.id === contract.clientId)) {
          this.clients = [contract.client as Client, ...this.clients]
        }
        if (installmentsResponse.success && Array.isArray(installmentsResponse.data)) {
          this.paidInstallmentsCount = installmentsResponse.data.filter(
            i => (i.status?.toLowerCase() === 'paid' || i.status?.toLowerCase() === 'pago')
          ).length
          const minCount = Math.max(1, this.paidInstallmentsCount)
          this.contractForm.get('installmentCount')?.setValidators([
            Validators.required,
            Validators.min(minCount)
          ])
          this.contractForm.get('installmentCount')?.updateValueAndValidity()
        }
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao carregar contrato'
    }
  }

  async handleSubmit(): Promise<void> {
    const formValue = this.contractForm.value
    const totalAmount = parseFloat(formValue.totalAmount) || 0
    const entradaVal = formValue.entrada != null && formValue.entrada !== '' ? parseFloat(formValue.entrada) : null
    if (entradaVal != null && (entradaVal < 0 || entradaVal >= totalAmount)) {
      this.errorMessage = entradaVal < 0
        ? 'Valor de entrada deve ser maior ou igual a zero.'
        : 'Valor de entrada deve ser menor que o valor total do contrato.'
      return
    }
    if (this.contractForm.invalid) {
      Object.keys(this.contractForm.controls).forEach(key => {
        this.contractForm.controls[key].markAsTouched()
      })
      return
    }

    this.isLoading = true
    this.errorMessage = ''

    try {
      
      if (this.isEditing && this.contractId) {
        const updateData: UpdateContractRequest = {
          status: formValue.status,
          ...(formValue.status === 'Assinado' && formValue.signedAt && { signedAt: formValue.signedAt }),
          clientId: formValue.clientId,
          ...(formValue.sellerId ? { sellerId: formValue.sellerId } : { sellerId: null }),
          totalAmount: parseFloat(formValue.totalAmount),
          installmentCount: parseInt(formValue.installmentCount),
          firstDueDate: formValue.firstDueDate,
          periodicity: formValue.periodicity
        }
        
        const response = await firstValueFrom(
          this.contractService.updateContract(this.contractId, updateData)
        )
        
        if (response.success) {
          this.toastService.success('Contrato atualizado com sucesso')
          this.router.navigate(['/cadastros/contratos'])
        } else {
          // Extract error message from response
          if ((response as any).error?.message) {
            this.errorMessage = (response as any).error.message
          } else if (response.message) {
            this.errorMessage = response.message
          } else {
            this.errorMessage = 'Erro ao atualizar contrato'
          }
        }
      } else {
        const createData: CreateContractRequest = {
          eventId: formValue.eventId,
          clientId: formValue.clientId,
          totalAmount: parseFloat(formValue.totalAmount),
          installmentCount: parseInt(formValue.installmentCount),
          firstDueDate: formValue.firstDueDate,
          periodicity: formValue.periodicity,
          notes: formValue.notes || undefined,
          ...(formValue.sellerId ? { sellerId: formValue.sellerId } : {}),
          ...(this.quoteIdFromConversion ? { quoteId: this.quoteIdFromConversion } : {}),
          ...(entradaVal != null && entradaVal > 0 ? { entrada: entradaVal } : {})
        }
        
        const response = await firstValueFrom(
          this.contractService.createContract(createData)
        )
        
        if (response.success && response.data?.contract) {
          const newContractId = response.data.contract.id
          if (this.quoteItemsFromConversion.length > 0) {
            for (const item of this.quoteItemsFromConversion) {
              await firstValueFrom(
                this.contractService.addContractItem(newContractId, {
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice
                })
              )
            }
          }
          this.router.navigate(['/cadastros/contratos'])
        } else {
          // Extract error message from response
          if ((response as any).error?.message) {
            this.errorMessage = (response as any).error.message
          } else if (response.message) {
            this.errorMessage = response.message
          } else {
            this.errorMessage = 'Erro ao criar contrato'
          }
        }
      }
    } catch (error: any) {
      // Handle HTTP errors (4xx, 5xx)
      const code = error.error?.error?.code
      if (code === 'INSTALLMENT_COUNT_BELOW_PAID' && error.error?.error?.message) {
        this.errorMessage = error.error.error.message
      } else if (error.error?.error?.message) {
        this.errorMessage = error.error.error.message
      } else if (error.error?.message) {
        this.errorMessage = error.error.message
      } else if (error.message) {
        this.errorMessage = error.message
      } else {
        this.errorMessage = 'Erro ao salvar contrato'
      }
    } finally {
      this.isLoading = false
    }
  }

  handleCancel(): void {
    this.router.navigate(['/cadastros/contratos'])
  }

  hasError(fieldName: string): boolean {
    const field = this.contractForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }

  getFieldError(fieldName: string): string {
    const field = this.contractForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      return 'Campo obrigatório'
    }
    if (field?.hasError('min') && field.touched) {
      if (fieldName === 'installmentCount' && this.paidInstallmentsCount > 0) {
        return 'O número de parcelas não pode ser menor que a quantidade de parcelas já pagas'
      }
      return 'Valor mínimo não atendido'
    }
    if (field?.hasError('max') && field.touched) {
      return 'Valor máximo excedido'
    }
    return ''
  }

  /**
   * @Function - installmentAmount
   * @description - Amount per installment: (total - entrada) / installmentCount. Entrada reduces the amount financed in installments.
   * @author - Vitor Hugo
   * @returns - number - Value per installment
   */
  get installmentAmount(): number {
    const total = this.contractForm.get('totalAmount')?.value
    const count = this.contractForm.get('installmentCount')?.value
    if (!total || !count) return 0
    const totalNum = parseFloat(total)
    const countNum = parseInt(count, 10)
    if (countNum <= 0) return 0
    const entradaVal = this.contractForm.get('entrada')?.value
    const entradaNum =
      entradaVal != null && entradaVal !== '' ? parseFloat(entradaVal) : 0
    const amountToFinance = Math.max(0, totalNum - entradaNum)
    return amountToFinance / countNum
  }


  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  get showSignedAtField(): boolean {
    return this.contractForm.get('status')?.value === 'Assinado'
  }
}

