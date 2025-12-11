import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { LucideAngularModule, Plus, Eye, Trash2, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { SearchBarComponent } from '@shared/components/ui/search-bar/search-bar.component'
import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import {
  TableComponent,
  TableHeaderComponent,
  TableBodyComponent,
  TableRowComponent,
  TableHeadComponent,
  TableCellComponent
} from '@shared/components/ui/table/table.component'
import { InstallmentService } from '@core/services/installment.service'
import type { Installment, PaymentMethod } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

interface InstallmentGroup {
  id: string
  clientName: string
  eventName: string
  totalAmount: number
  paidCount: number
  pendingCount: number
  totalCount: number
  nextDueDate: string | null
  installments: Installment[]
}

@Component({
  selector: 'app-installments-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    SearchBarComponent,
    ConfirmationModalComponent,
    LabelComponent,
    TableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent
  ],
  templateUrl: './installments-list.component.html'
})
export class InstallmentsListComponent implements OnInit {
  readonly PlusIcon = Plus
  readonly EyeIcon = Eye
  readonly Trash2Icon = Trash2
  readonly CheckCircle2Icon = CheckCircle2
  readonly ChevronDownIcon = ChevronDown
  readonly ChevronRightIcon = ChevronRight

  installments: Installment[] = []
  searchTerm: string = ''
  filterStatus: string = 'todos'
  isLoading: boolean = true
  error: string = ''
  
  // Delete modal
  showDeleteModal: boolean = false
  installmentToDelete: Installment | null = null
  isDeleting: boolean = false

  // Payment modal
  showPaymentModal: boolean = false
  installmentToPay: Installment | null = null
  isPaymentProcessing: boolean = false
  paymentForm!: FormGroup

  expandedGroups: Record<string, boolean> = {}

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
    private installmentService: InstallmentService,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      paymentDate: [new Date().toISOString().split('T')[0], [Validators.required]],
      paymentAmount: ['', [Validators.required, Validators.min(0.01)]],
      paymentMethod: [''],
      notes: ['']
    })
  }

  async ngOnInit(): Promise<void> {
    await this.loadInstallments()
  }

  /**
   * @Function - loadInstallments
   * @description - Load installments from API with optional status filter
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadInstallments(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const response = await firstValueFrom(this.installmentService.getInstallments())
      if (response.success && response.data) {
        this.installments = response.data as Installment[]
        this.expandedGroups = {}
      } else {
        this.error = 'Erro ao carregar parcelas'
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar parcelas'
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - filteredInstallments
   * @description - Filter installments by search term and status
   * @author - Vitor Hugo
   * @returns - Installment[] - Filtered installments
   */
  get filteredInstallments(): Installment[] {
    let filtered = this.installments

    // Filter by status
    if (this.filterStatus !== 'todos') {
      filtered = filtered.filter(installment => {
        const status = installment.status.toLowerCase()
        return status === this.filterStatus.toLowerCase()
      })
    }

    // Filter by search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase()
      filtered = filtered.filter(installment => {
        const clientName = installment.contract?.client?.name || ''
        const eventName = installment.contract?.event?.name || ''
        return (
          clientName.toLowerCase().includes(searchLower) ||
          eventName.toLowerCase().includes(searchLower) ||
          installment.installmentNumber.toString().includes(searchLower)
        )
      })
    }

    return filtered
  }

  /**
   * @Function - groupedInstallments
   * @description - Group filtered installments by contract to display as cards
   * @author - Vitor Hugo
   * @returns - InstallmentGroup[] - Array of grouped installments
   */
  get groupedInstallments(): InstallmentGroup[] {
    const groups = new Map<string, InstallmentGroup>()

    this.filteredInstallments.forEach(installment => {
      const groupId = installment.contractId || installment.contract?.event?.name || installment.id
      if (!groups.has(groupId)) {
        groups.set(groupId, {
          id: groupId,
          clientName: installment.contract?.client?.name || 'Cliente não informado',
          eventName: installment.contract?.event?.name || 'Evento não informado',
          totalAmount: 0,
          paidCount: 0,
          pendingCount: 0,
          totalCount: 0,
          nextDueDate: null,
          installments: []
        })
      }

      const group = groups.get(groupId)!
      group.installments.push(installment)
      group.totalAmount += Number(installment.amount) || 0
      group.totalCount += 1

      const status = installment.status.toLowerCase()
      if (status === 'paid' || status === 'pago') {
        group.paidCount += 1
      } else {
        group.pendingCount += 1
      }
    })

    groups.forEach(group => {
      const sortedByDueDate = [...group.installments].sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
      const upcomingInstallment = sortedByDueDate.find(inst => !inst.paymentDate)
      group.nextDueDate = upcomingInstallment?.dueDate || sortedByDueDate[0]?.dueDate || null
    })

    return Array.from(groups.values()).sort((a, b) => {
      if (a.clientName === b.clientName) {
        return a.eventName.localeCompare(b.eventName)
      }
      return a.clientName.localeCompare(b.clientName)
    })
  }

  /**
   * @Function - handleDeleteClick
   * @description - Open delete confirmation modal
   * @author - Vitor Hugo
   * @param - installment: Installment - Installment to delete
   * @returns - void
   */
  handleDeleteClick(installment: Installment): void {
    this.installmentToDelete = installment
    this.showDeleteModal = true
    this.error = ''
  }

  /**
   * @Function - handleConfirmDelete
   * @description - Confirm and execute installment deletion
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmDelete(): Promise<void> {
    if (!this.installmentToDelete) return

    try {
      this.isDeleting = true
      const response = await firstValueFrom(
        this.installmentService.deleteInstallment(this.installmentToDelete.id)
      )
      if (response.success) {
        this.installments = this.installments.filter(
          inst => inst.id !== this.installmentToDelete!.id
        )
        this.showDeleteModal = false
        this.installmentToDelete = null
      } else {
        this.error = response.message || 'Erro ao excluir parcela'
        this.showDeleteModal = false
        this.installmentToDelete = null
      }
    } catch (err: any) {
      if (err.error?.error?.message) {
        this.error = err.error.error.message
      } else if (err.error?.message) {
        this.error = err.error.message
      } else if (err.message) {
        this.error = err.message
      } else {
        this.error = 'Erro ao excluir parcela'
      }
      this.showDeleteModal = false
      this.installmentToDelete = null
    } finally {
      this.isDeleting = false
    }
  }

  /**
   * @Function - handleCancelDelete
   * @description - Cancel delete operation and close modal
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancelDelete(): void {
    this.showDeleteModal = false
    this.installmentToDelete = null
  }

  /**
   * @Function - handlePaymentClick
   * @description - Open payment modal for installment
   * @author - Vitor Hugo
   * @param - installment: Installment - Installment to mark as paid
   * @returns - void
   */
  handlePaymentClick(installment: Installment): void {
    this.installmentToPay = installment
    this.paymentForm.patchValue({
      paymentDate: new Date().toISOString().split('T')[0],
      paymentAmount: installment.amount,
      paymentMethod: installment.paymentMethod || '',
      notes: installment.notes || ''
    })
    this.showPaymentModal = true
    this.error = ''
  }

  /**
   * @Function - handleConfirmPayment
   * @description - Process payment for installment
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleConfirmPayment(): Promise<void> {
    if (!this.installmentToPay || this.paymentForm.invalid) {
      Object.keys(this.paymentForm.controls).forEach(key => {
        this.paymentForm.controls[key].markAsTouched()
      })
      return
    }

    try {
      this.isPaymentProcessing = true
      const formValue = this.paymentForm.value
      const paymentData: any = {
        paymentDate: formValue.paymentDate,
        paymentAmount: parseFloat(formValue.paymentAmount)
      }
      if (formValue.paymentMethod) {
        paymentData.paymentMethod = formValue.paymentMethod
      }
      if (formValue.notes) {
        paymentData.notes = formValue.notes
      }
      const response = await firstValueFrom(
        this.installmentService.payInstallment(this.installmentToPay.id, paymentData)
      )
      
      if (response.success) {
        // Reload installments to get updated data
        await this.loadInstallments()
        this.showPaymentModal = false
        this.installmentToPay = null
        this.paymentForm.reset()
      } else {
        this.error = response.message || 'Erro ao processar pagamento'
      }
    } catch (err: any) {
      this.error = err.error?.message || err.message || 'Erro ao processar pagamento'
    } finally {
      this.isPaymentProcessing = false
    }
  }

  /**
   * @Function - handleCancelPayment
   * @description - Cancel payment operation and close modal
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancelPayment(): void {
    this.showPaymentModal = false
    this.installmentToPay = null
    this.paymentForm.reset()
  }

  /**
   * @Function - toggleGroup
   * @description - Toggle the visibility of a grouped installment card
   * @author - Vitor Hugo
   * @param - groupId: string - Identifier of the group
   * @returns - void
   */
  toggleGroup(groupId: string): void {
    this.expandedGroups[groupId] = !this.expandedGroups[groupId]
  }

  /**
   * @Function - isGroupExpanded
   * @description - Check if a grouped installment card is expanded
   * @author - Vitor Hugo
   * @param - groupId: string - Identifier of the group
   * @returns - boolean - True when group is expanded
   */
  isGroupExpanded(groupId: string): boolean {
    return !!this.expandedGroups[groupId]
  }

  /**
   * @Function - formatDate
   * @description - Format date string to Brazilian format
   * @author - Vitor Hugo
   * @param - dateString: string - Date to format
   * @returns - string - Formatted date
   */
  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }

  /**
   * @Function - formatCurrency
   * @description - Format number to Brazilian currency format
   * @author - Vitor Hugo
   * @param - value: number | string - Value to format
   * @returns - string - Formatted currency
   */
  formatCurrency(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue)
  }

  /**
   * @Function - translateStatus
   * @description - Translate status from English to Portuguese
   * @author - Vitor Hugo
   * @param - status: string - Status to translate
   * @returns - string - Translated status
   */
  translateStatus(status: string): string {
    const translations: Record<string, string> = {
      'pending': 'Pendente',
      'paid': 'Pago',
      'overdue': 'Atrasado',
      'Pendente': 'Pendente',
      'Pago': 'Pago',
      'Atrasado': 'Atrasado'
    }
    return translations[status] || status
  }

  /**
   * @Function - getStatusColor
   * @description - Get CSS classes for status badge
   * @author - Vitor Hugo
   * @param - status: string - Status value
   * @returns - string - CSS classes
   */
  getStatusColor(status: string): string {
    const statusLower = status.toLowerCase()
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'pendente': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'pago': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800',
      'atrasado': 'bg-red-100 text-red-800'
    }
    return colors[statusLower] || 'bg-gray-100 text-gray-800'
  }

  /**
   * @Function - hasError
   * @description - Check if form field has error
   * @author - Vitor Hugo
   * @param - fieldName: string - Field name
   * @returns - boolean - True if has error
   */
  hasError(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }

  /**
   * @Function - getFieldError
   * @description - Get error message for form field
   * @author - Vitor Hugo
   * @param - fieldName: string - Field name
   * @returns - string - Error message
   */
  getFieldError(fieldName: string): string {
    const field = this.paymentForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      return 'Campo obrigatório'
    }
    if (field?.hasError('min') && field.touched) {
      return 'Valor deve ser maior que zero'
    }
    return ''
  }
}


