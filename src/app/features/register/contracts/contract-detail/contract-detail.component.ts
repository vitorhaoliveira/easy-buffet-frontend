import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute, RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Edit, FileText, User, Calendar, DollarSign, CreditCard, CheckCircle2, Clock, AlertCircle, Plus, Trash2, X, Lock, Download } from 'lucide-angular'
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
import { ContractService } from '@core/services/contract.service'
import { AdditionalPaymentService } from '@core/services/additional-payment.service'
import type { Contract, Installment, AdditionalPayment, PaymentMethod, ContractItem } from '@shared/models/api.types'
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
    TableCellComponent
  ],
  templateUrl: './contract-detail.component.html'
})
export class ContractDetailComponent implements OnInit {
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

  // Additional Payment Modal
  showAdditionalPaymentModal: boolean = false
  isEditMode: boolean = false
  paymentToEdit: AdditionalPayment | null = null
  isSubmitting: boolean = false
  additionalPaymentForm!: FormGroup

  // Close Contract
  isClosingContract: boolean = false

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
    private additionalPaymentService: AdditionalPaymentService,
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
  }

  /**
   * @Function - ngOnInit
   * @description - Lifecycle hook that runs when component initializes, loads contract details
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async ngOnInit(): Promise<void> {
    this.contractId = this.route.snapshot.paramMap.get('id')
    if (this.contractId) {
      await this.loadContractDetails(this.contractId)
    } else {
      this.error = 'ID do contrato não encontrado'
      this.isLoading = false
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
      } else {
        this.error = 'Erro ao carregar detalhes do contrato'
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else {
        this.error = err.message || 'Erro ao carregar detalhes do contrato'
      }
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - handleBack
   * @description - Navigates back to contracts list
   * @author - Vitor Hugo
   * @returns - void
   */
  handleBack(): void {
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
   * @Function - handleDeleteAdditionalPayment
   * @description - Delete additional payment
   * @author - Vitor Hugo
   * @param - payment: AdditionalPayment - Payment to delete
   * @returns - Promise<void>
   */
  async handleDeleteAdditionalPayment(payment: AdditionalPayment): Promise<void> {
    if (!confirm(`Tem certeza que deseja excluir o pagamento adicional de ${this.formatCurrency(payment.amount)}?`)) {
      return
    }

    try {
      const response = await firstValueFrom(
        this.additionalPaymentService.deleteAdditionalPayment(payment.id)
      )
      if (response.success && this.contractId) {
        await this.loadAdditionalPayments(this.contractId)
      } else {
        this.error = response.message || 'Erro ao excluir pagamento adicional'
      }
    } catch (err: any) {
      this.error = err.error?.message || err.message || 'Erro ao excluir pagamento adicional'
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
      console.error('Erro ao carregar itens do contrato:', err)
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
    this.contractItemForm.reset()
    this.error = ''
  }

  /**
   * @Function - handleSubmitContractItem
   * @description - Submit contract item form
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleSubmitContractItem(): Promise<void> {
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
          this.error = response.message || 'Erro ao atualizar item do contrato'
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
          this.handleCloseItemModal()
        } else {
          this.error = response.message || 'Erro ao adicionar item ao contrato'
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
        this.error = this.isItemEditMode ? 'Erro ao atualizar item do contrato' : 'Erro ao adicionar item ao contrato'
      }
    } finally {
      this.isSubmittingItem = false
    }
  }

  /**
   * @Function - handleDeleteContractItem
   * @description - Delete contract item
   * @author - Vitor Hugo
   * @param - item: ContractItem - Item to delete
   * @returns - Promise<void>
   */
  async handleDeleteContractItem(item: ContractItem): Promise<void> {
    if (!confirm(`Tem certeza que deseja excluir o item "${item.description}"?`)) {
      return
    }

    if (!this.contractId) return

    try {
      const response = await firstValueFrom(
        this.contractService.deleteContractItem(this.contractId, item.id)
      )
      if (response.success) {
        await this.loadContractDetails(this.contractId)
      } else {
        this.error = response.message || 'Erro ao excluir item do contrato'
      }
    } catch (err: any) {
      this.error = err.error?.message || err.message || 'Erro ao excluir item do contrato'
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

    if (!confirm('Tem certeza que deseja fechar este contrato? Esta ação não pode ser desfeita.')) {
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
        this.error = response.message || 'Erro ao fechar contrato'
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else if (err.message) {
        this.error = err.message
      } else {
        this.error = 'Erro ao fechar contrato'
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
    if (!this.contractId) return

    try {
      const blob = await firstValueFrom(
        this.contractService.exportInstallmentsPDF(this.contractId)
      )
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `parcelas-${this.contractId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      this.error = err.error?.message || err.message || 'Erro ao exportar PDF'
    }
  }
}

