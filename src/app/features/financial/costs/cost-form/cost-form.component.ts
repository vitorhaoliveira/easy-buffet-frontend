import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, X } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { CostService } from '@core/services/cost.service'
import { EventService } from '@core/services/event.service'
import type { CreateCostRequest, Event } from '@shared/models/api.types'

@Component({
  selector: 'app-cost-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    LabelComponent
  ],
  templateUrl: './cost-form.component.html'
})
export class CostFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly SaveIcon = Save
  readonly XIcon = X

  costForm!: FormGroup
  events: Event[] = []
  isLoading: boolean = false
  isLoadingData: boolean = false
  errorMessage: string = ''

  categories = [
    { value: 'staff', label: 'Pessoal' },
    { value: 'food', label: 'Alimentação' },
    { value: 'decoration', label: 'Decoração' },
    { value: 'other', label: 'Outros' }
  ]

  constructor(
    private fb: FormBuilder,
    private costService: CostService,
    private eventService: EventService,
    private router: Router
  ) {
    this.costForm = this.fb.group({
      description: ['', [Validators.required]],
      eventId: [''],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', [Validators.required]],
      notes: ['']
    })
  }

  async ngOnInit(): Promise<void> {
    await this.loadEvents()
  }

  /**
   * @Function - loadEvents
   * @description - Load all events for dropdown selection
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadEvents(): Promise<void> {
    try {
      this.isLoadingData = true
      const response = await firstValueFrom(this.eventService.getEvents())
      if (response.success && response.data) {
        this.events = response.data as Event[]
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao carregar eventos'
    } finally {
      this.isLoadingData = false
    }
  }

  /**
   * @Function - handleSubmit
   * @description - Handle form submission to create new cost
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleSubmit(): Promise<void> {
    if (this.costForm.invalid) {
      Object.keys(this.costForm.controls).forEach(key => {
        this.costForm.controls[key].markAsTouched()
      })
      return
    }

    this.isLoading = true
    this.errorMessage = ''

    try {
      const formValue = this.costForm.value
      
      const createData: CreateCostRequest = {
        description: formValue.description,
        amount: parseFloat(formValue.amount),
        category: formValue.category,
        eventId: formValue.eventId || undefined,
        notes: formValue.notes || undefined
      }
      
      const response = await firstValueFrom(
        this.costService.createCost(createData)
      )
      
      if (response.success) {
        this.router.navigate(['/financeiro/custos'])
      } else {
        this.errorMessage = 'Erro ao criar custo'
      }
    } catch (error: any) {
      this.errorMessage = error.error?.message || error.message || 'Erro ao criar custo'
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
    this.router.navigate(['/financeiro/custos'])
  }

  /**
   * @Function - getFieldError
   * @description - Get error message for form field
   * @author - Vitor Hugo
   * @param - fieldName: string - Name of the field
   * @returns - string - Error message
   */
  getFieldError(fieldName: string): string {
    const field = this.costForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      const fieldLabels: Record<string, string> = {
        description: 'Descrição',
        amount: 'Valor',
        category: 'Categoria'
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
    const field = this.costForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }
}


