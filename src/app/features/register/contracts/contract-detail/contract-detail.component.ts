import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute, RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Edit, FileText, User, Calendar, DollarSign, CreditCard, CheckCircle2, Clock, AlertCircle, Plus, Trash2, X, Lock, Download, Pencil } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { 
  TableComponent, 
  TableHeaderComponent, 
  TableBodyComponent, 
  TableRowComponent, 
  TableHeadComponent, 
  TableCellComponent 
} from '@shared/components/ui/table/table.component'
import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'
import { ContractService } from '@core/services/contract.service'
import { InstallmentService } from '@core/services/installment.service'
import { AdditionalPaymentService } from '@core/services/additional-payment.service'
import { CommissionService } from '@core/services/commission.service'
import { SellerService } from '@core/services/seller.service'
import { ContractCommissionCardComponent } from '../contract-commission-card/contract-commission-card.component'
import { ContractCommissionFormComponent } from '../contract-commission-form/contract-commission-form.component'
import type { Contract, Installment, AdditionalPayment, PaymentMethod, ContractItem, CommissionDetails, Seller, UpdateInstallmentRequest } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

interface ContractWithDetails extends Contract {
  event?: {
    id: string
    name: string
    eventDate: string
  }
  client?: {
    id: string
    name: string
  }
  installments?: Installment[]
}

@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    LabelComponent,
    TableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent,
    ConfirmationModalComponent,
    ContractCommissionCardComponent,
    ContractCommissionFormComponent
  ],
  templateUrl: './contract-detail.component.html'
})
export class ContractDetailComponent implements OnInit, OnChanges {
  readonly ArrowLeftIcon = ArrowLeft
  readonly EditIcon = Edit
  readonly FileTextIcon = FileText
  readonly UserIcon = User
  readonly CalendarIcon = Calendar
  readonly DollarSignIcon = DollarSign
  readonly CreditCardIcon = CreditCard
  readonly CheckCircle2Icon = CheckCircle2
  readonly ClockIcon = Clock
  readonly AlertCircleIcon = AlertCircle
  readonly PlusIcon = Plus
  readonly Trash2Icon = Trash2
  readonly XIcon = X
  readonly LockIcon = Lock
  readonly DownloadIcon = Download
  readonly PencilIcon = Pencil

  /** When set from parent (e.g. event payments tab), component loads this contract instead of reading from route */
  @Input() contractIdInput: string | null = null
  /** When true, header (back button, title, edit/close) is hidden - used when embedded in event hub */
  @Input() embeddedInEventHub = false

  contract: ContractWithDetails | null = null
  contractId: string | null = null
  isLoading: boolean = true
  error: string = ''
  additionalPayments: AdditionalPayment[] = []
  isLoadingAdditionalPayments: boolean = false

  // Contract Items
  contractItems: ContractItem[] = []
  isLoadingItems: boolean = false
  showItemModal: boolean = false
  isItemEditMode: boolean = false
  itemToEdit: ContractItem | null = null
  isSubmittingItem: boolean = false
  contractItemForm!: FormGroup
  showDeleteItemModal: boolean = false
  itemToDelete: ContractItem | null = null
  isDeletingItem: boolean = false
  showAddAnotherOption: boolean = false

  // Additional Payment Modal
  showAdditionalPaymentModal: boolean = false
  isEditMode: boolean = false
  paymentToEdit: AdditionalPayment | null = null
  isSubmitting: boolean = false
  additionalPaymentForm!: FormGroup
  showDeletePaymentModal: boolean = false
  paymentToDelete: AdditionalPayment | null = null
  isDeletingPayment: boolean = false

  // Close Contract
  isClosingContract: boolean = false

  // Export PDF
  isExportingPDF: boolean = false

  // Edit Installment
  showEditInstallmentModal: boolean = false
  installmentToEdit: Installment | null = null
  isEditInstallmentProcessing: boolean = false
  installmentEditForm!: FormGroup

  // Commission
  commission: CommissionDetails | null = null
  isLoadingCommission: boolean = false
  showCommissionModal: boolean = false
  isSubmittingCommission: boolean = false
  sellers: Seller[] = []
  isLoadingSellers: boolean = false
  showDeleteCommissionModal: boolean = false
  showUnpayCommissionModal: boolean = false

  paymentMethods: PaymentMethod[] = [
    'Dinheiro',
    'PIX',
    'Cartão de Débito',
    'Cartão de Crédito',
    'Transferência Bancária',
    'Boleto',
    'Cheque',
    'Outro'
  ]

  constructor(
    private contractService: ContractService,
    private installmentService: InstallmentService,
    private additionalPaymentService: AdditionalPaymentService,
    private commissionService: CommissionService,
    private sellerService: SellerService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.additionalPaymentForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paymentDate: [new Date().toISOString().split('T')[0], [Validators.required]],
      paymentMethod: ['', [Validators.required]],
      notes: ['']
    })

    this.contractItemForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
      quantity: ['', [Validators.required, Validators.min(0.01)]],
      unitPrice: ['', [Validators.required, Validators.min(0.01)]]
    })

    this.installmentEditForm = this.fb.group({
      status: ['pending', [Validators.required]],
      dueDate: ['', [Validators.required]],
      paymentDate: [''],
      paymentAmount: [''],
      paymentMethod: [''],
      notes: ['']
    })
  }

  /**
   * @Function - ngOnInit
   * @description - Lifecycle hook that runs when component initializes, loads contract details from route or input
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async ngOnInit(): Promise<void> {
    if (this.contractIdInput) {
      this.contractId = this.contractIdInput
      await this.loadContractDetails(this.contractId)
    } else {
      this.contractId = this.route.snapshot.paramMap.get('id')
      if (this.contractId) {
        await this.loadContractDetails(this.contractId)
      } else {
        this.error = 'ID do evento não encontrado'
        this.isLoading = false
      }
    }
  }

  /**
   * @Function - ngOnChanges
   * @description - When contractIdInput is set from parent (e.g. event payments tab), load contract
   * @author - Vitor Hugo
   * @param - changes: SimpleChanges
   * @returns - void
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contractIdInput'] && this.contractIdInput) {
      this.contractId = this.contractIdInput
      this.loadContractDetails(this.contractId)
    }
  }

  /**
   * @Function - loadContractDetails
   * @description - Loads complete contract details including event, client and installments
   * @author - Vitor Hugo
   * @param - id: string - Contract ID
   * @returns - Promise<void>
   */
  async loadContractDetails(id: string): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const response = await firstValueFrom(this.contractService.getContractById(id))
      
      if (response.success && response.data) {
        this.contract = response.data as ContractWithDetails
        // Load additional payments if not included in contract response
        if (!this.contract.additionalPayments || this.contract.additionalPayments.length === 0) {
          await this.loadAdditionalPayments(id)
        } else {
          this.additionalPayments = this.contract.additionalPayments
        }
        // Load contract items
        await this.loadContractItems(id)
        // Load installments so parcelas and totals stay in sync (e.g. after additional payment or partial pay)
        const instRes = await firstValueFrom(this.contractService.getContractInstallments(id))
        if (instRes.success && Array.isArray(instRes.data)) {
          this.contract = { ...this.contract, installments: instRes.data }
        }
        // Load commission
        await this.loadCommission(id)
        // Load sellers for commission form
        await this.loadSellers()
      } else {
        this.error = 'Erro ao carregar detalhes do evento'
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else {
        this.error = err.message || 'Erro ao carregar detalhes do evento'
      }
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - handleBack
   * @description - Navigates back to contracts list (no-op when embedded in event hub)
   * @author - Vitor Hugo
   * @returns - void
   */
  handleBack(): void {
    if (this.embeddedInEventHub) return
    this.router.navigate(['/cadastros/contratos'])
  }

  /**
   * @Function - handleEdit
   * @description - Navigates to contract edit page
   * @author - Vitor Hugo
   * @returns - void
   */
  handleEdit(): void {
    if (this.contractId) {
      this.router.navigate(['/cadastros/contratos/editar', this.contractId])
    }
  }

  /**
   * @Function - formatDate
   * @description - Formats ISO date string to Brazilian date format
   * @author - Vitor Hugo
   * @param - dateString: string - ISO date string
   * @returns - string - Formatted date in Brazilian format
   */
  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }

  /**
   * @Function - formatCurrency
   * @description - Formats number or string to Brazilian currency format
   * @author - Vitor Hugo
   * @param - value: number | string - Value to format
   * @returns - string - Formatted currency string
   */
  formatCurrency(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue)
  }

  /**
   * @Function - parseFloat
   * @description - Parse string to float (exposed to template)
   * @author - Vitor Hugo
   * @param - value: string | number - Value to parse
   * @returns - number - Parsed number
   */
  parseFloat(value: string | number): number {
    return typeof value === 'string' ? parseFloat(value) : value
  }

  /**
   * @Function - getStatusBadgeClass
   * @description - Returns CSS classes for installment status badge
   * @author - Vitor Hugo
   * @param - status: string - Installment status (pending, paid, overdue)
   * @returns - string - CSS classes for badge styling
   */
  getStatusBadgeClass(status: string): string {
    const baseClasses = 'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors'
    
    switch (status.toLowerCase()) {
      case 'paid':
      case 'pago':
        return `${baseClasses} border-transparent bg-green-100 text-green-800`
      case 'pending':
      case 'pendente':
        return `${baseClasses} border-transparent bg-yellow-100 text-yellow-800`
      case 'overdue':
      case 'atrasado':
        return `${baseClasses} border-transparent bg-red-100 text-red-800`
      default:
        return `${baseClasses} border-transparent bg-gray-100 text-gray-800`
    }
  }

  /**
   * @Function - getStatusText
   * @description - Returns translated status text for display
   * @author - Vitor Hugo
   * @param - status: string - Installment status
   * @returns - string - Translated status text
   */
  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'paid': 'Pago',
      'pending': 'Pendente',
      'overdue': 'Atrasado',
      'pago': 'Pago',
      'pendente': 'Pendente',
      'atrasado': 'Atrasado'
    }
    return statusMap[status.toLowerCase()] || status
  }

  /**
   * @Function - getStatusIcon
   * @description - Returns appropriate icon for installment status
   * @author - Vitor Hugo
   * @param - status: string - Installment status
   * @returns - any - Lucide icon component
   */
  getStatusIcon(status: string): any {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'pago':
        return this.CheckCircle2Icon
      case 'pending':
      case 'pendente':
        return this.ClockIcon
      case 'overdue':
      case 'atrasado':
        return this.AlertCircleIcon
      default:
        return this.ClockIcon
    }
  }

  /**
   * @Function - normalizeInstallmentStatusToApi
   * @description - Normalize installment status to API format (pending | paid | overdue)
   * @author - Vitor Hugo
   * @param - status: string - Status from installment or form
   * @returns - 'pending' | 'paid' | 'overdue'
   */
  normalizeInstallmentStatusToApi(status: string): 'pending' | 'paid' | 'overdue' {
    const s = (status || '').toLowerCase()
    if (s === 'pago' || s === 'paid') return 'paid'
    if (s === 'atrasado' || s === 'overdue') return 'overdue'
    return 'pending'
  }

  /**
   * @Function - handleEditInstallmentClick
   * @description - Open edit modal for installment
   * @author - Vitor Hugo
   * @param - installment: Installment - Installment to edit
   * @returns - void
   */
  handleEditInstallmentClick(installment: Installment): void {
    this.installmentToEdit = installment
    const statusApi = this.normalizeInstallmentStatusToApi(installment.status)
    const dueDate = installment.dueDate?.includes('T') ? installment.dueDate.split('T')[0] : (installment.dueDate || '')
    this.installmentEditForm.patchValue({
      status: statusApi,
      dueDate,
      paymentDate: installment.paymentDate?.split('T')[0] || '',
      paymentAmount: installment.paymentAmount ?? installment.amount ?? '',
      paymentMethod: installment.paymentMethod || '',
      notes: installment.notes || ''
    })
    this.showEditInstallmentModal = true
    this.error = ''
  }

  /**
   * @Function - handleConfirmEditInstallment
   * @description - Submit installment update
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmEditInstallment(): Promise<void> {
    if (!this.installmentToEdit || !this.contractId || this.installmentEditForm.invalid) {
      Object.keys(this.installmentEditForm.controls).forEach(key => this.installmentEditForm.get(key)?.markAsTouched())
      return
    }

    const formValue = this.installmentEditForm.value
    const statusApi = this.normalizeInstallmentStatusToApi(formValue.status)
    const installmentCount = this.contract?.installments?.length ?? 0
    const paidAmount = formValue.paymentAmount ? parseFloat(formValue.paymentAmount) : Number(this.installmentToEdit.amount)
    const installmentAmount = Number(this.installmentToEdit.amount)

    if (statusApi === 'paid' && installmentCount > 1) {
      const epsilon = 0.005
      if (paidAmount < installmentAmount - epsilon || paidAmount > installmentAmount + epsilon) {
        this.error = 'Com mais de uma parcela, pague o valor total da parcela.'
        return
      }
    }

    try {
      this.isEditInstallmentProcessing = true
      this.error = ''

      const payload: UpdateInstallmentRequest = {
        status: statusApi,
        dueDate: formValue.dueDate
      }

      if (statusApi === 'paid') {
        payload.paymentDate = formValue.paymentDate || new Date().toISOString().split('T')[0]
        payload.paymentAmount = formValue.paymentAmount ? parseFloat(formValue.paymentAmount) : Number(this.installmentToEdit.amount)
        payload.paymentMethod = formValue.paymentMethod || null
        payload.notes = formValue.notes || null
      } else {
        payload.paymentDate = null
        payload.paymentAmount = null
        payload.paymentMethod = null
        payload.notes = formValue.notes || null
      }

      const response = await firstValueFrom(
        this.installmentService.updateInstallment(this.installmentToEdit.id, payload)
      )

      if (response.success) {
        await this.loadContractDetails(this.contractId)
        this.showEditInstallmentModal = false
        this.installmentToEdit = null
      } else {
        this.error = response.message || 'Erro ao atualizar parcela'
      }
    } catch (err: any) {
      const status = err?.status ?? err?.error?.status
      if (status === 422) {
        this.error = 'Com mais de uma parcela, pague o valor total da parcela.'
      } else {
        this.error = err.error?.message || err.message || 'Erro ao atualizar parcela'
      }
    } finally {
      this.isEditInstallmentProcessing = false
    }
  }

  /**
   * @Function - handleCancelEditInstallment
   * @description - Close edit installment modal
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancelEditInstallment(): void {
    this.showEditInstallmentModal = false
    this.installmentToEdit = null
  }

  /**
   * @Function - isPaidStatusInInstallmentEditForm
   * @description - Whether edit form status is paid (show payment fields)
   * @author - Vitor Hugo
   * @returns - boolean
   */
  get isPaidStatusInInstallmentEditForm(): boolean {
    return this.installmentEditForm?.get('status')?.value === 'paid'
  }

  /**
   * @Function - getPaidInstallmentsCount
   * @description - Counts the number of paid installments
   * @author - Vitor Hugo
   * @returns - number - Count of paid installments
   */
  getPaidInstallmentsCount(): number {
    if (!this.contract?.installments) return 0
    return this.contract.installments.filter(
      i => i.status.toLowerCase() === 'paid' || i.status.toLowerCase() === 'pago'
    ).length
  }

  /**
   * @Function - getTotalPaid
   * @description - Gets total paid amount from API calculation or calculates manually
   * @author - Vitor Hugo
   * @returns - number - Total paid amount
   */
  getTotalPaid(): number {
    if (this.contract?.totalPaid !== undefined) {
      return typeof this.contract.totalPaid === 'string' 
        ? parseFloat(this.contract.totalPaid) 
        : this.contract.totalPaid
    }
    // Fallback calculation if API doesn't provide
    if (!this.contract?.installments) return 0
    return this.contract.installments
      .filter(i => i.status.toLowerCase() === 'paid' || i.status.toLowerCase() === 'pago')
      .reduce((sum, i) => {
        const amount = typeof i.paymentAmount === 'string' 
          ? parseFloat(i.paymentAmount) 
          : (i.paymentAmount || 0)
        return sum + amount
      }, 0) + this.getTotalAdditionalPayments()
  }

  /**
   * @Function - getRemainingAmount
   * @description - Gets remaining amount from API calculation or calculates manually
   * @author - Vitor Hugo
   * @returns - number - Remaining amount
   */
  getRemainingAmount(): number {
    if (this.contract?.remainingBalance !== undefined) {
      return typeof this.contract.remainingBalance === 'string' 
        ? parseFloat(this.contract.remainingBalance) 
        : this.contract.remainingBalance
    }
    // Fallback calculation if API doesn't provide
    if (!this.contract) return 0
    const total = typeof this.contract.totalAmount === 'string' 
      ? parseFloat(this.contract.totalAmount) 
      : this.contract.totalAmount
    return total - this.getTotalPaid()
  }

  /**
   * @Function - getOverdueInstallmentsCount
   * @description - Counts the number of overdue installments
   * @author - Vitor Hugo
   * @returns - number - Count of overdue installments
   */
  getOverdueInstallmentsCount(): number {
    if (!this.contract?.installments) return 0
    return this.contract.installments.filter(
      i => i.status.toLowerCase() === 'overdue' || i.status.toLowerCase() === 'atrasado'
    ).length
  }

  /**
   * @Function - getNextInstallments
   * @description - Returns pending or overdue installments sorted by due date (for embedded view)
   * @author - Vitor Hugo
   * @returns - Installment[] - Up to 5 next installments to pay
   */
  getNextInstallments(): Installment[] {
    if (!this.contract?.installments?.length) return []
    const pendingOrOverdue = this.contract.installments.filter(
      i => {
        const s = i.status.toLowerCase()
        return s === 'pending' || s === 'pendente' || s === 'overdue' || s === 'atrasado'
      }
    )
    const sorted = [...pendingOrOverdue].sort((a, b) =>
      (a.dueDate || '').localeCompare(b.dueDate || '')
    )
    return sorted.slice(0, 5)
  }

  /**
   * @Function - loadAdditionalPayments
   * @description - Load additional payments for the contract
   * @author - Vitor Hugo
   * @param - contractId: string - Contract ID
   * @returns - Promise<void>
   */
  async loadAdditionalPayments(contractId: string): Promise<void> {
    try {
      this.isLoadingAdditionalPayments = true
      const response = await firstValueFrom(
        this.additionalPaymentService.getAdditionalPaymentsByContract(contractId)
      )
      if (response.success && response.data) {
        this.additionalPayments = response.data
      }
    } catch (err: any) {
      console.error('Erro ao carregar pagamentos adicionais:', err)
    } finally {
      this.isLoadingAdditionalPayments = false
    }
  }

  /**
   * @Function - getTotalAdditionalPayments
   * @description - Calculate total amount of additional payments
   * @author - Vitor Hugo
   * @returns - number - Total amount
   */
  getTotalAdditionalPayments(): number {
    return this.additionalPayments.reduce((sum, payment) => {
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount
      return sum + (amount || 0)
    }, 0)
  }

  /**
   * @Function - handleAddAdditionalPayment
   * @description - Open modal to add additional payment
   * @author - Vitor Hugo
   * @returns - void
   */
  handleAddAdditionalPayment(): void {
    this.isEditMode = false
    this.paymentToEdit = null
    this.additionalPaymentForm.reset({
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      notes: ''
    })
    this.showAdditionalPaymentModal = true
    this.error = ''
  }

  /**
   * @Function - handleEditAdditionalPayment
   * @description - Open modal to edit additional payment
   * @author - Vitor Hugo
   * @param - payment: AdditionalPayment - Payment to edit
   * @returns - void
   */
  handleEditAdditionalPayment(payment: AdditionalPayment): void {
    this.isEditMode = true
    this.paymentToEdit = payment
    this.additionalPaymentForm.patchValue({
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      notes: payment.notes || ''
    })
    this.showAdditionalPaymentModal = true
    this.error = ''
  }

  /**
   * @Function - handleCloseAdditionalPaymentModal
   * @description - Close additional payment modal
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCloseAdditionalPaymentModal(): void {
    this.showAdditionalPaymentModal = false
    this.isEditMode = false
    this.paymentToEdit = null
    this.additionalPaymentForm.reset()
    this.error = ''
  }

  /**
   * @Function - handleSubmitAdditionalPayment
   * @description - Submit additional payment form
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleSubmitAdditionalPayment(): Promise<void> {
    if (this.additionalPaymentForm.invalid || !this.contractId) {
      Object.keys(this.additionalPaymentForm.controls).forEach(key => {
        this.additionalPaymentForm.controls[key].markAsTouched()
      })
      return
    }

    try {
      this.isSubmitting = true
      this.error = ''
      const formValue = this.additionalPaymentForm.value

      if (this.isEditMode && this.paymentToEdit) {
        const updateData: any = {}
        if (formValue.amount) updateData.amount = parseFloat(formValue.amount)
        if (formValue.paymentDate) updateData.paymentDate = formValue.paymentDate
        if (formValue.paymentMethod) updateData.paymentMethod = formValue.paymentMethod
        if (formValue.notes !== undefined) updateData.notes = formValue.notes

        const response = await firstValueFrom(
          this.additionalPaymentService.updateAdditionalPayment(this.paymentToEdit.id, updateData)
        )
        if (response.success) {
          await this.loadContractDetails(this.contractId!)
          this.handleCloseAdditionalPaymentModal()
        } else {
          this.error = response.message || 'Erro ao atualizar pagamento adicional'
        }
      } else {
        const createData = {
          contractId: this.contractId,
          amount: parseFloat(formValue.amount),
          paymentDate: formValue.paymentDate,
          paymentMethod: formValue.paymentMethod,
          notes: formValue.notes || undefined
        }

        const response = await firstValueFrom(
          this.additionalPaymentService.createAdditionalPayment(createData)
        )
        if (response.success) {
          await this.loadContractDetails(this.contractId!)
          this.handleCloseAdditionalPaymentModal()
        } else {
          this.error = response.message || 'Erro ao criar pagamento adicional'
        }
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else if (err.message) {
        this.error = err.message
      } else {
        this.error = this.isEditMode ? 'Erro ao atualizar pagamento adicional' : 'Erro ao criar pagamento adicional'
      }
    } finally {
      this.isSubmitting = false
    }
  }

  /**
   * @Function - hasFormError
   * @description - Check if form field has error
   * @author - Vitor Hugo
   * @param - fieldName: string - Field name
   * @returns - boolean - True if has error
   */
  hasFormError(fieldName: string): boolean {
    const field = this.additionalPaymentForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }

  /**
   * @Function - getFormFieldError
   * @description - Get error message for form field
   * @author - Vitor Hugo
   * @param - fieldName: string - Field name
   * @returns - string - Error message
   */
  getFormFieldError(fieldName: string): string {
    const field = this.additionalPaymentForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      return 'Campo obrigatório'
    }
    if (field?.hasError('min') && field.touched) {
      return 'Valor deve ser maior que zero'
    }
    return ''
  }

  /**
   * @Function - handleDeletePaymentClick
   * @description - Opens confirmation modal to delete additional payment
   * @author - Vitor Hugo
   * @param - payment: AdditionalPayment - Payment to delete
   * @returns - void
   */
  handleDeletePaymentClick(payment: AdditionalPayment): void {
    this.paymentToDelete = payment
    this.showDeletePaymentModal = true
    this.error = ''
  }

  /**
   * @Function - handleCancelDeletePayment
   * @description - Closes delete payment modal without deleting
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancelDeletePayment(): void {
    this.showDeletePaymentModal = false
    this.paymentToDelete = null
  }

  /**
   * @Function - handleConfirmDeletePayment
   * @description - Confirms and executes additional payment deletion
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmDeletePayment(): Promise<void> {
    if (!this.paymentToDelete) return

    try {
      this.isDeletingPayment = true
      const response = await firstValueFrom(
        this.additionalPaymentService.deleteAdditionalPayment(this.paymentToDelete.id)
      )
      if (response.success && this.contractId) {
        this.showDeletePaymentModal = false
        this.paymentToDelete = null
        await this.loadAdditionalPayments(this.contractId)
      } else {
        this.error = response.message || 'Erro ao excluir pagamento adicional'
        this.showDeletePaymentModal = false
        this.paymentToDelete = null
      }
    } catch (err: any) {
      this.error = err.error?.message || err.message || 'Erro ao excluir pagamento adicional'
      this.showDeletePaymentModal = false
      this.paymentToDelete = null
    } finally {
      this.isDeletingPayment = false
    }
  }

  /**
   * @Function - loadContractItems
   * @description - Load contract items
   * @author - Vitor Hugo
   * @param - contractId: string - Contract ID
   * @returns - Promise<void>
   */
  async loadContractItems(contractId: string): Promise<void> {
    try {
      this.isLoadingItems = true
      const response = await firstValueFrom(
        this.contractService.getContractItems(contractId)
      )
      if (response.success && response.data) {
        this.contractItems = response.data
      }
    } catch (err: any) {
      console.error('Erro ao carregar itens do evento:', err)
    } finally {
      this.isLoadingItems = false
    }
  }

  /**
   * @Function - handleAddContractItem
   * @description - Open modal to add contract item
   * @author - Vitor Hugo
   * @returns - void
   */
  handleAddContractItem(): void {
    this.isItemEditMode = false
    this.itemToEdit = null
    this.showAddAnotherOption = false
    this.contractItemForm.reset({
      description: '',
      quantity: '',
      unitPrice: ''
    })
    this.showItemModal = true
    this.error = ''
  }

  /**
   * @Function - handleEditContractItem
   * @description - Open modal to edit contract item
   * @author - Vitor Hugo
   * @param - item: ContractItem - Item to edit
   * @returns - void
   */
  handleEditContractItem(item: ContractItem): void {
    this.isItemEditMode = true
    this.itemToEdit = item
    this.showAddAnotherOption = false
    this.contractItemForm.patchValue({
      description: item.description,
      quantity: typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity,
      unitPrice: typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice
    })
    this.showItemModal = true
    this.error = ''
  }

  /**
   * @Function - handleCloseItemModal
   * @description - Close contract item modal
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCloseItemModal(): void {
    this.showItemModal = false
    this.isItemEditMode = false
    this.itemToEdit = null
    this.showAddAnotherOption = false
    this.contractItemForm.reset()
    this.error = ''
  }

  /**
   * @Function - handleSubmitContractItem
   * @description - Submit contract item form
   * @author - Vitor Hugo
   * @param - addAnother: boolean - If true, keep modal open to add another item
   * @returns - Promise<void>
   */
  async handleSubmitContractItem(addAnother: boolean = false): Promise<void> {
    if (this.contractItemForm.invalid || !this.contractId) {
      Object.keys(this.contractItemForm.controls).forEach(key => {
        this.contractItemForm.controls[key].markAsTouched()
      })
      return
    }

    try {
      this.isSubmittingItem = true
      this.error = ''
      const formValue = this.contractItemForm.value

      if (this.isItemEditMode && this.itemToEdit) {
        const response = await firstValueFrom(
          this.contractService.updateContractItem(
            this.contractId,
            this.itemToEdit.id,
            {
              description: formValue.description,
              quantity: parseFloat(formValue.quantity),
              unitPrice: parseFloat(formValue.unitPrice)
            }
          )
        )
        if (response.success) {
          await this.loadContractDetails(this.contractId)
          this.handleCloseItemModal()
        } else {
          this.error = response.message || 'Erro ao atualizar item do evento'
        }
      } else {
        const response = await firstValueFrom(
          this.contractService.addContractItem(this.contractId, {
            description: formValue.description,
            quantity: parseFloat(formValue.quantity),
            unitPrice: parseFloat(formValue.unitPrice)
          })
        )
        if (response.success) {
          await this.loadContractDetails(this.contractId)
          if (addAnother) {
            // Reset form to add another item
            this.contractItemForm.reset({
              description: '',
              quantity: '',
              unitPrice: ''
            })
            this.showAddAnotherOption = true
            // Focus on description field
            setTimeout(() => {
              const descInput = document.getElementById('itemDescription')
              if (descInput) {
                descInput.focus()
              }
            }, 100)
          } else {
            this.handleCloseItemModal()
          }
        } else {
          this.error = response.message || 'Erro ao adicionar item ao evento'
        }
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else if (err.message) {
        this.error = err.message
      } else {
        this.error = this.isItemEditMode ? 'Erro ao atualizar item do evento' : 'Erro ao adicionar item ao evento'
      }
    } finally {
      this.isSubmittingItem = false
    }
  }

  /**
   * @Function - handleDeleteContractItem
   * @description - Open modal to confirm deletion of contract item
   * @author - Vitor Hugo
   * @param - item: ContractItem - Item to delete
   * @returns - void
   */
  handleDeleteContractItem(item: ContractItem): void {
    this.itemToDelete = item
    this.showDeleteItemModal = true
    this.error = ''
  }

  /**
   * @Function - handleCancelDeleteItem
   * @description - Cancel item deletion
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancelDeleteItem(): void {
    this.showDeleteItemModal = false
    this.itemToDelete = null
    this.error = ''
  }

  /**
   * @Function - handleConfirmDeleteItem
   * @description - Confirm and delete contract item
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmDeleteItem(): Promise<void> {
    if (!this.itemToDelete || !this.contractId) return

    try {
      this.isDeletingItem = true
      this.error = ''
      const response = await firstValueFrom(
        this.contractService.deleteContractItem(this.contractId, this.itemToDelete.id)
      )
      if (response.success) {
        await this.loadContractDetails(this.contractId)
        this.handleCancelDeleteItem()
      } else {
        this.error = response.message || 'Erro ao excluir item do evento'
      }
    } catch (err: any) {
      this.error = err.error?.message || err.message || 'Erro ao excluir item do evento'
    } finally {
      this.isDeletingItem = false
    }
  }

  /**
   * @Function - hasItemFormError
   * @description - Check if item form field has error
   * @author - Vitor Hugo
   * @param - fieldName: string - Field name
   * @returns - boolean - True if has error
   */
  hasItemFormError(fieldName: string): boolean {
    const field = this.contractItemForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }

  /**
   * @Function - getItemFormFieldError
   * @description - Get error message for item form field
   * @author - Vitor Hugo
   * @param - fieldName: string - Field name
   * @returns - string - Error message
   */
  getItemFormFieldError(fieldName: string): string {
    const field = this.contractItemForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      return 'Campo obrigatório'
    }
    if (field?.hasError('min') && field.touched) {
      return 'Valor deve ser maior que zero'
    }
    if (field?.hasError('minlength') && field.touched) {
      return 'Descrição deve ter pelo menos 1 caractere'
    }
    if (field?.hasError('maxlength') && field.touched) {
      return 'Descrição deve ter no máximo 255 caracteres'
    }
    return ''
  }

  /**
   * @Function - getTotalItemsAmount
   * @description - Calculate total amount of contract items
   * @author - Vitor Hugo
   * @returns - number - Total amount
   */
  getTotalItemsAmount(): number {
    return this.contractItems.reduce((sum, item) => {
      const total = typeof item.totalPrice === 'string' ? parseFloat(item.totalPrice) : item.totalPrice
      return sum + (total || 0)
    }, 0)
  }

  /**
   * @Function - isContractClosed
   * @description - Check if contract is closed
   * @author - Vitor Hugo
   * @returns - boolean - True if contract is closed
   */
  isContractClosed(): boolean {
    return !!this.contract?.closedAt
  }

  /**
   * @Function - handleCloseContract
   * @description - Close contract
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleCloseContract(): Promise<void> {
    if (!this.contractId) return

    if (!confirm('Tem certeza que deseja fechar este evento? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      this.isClosingContract = true
      this.error = ''
      const response = await firstValueFrom(
        this.contractService.closeContract(this.contractId)
      )
      if (response.success) {
        await this.loadContractDetails(this.contractId)
      } else {
        this.error = response.message || 'Erro ao fechar evento'
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else if (err.message) {
        this.error = err.message
      } else {
        this.error = 'Erro ao fechar evento'
      }
    } finally {
      this.isClosingContract = false
    }
  }

  /**
   * @Function - handleExportPDF
   * @description - Export installments PDF
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleExportPDF(): Promise<void> {
    if (!this.contractId || !this.contract) return

    try {
      this.isExportingPDF = true
      this.error = ''
      const blob = await firstValueFrom(
        this.contractService.exportInstallmentsPDF(this.contractId)
      )
      
      // Generate filename with contract info
      const clientName = this.contract.client?.name || 'cliente'
      const eventName = this.contract.event?.name || 'evento'
      const sanitizedClientName = clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const sanitizedEventName = eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const filename = `parcelas_${sanitizedClientName}_${sanitizedEventName}_${this.contractId}.pdf`
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else if (err.message) {
        this.error = err.message
      } else {
        this.error = 'Erro ao exportar PDF das parcelas'
      }
    } finally {
      this.isExportingPDF = false
    }
  }

  /**
   * @Function - loadCommission
   * @description - Load commission details for the contract
   * @author - Vitor Hugo
   * @param - contractId: string - Contract ID
   * @returns - Promise<void>
   */
  async loadCommission(contractId: string): Promise<void> {
    try {
      this.isLoadingCommission = true
      const response = await firstValueFrom(
        this.commissionService.getCommission(contractId)
      )
      if (response.success && response.data) {
        this.commission = response.data
      }
    } catch (err: any) {
      // Commission might not exist yet, which is fine
      console.error('Erro ao carregar comissão:', err)
      this.commission = null
    } finally {
      this.isLoadingCommission = false
    }
  }

  /**
   * @Function - loadSellers
   * @description - Load sellers list for commission form
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadSellers(): Promise<void> {
    try {
      this.isLoadingSellers = true
      const response = await firstValueFrom(this.sellerService.getSellers())
      if (response.success && response.data) {
        this.sellers = Array.isArray(response.data)
          ? response.data
          : (response.data as any).data || []
      }
    } catch (err: any) {
      console.error('Erro ao carregar vendedoras:', err)
    } finally {
      this.isLoadingSellers = false
    }
  }

  /**
   * @Function - handleEditCommission
   * @description - Open commission form modal
   * @author - Vitor Hugo
   * @returns - void
   */
  handleEditCommission(): void {
    this.showCommissionModal = true
    this.error = ''
  }

  /**
   * @Function - handleCloseCommissionModal
   * @description - Close commission form modal
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCloseCommissionModal(): void {
    this.showCommissionModal = false
    this.error = ''
  }

  /**
   * @Function - handleSubmitCommission
   * @description - Submit commission form
   * @author - Vitor Hugo
   * @param - data: { type, value, sellerId, notes } - Commission data
   * @returns - Promise<void>
   */
  async handleSubmitCommission(data: {
    type: 'fixed' | 'percentage'
    value: number
    sellerId: string | null
    notes: string
  }): Promise<void> {
    if (!this.contractId) return

    try {
      this.isSubmittingCommission = true
      this.error = ''
      const response = await firstValueFrom(
        this.commissionService.setCommission(this.contractId, data)
      )
      if (response.success) {
        await this.loadCommission(this.contractId)
        this.handleCloseCommissionModal()
      } else {
        this.error = response.message || 'Erro ao salvar comissão'
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else if (err.message) {
        this.error = err.message
      } else {
        this.error = 'Erro ao salvar comissão'
      }
    } finally {
      this.isSubmittingCommission = false
    }
  }

  /**
   * @Function - handlePayCommission
   * @description - Mark commission as paid
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handlePayCommission(): Promise<void> {
    if (!this.contractId) return

    try {
      this.error = ''
      const response = await firstValueFrom(
        this.commissionService.markAsPaid(this.contractId)
      )
      if (response.success) {
        await this.loadCommission(this.contractId)
      } else {
        this.error = response.message || 'Erro ao marcar comissão como paga'
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else if (err.message) {
        this.error = err.message
      } else {
        this.error = 'Erro ao marcar comissão como paga'
      }
    }
  }

  /**
   * @Function - handleUnpayCommission
   * @description - Revert commission payment
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleUnpayCommission(): Promise<void> {
    if (!this.contractId) return

    try {
      this.error = ''
      const response = await firstValueFrom(
        this.commissionService.markAsUnpaid(this.contractId)
      )
      if (response.success) {
        await this.loadCommission(this.contractId)
        this.showUnpayCommissionModal = false
      } else {
        this.error = response.message || 'Erro ao reverter pagamento da comissão'
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else if (err.message) {
        this.error = err.message
      } else {
        this.error = 'Erro ao reverter pagamento da comissão'
      }
    }
  }

  /**
   * @Function - handleRemoveCommission
   * @description - Remove commission from contract
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleRemoveCommission(): Promise<void> {
    if (!this.contractId) return

    try {
      this.error = ''
      const response = await firstValueFrom(
        this.commissionService.removeCommission(this.contractId)
      )
      if (response.success) {
        await this.loadCommission(this.contractId)
        this.showDeleteCommissionModal = false
      } else {
        this.error = response.message || 'Erro ao remover comissão'
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else if (err.message) {
        this.error = err.message
      } else {
        this.error = 'Erro ao remover comissão'
      }
    }
  }

  /**
   * @Function - handleConfirmUnpayCommission
   * @description - Confirm and revert commission payment
   * @author - Vitor Hugo
   * @returns - void
   */
  handleConfirmUnpayCommission(): void {
    this.showUnpayCommissionModal = true
  }

  /**
   * @Function - handleCancelUnpayCommission
   * @description - Cancel unpay commission action
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancelUnpayCommission(): void {
    this.showUnpayCommissionModal = false
  }

  /**
   * @Function - handleConfirmDeleteCommission
   * @description - Confirm and delete commission
   * @author - Vitor Hugo
   * @returns - void
   */
  handleConfirmDeleteCommission(): void {
    this.showDeleteCommissionModal = true
  }

  /**
   * @Function - handleCancelDeleteCommission
   * @description - Cancel delete commission action
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancelDeleteCommission(): void {
    this.showDeleteCommissionModal = false
  }
}

