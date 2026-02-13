import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, X } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { InstallmentService } from '@core/services/installment.service'
import { ContractService } from '@core/services/contract.service'
import type { CreateInstallmentRequest, Contract } from '@shared/models/api.types'

@Component({
  selector: 'app-installment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    LabelComponent
  ],
  templateUrl: './installment-form.component.html'
})
export class InstallmentFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly SaveIcon = Save
  readonly XIcon = X

  installmentForm!: FormGroup
  contracts: Contract[] = []
  isLoading: boolean = false
  isLoadingData: boolean = false
  errorMessage: string = ''

  constructor(
    private fb: FormBuilder,
    private installmentService: InstallmentService,
    private contractService: ContractService,
    private router: Router
  ) {
    this.installmentForm = this.fb.group({
      contractId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      dueDate: ['', [Validators.required]],
      notes: ['']
    })
  }

  async ngOnInit(): Promise<void> {
    await this.loadContracts()
  }

  /**
   * @Function - loadContracts
   * @description - Load all contracts for dropdown selection
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadContracts(): Promise<void> {
    try {
      this.isLoadingData = true
      const response = await firstValueFrom(this.contractService.getContracts())
      if (response.success && response.data) {
        this.contracts = response.data as Contract[]
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao carregar eventos'
    } finally {
      this.isLoadingData = false
    }
  }

  /**
   * @Function - handleSubmit
   * @description - Handle form submission to create new installment
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleSubmit(): Promise<void> {
    if (this.installmentForm.invalid) {
      Object.keys(this.installmentForm.controls).forEach(key => {
        this.installmentForm.controls[key].markAsTouched()
      })
      return
    }

    this.isLoading = true
    this.errorMessage = ''

    try {
      const formValue = this.installmentForm.value
      
      const createData: CreateInstallmentRequest = {
        contractId: formValue.contractId,
        amount: parseFloat(formValue.amount),
        dueDate: formValue.dueDate
      }
      
      const response = await firstValueFrom(
        this.installmentService.createInstallment(createData)
      )
      
      if (response.success) {
        this.router.navigate(['/financeiro/parcelas'])
      } else {
        this.errorMessage = 'Erro ao criar parcela'
      }
    } catch (error: any) {
      this.errorMessage = error.error?.message || error.message || 'Erro ao criar parcela'
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - handleCancel
   * @description - Cancel form and navigate back to list
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancel(): void {
    this.router.navigate(['/financeiro/parcelas'])
  }

  /**
   * @Function - getFieldError
   * @description - Get error message for form field
   * @author - Vitor Hugo
   * @param - fieldName: string - Name of the field
   * @returns - string - Error message
   */
  getFieldError(fieldName: string): string {
    const field = this.installmentForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      const fieldLabels: Record<string, string> = {
        contractId: 'Evento',
        amount: 'Valor',
        dueDate: 'Data de vencimento'
      }
      return `${fieldLabels[fieldName] || 'Campo'} é obrigatório`
    }
    if (field?.hasError('min') && field.touched) {
      return 'Valor deve ser maior que zero'
    }
    return ''
  }

  /**
   * @Function - hasError
   * @description - Check if field has error and is touched
   * @author - Vitor Hugo
   * @param - fieldName: string - Name of the field
   * @returns - boolean - True if has error
   */
  hasError(fieldName: string): boolean {
    const field = this.installmentForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }

  /**
   * @Function - getContractLabel
   * @description - Get formatted label for contract dropdown
   * @author - Vitor Hugo
   * @param - contract: Contract - Contract object
   * @returns - string - Formatted label
   */
  getContractLabel(contract: Contract): string {
    const clientName = contract.client?.name || 'Cliente não informado'
    const eventName = contract.event?.name || 'Evento não informado'
    return `${clientName} - ${eventName}`
  }
}


