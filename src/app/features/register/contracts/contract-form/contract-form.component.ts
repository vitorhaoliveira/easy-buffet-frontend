import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, X, FileText } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { ContractService } from '@core/services/contract.service'
import { EventService } from '@core/services/event.service'
import { ClientService } from '@core/services/client.service'
import type { Event, Client, CreateContractRequest, UpdateContractRequest } from '@shared/models/api.types'

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
  isEditing: boolean = false
  contractId: string | null = null
  isLoading: boolean = false
  isLoadingData: boolean = true
  errorMessage: string = ''
  fixedCommissionAmount: number = 0 // Valor fixo da comissão quando em edição

  constructor(
    private fb: FormBuilder,
    private contractService: ContractService,
    private eventService: EventService,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.contractForm = this.fb.group({
      eventId: ['', [Validators.required]],
      clientId: ['', [Validators.required]],
      totalAmount: ['', [Validators.required, Validators.min(0)]],
      installmentCount: ['', [Validators.required, Validators.min(1)]],
      firstDueDate: ['', [Validators.required]],
      periodicity: ['Mensal'],
      commissionPercentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      notes: [''],
      status: ['Pendente'],
      signedAt: ['']
    })
  }

  async ngOnInit(): Promise<void> {
    this.contractId = this.route.snapshot.paramMap.get('id')
    this.isEditing = !!this.contractId

    await this.loadData()

    if (this.isEditing && this.contractId) {
      await this.loadContract(this.contractId)
    }
    
    this.isLoadingData = false
  }

  async loadData(): Promise<void> {
    try {
      const [eventsResponse, clientsResponse] = await Promise.all([
        firstValueFrom(this.eventService.getEvents()),
        firstValueFrom(this.clientService.getClients())
      ])

      if (eventsResponse.success && eventsResponse.data) {
        this.events = eventsResponse.data
      }

      if (clientsResponse.success && clientsResponse.data) {
        this.clients = clientsResponse.data as Client[]
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao carregar dados'
    }
  }

  async loadContract(id: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.contractService.getContractById(id))
      if (response.success && response.data) {
        const contract = response.data
        // Armazena o valor fixo da comissão
        this.fixedCommissionAmount = contract.commissionAmount || 0
        this.contractForm.patchValue({
          eventId: contract.eventId,
          clientId: contract.clientId,
          totalAmount: contract.totalAmount,
          installmentCount: contract.installmentCount,
          firstDueDate: contract.firstDueDate.split('T')[0],
          periodicity: contract.periodicity,
          commissionPercentage: contract.commissionPercentage,
          notes: contract.notes || '',
          status: contract.status,
          signedAt: contract.signedAt || ''
        })
        // Desabilita o campo de comissão no modo edição
        if (this.isEditing) {
          this.contractForm.get('commissionPercentage')?.disable()
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
          ...(formValue.status === 'Assinado' && formValue.signedAt && { signedAt: formValue.signedAt })
        }
        
        const response = await firstValueFrom(
          this.contractService.updateContract(this.contractId, updateData)
        )
        
        if (response.success) {
          this.router.navigate(['/cadastros/contratos'])
        } else {
          this.errorMessage = 'Erro ao atualizar contrato'
        }
      } else {
        const createData: CreateContractRequest = {
          eventId: formValue.eventId,
          clientId: formValue.clientId,
          totalAmount: parseFloat(formValue.totalAmount),
          installmentCount: parseInt(formValue.installmentCount),
          firstDueDate: formValue.firstDueDate,
          periodicity: formValue.periodicity,
          commissionPercentage: parseFloat(formValue.commissionPercentage),
          notes: formValue.notes || undefined
        }
        
        const response = await firstValueFrom(
          this.contractService.createContract(createData)
        )
        
        if (response.success) {
          this.router.navigate(['/cadastros/contratos'])
        } else {
          this.errorMessage = 'Erro ao criar contrato'
        }
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao salvar contrato'
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

  get commissionAmount(): number {
    // Se estiver editando, retorna o valor fixo da comissão
    if (this.isEditing && this.fixedCommissionAmount > 0) {
      return this.fixedCommissionAmount
    }
    // Caso contrário, calcula baseado no formulário (criação)
    const total = this.contractForm.get('totalAmount')?.value
    const percentage = this.contractForm.get('commissionPercentage')?.value
    return (total && percentage) ? parseFloat(total) * parseFloat(percentage) / 100 : 0
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

