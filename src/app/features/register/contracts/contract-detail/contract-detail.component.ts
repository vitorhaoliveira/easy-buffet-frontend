import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute, RouterModule } from '@angular/router'
import { LucideAngularModule, ArrowLeft, Edit, FileText, User, Calendar, DollarSign, CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { 
  TableComponent, 
  TableHeaderComponent, 
  TableBodyComponent, 
  TableRowComponent, 
  TableHeadComponent, 
  TableCellComponent 
} from '@shared/components/ui/table/table.component'
import { ContractService } from '@core/services/contract.service'
import type { Contract, Installment } from '@shared/models/api.types'
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
    LucideAngularModule,
    ButtonComponent,
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

  contract: ContractWithDetails | null = null
  contractId: string | null = null
  isLoading: boolean = true
  error: string = ''

  constructor(
    private contractService: ContractService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

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
   * @description - Calculates total amount paid from installments
   * @author - Vitor Hugo
   * @returns - number - Total paid amount
   */
  getTotalPaid(): number {
    if (!this.contract?.installments) return 0
    return this.contract.installments
      .filter(i => i.status.toLowerCase() === 'paid' || i.status.toLowerCase() === 'pago')
      .reduce((sum, i) => {
        const amount = typeof i.paymentAmount === 'string' 
          ? parseFloat(i.paymentAmount) 
          : (i.paymentAmount || 0)
        return sum + amount
      }, 0)
  }

  /**
   * @Function - getRemainingAmount
   * @description - Calculates remaining amount to be paid
   * @author - Vitor Hugo
   * @returns - number - Remaining amount
   */
  getRemainingAmount(): number {
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
}

