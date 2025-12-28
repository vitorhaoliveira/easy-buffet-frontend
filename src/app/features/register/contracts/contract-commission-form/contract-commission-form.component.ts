import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, X, DollarSign } from 'lucide-angular'
import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import type { CommissionDetails, Seller, CommissionType } from '@shared/models/api.types'

@Component({
  selector: 'app-contract-commission-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    LabelComponent
  ],
  templateUrl: './contract-commission-form.component.html'
})
export class ContractCommissionFormComponent implements OnInit {
  readonly XIcon = X
  readonly DollarSignIcon = DollarSign

  @Input() isOpen: boolean = false
  @Input() contractTotalAmount: number = 0
  @Input() currentCommission: CommissionDetails | null = null
  @Input() sellers: Seller[] = []
  @Input() isLoading: boolean = false
  @Output() onClose = new EventEmitter<void>()
  @Output() onSubmit = new EventEmitter<{
    type: CommissionType
    value: number
    sellerId: string | null
    notes: string
  }>()

  commissionForm!: FormGroup
  selectedType: CommissionType = 'fixed'

  constructor(private fb: FormBuilder) {
    this.commissionForm = this.fb.group({
      type: ['fixed', [Validators.required]],
      value: ['', [Validators.required, Validators.min(0.01)]],
      sellerId: [''],
      notes: ['']
    })
  }

  /**
   * @Function - ngOnInit
   * @description - Initialize form with current commission data if editing
   * @author - Vitor Hugo
   * @returns - void
   */
  ngOnInit(): void {
    if (this.currentCommission && this.currentCommission.hasCommission) {
      const commission = this.currentCommission
      this.selectedType = commission.type || 'fixed'
      
      this.commissionForm.patchValue({
        type: commission.type,
        value: commission.type === 'fixed' ? commission.amount : commission.percentage,
        sellerId: commission.seller?.id || '',
        notes: commission.notes || ''
      })
    } else {
      this.commissionForm.patchValue({
        type: 'fixed',
        value: '',
        sellerId: '',
        notes: ''
      })
    }

    // Watch type changes
    this.commissionForm.get('type')?.valueChanges.subscribe(type => {
      this.selectedType = type
      // Reset value when type changes
      this.commissionForm.patchValue({ value: '' }, { emitEvent: false })
      // Update validators
      if (type === 'percentage') {
        this.commissionForm.get('value')?.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(100)
        ])
      } else {
        this.commissionForm.get('value')?.setValidators([
          Validators.required,
          Validators.min(0.01)
        ])
      }
      this.commissionForm.get('value')?.updateValueAndValidity()
    })
  }

  /**
   * @Function - previewAmount
   * @description - Calculate preview commission amount
   * @author - Vitor Hugo
   * @returns - number - Preview amount
   */
  get previewAmount(): number {
    const type = this.commissionForm.get('type')?.value
    const value = parseFloat(this.commissionForm.get('value')?.value || '0')
    
    if (type === 'fixed') {
      return value
    }
    return (this.contractTotalAmount * value) / 100
  }

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
   * @Function - handleClose
   * @description - Close modal and reset form
   * @author - Vitor Hugo
   * @returns - void
   */
  handleClose(): void {
    this.commissionForm.reset({
      type: 'fixed',
      value: '',
      sellerId: '',
      notes: ''
    })
    this.selectedType = 'fixed'
    this.onClose.emit()
  }

  /**
   * @Function - handleSubmit
   * @description - Submit commission form
   * @author - Vitor Hugo
   * @returns - void
   */
  handleSubmit(): void {
    if (this.commissionForm.invalid) {
      Object.keys(this.commissionForm.controls).forEach(key => {
        this.commissionForm.controls[key].markAsTouched()
      })
      return
    }

    const formValue = this.commissionForm.value
    this.onSubmit.emit({
      type: formValue.type,
      value: parseFloat(formValue.value),
      sellerId: formValue.sellerId || null,
      notes: formValue.notes || ''
    })
  }

  /**
   * @Function - hasError
   * @description - Check if form field has error
   * @author - Vitor Hugo
   * @param - fieldName: string - Field name
   * @returns - boolean - True if has error
   */
  hasError(fieldName: string): boolean {
    const field = this.commissionForm.get(fieldName)
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
    const field = this.commissionForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      return 'Campo obrigatório'
    }
    if (field?.hasError('min') && field.touched) {
      if (this.selectedType === 'percentage') {
        return 'Percentual deve ser maior ou igual a zero'
      }
      return 'Valor deve ser maior que zero'
    }
    if (field?.hasError('max') && field.touched) {
      return 'Percentual deve ser menor ou igual a 100'
    }
    return ''
  }
}

