import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, X, FileText } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { ContractService } from '@core/services/contract.service'
import { ToastService } from '@core/services/toast.service'
import { QuoteService } from '@core/services/quote.service'
import { EventService } from '@core/services/event.service'
import { ClientService } from '@core/services/client.service'
import { SellerService } from '@core/services/seller.service'
import type { Event, Client, Seller, CreateContractRequest, UpdateContractRequest, QuoteItem } from '@shared/models/api.types'

@Component({
  selector: 'app-contract-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
      const eventId = quote.eventId ?? quote.event?.id ?? ''
      this.contractForm.patchValue({
        eventId,
        clientId,
        totalAmount: quote.totalAmount
      })
    } catch {
      this.errorMessage = 'Erro ao carregar orçamento para conversão'
    }
  }

  /**
   * @Function - loadData
   * @description - Loads events, clients and sellers data for the form
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadData(): Promise<void> {
    try {
      const [eventsResponse, clientsResponse, sellersResponse] = await Promise.all([
        firstValueFrom(this.eventService.getEvents()),
        firstValueFrom(this.clientService.getClients()),
        firstValueFrom(this.sellerService.getSellers())
      ])

      if (eventsResponse.success && eventsResponse.data) {
        this.events = eventsResponse.data
      }

      if (clientsResponse.success && clientsResponse.data) {
        this.clients = clientsResponse.data as Client[]
      }

      if (sellersResponse.success && sellersResponse.data) {
        this.sellers = Array.isArray(sellersResponse.data) 
          ? sellersResponse.data 
          : (sellersResponse.data as any).data || []
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao carregar dados'
    }
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
          installmentCount: contract.installmentCount,
          firstDueDate: contract.firstDueDate.split('T')[0],
          periodicity: contract.periodicity,
          notes: contract.notes || '',
          status: contract.status,
          signedAt: contract.signedAt || ''
        })
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
    if (this.contractForm.invalid) {
      Object.keys(this.contractForm.controls).forEach(key => {
        this.contractForm.controls[key].markAsTouched()
      })
      return
    }

    this.isLoading = true
    this.errorMessage = ''

    try {
      const formValue = this.contractForm.value
      
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
          ...(this.quoteIdFromConversion ? { quoteId: this.quoteIdFromConversion } : {})
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

  get installmentAmount(): number {
    const total = this.contractForm.get('totalAmount')?.value
    const count = this.contractForm.get('installmentCount')?.value
    return (total && count) ? parseFloat(total) / parseInt(count) : 0
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

