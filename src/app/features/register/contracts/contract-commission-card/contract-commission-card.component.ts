import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LucideAngularModule, DollarSign, Edit, CheckCircle2, Clock, X, Trash2 } from 'lucide-angular'
import { ButtonComponent } from '@shared/components/ui/button/button.component'
import type { CommissionDetails } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-contract-commission-card',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ButtonComponent
  ],
  templateUrl: './contract-commission-card.component.html'
})
export class ContractCommissionCardComponent {
  readonly DollarSignIcon = DollarSign
  readonly EditIcon = Edit
  readonly CheckCircle2Icon = CheckCircle2
  readonly ClockIcon = Clock
  readonly XIcon = X
  readonly Trash2Icon = Trash2

  @Input() commission: CommissionDetails | null = null
  @Input() isLoading: boolean = false
  @Output() onEdit = new EventEmitter<void>()
  @Output() onPay = new EventEmitter<void>()
  @Output() onUnpay = new EventEmitter<void>()
  @Output() onRemove = new EventEmitter<void>()

  /**
   * @Function - formatCurrency
   * @description - Formats number to Brazilian currency format
   * @author - Vitor Hugo
   * @param - value: number - Value to format
   * @returns - string - Formatted currency string
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  /**
   * @Function - formatDate
   * @description - Formats ISO date string to Brazilian date format
   * @author - Vitor Hugo
   * @param - dateString: string - ISO date string
   * @returns - string - Formatted date in Brazilian format
   */
  formatDate(dateString: string | null): string {
    if (!dateString) return ''
    return formatDateBR(dateString)
  }

  /**
   * @Function - handleEdit
   * @description - Emits edit event
   * @author - Vitor Hugo
   * @returns - void
   */
  handleEdit(): void {
    this.onEdit.emit()
  }

  /**
   * @Function - handlePay
   * @description - Emits pay event
   * @author - Vitor Hugo
   * @returns - void
   */
  handlePay(): void {
    this.onPay.emit()
  }

  /**
   * @Function - handleUnpay
   * @description - Emits unpay event
   * @author - Vitor Hugo
   * @returns - void
   */
  handleUnpay(): void {
    this.onUnpay.emit()
  }

  /**
   * @Function - handleRemove
   * @description - Emits remove event
   * @author - Vitor Hugo
   * @returns - void
   */
  handleRemove(): void {
    this.onRemove.emit()
  }
}

