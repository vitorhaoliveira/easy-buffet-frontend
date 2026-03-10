import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, X } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { CostService } from '@core/services/cost.service'
import { EventService } from '@core/services/event.service'
import type { CreateCostRequest, UpdateCostRequest, Event, PaginationInfo } from '@shared/models/api.types'

@Component({
  selector: 'app-cost-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
  costId: string | null = null
  isEditing: boolean = false

  readonly eventsPageSize = 20
  eventsPage = 1
  eventsPagination: PaginationInfo | null = null
  eventSearchTerm = ''
  eventDropdownOpen = false
  isLoadingMoreEvents = false

  categories = [
    { value: 'staff', label: 'Equipe' },
    { value: 'food', label: 'Alimentação' },
    { value: 'decoration', label: 'Decoração' },
    { value: 'other', label: 'Outros' }
  ]

  constructor(
    private fb: FormBuilder,
    private costService: CostService,
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute
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
    this.costId = this.route.snapshot.paramMap.get('id')
    this.isEditing = !!this.costId
    await this.loadEvents()
    if (this.isEditing && this.costId) {
      await this.loadCost(this.costId)
    }
  }

  /**
   * @Function - loadCost
   * @description - Load cost by ID and patch form for edit mode
   * @author - Vitor Hugo
   * @param - id: string - Cost ID
   * @returns - Promise<void>
   */
  async loadCost(id: string): Promise<void> {
    try {
      this.isLoadingData = true
      this.errorMessage = ''
      const response = await firstValueFrom(this.costService.getCostById(id))
      if (response.success && response.data) {
        const cost = response.data
        const amount = typeof cost.amount === 'number' ? cost.amount : parseFloat(String(cost.amount))
        this.costForm.patchValue({
          description: cost.description,
          eventId: cost.eventId || '',
          amount: Number.isFinite(amount) ? amount : '',
          category: cost.category,
          notes: cost.notes || ''
        })
        if (cost.eventId && !this.events.some(e => e.id === cost.eventId)) {
          const eventRes = await firstValueFrom(this.eventService.getEventById(cost.eventId))
          if (eventRes.success && eventRes.data) {
            this.events = [eventRes.data as Event, ...this.events]
          }
        }
      } else {
        this.errorMessage = 'Custo não encontrado'
      }
    } catch (err: unknown) {
      this.errorMessage = err instanceof Error ? err.message : 'Erro ao carregar custo'
    } finally {
      this.isLoadingData = false
    }
  }

  /**
   * @Function - loadEvents
   * @description - Load first page of events for dropdown (paginated, same pattern as contract form)
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadEvents(): Promise<void> {
    try {
      this.isLoadingData = true
      this.eventsPage = 1
      const response = await firstValueFrom(
        this.eventService.getEventsPaginated({ page: 1, limit: this.eventsPageSize })
      )
      if (response.success && response.data) {
        this.events = response.data
        this.eventsPagination = response.pagination ?? null
      }
    } catch (err: unknown) {
      this.errorMessage = err instanceof Error ? err.message : 'Erro ao carregar eventos'
    } finally {
      this.isLoadingData = false
    }
  }

  /**
   * @Function - loadMoreEvents
   * @description - Loads next page of events and appends to the list
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async loadMoreEvents(): Promise<void> {
    if (this.isLoadingMoreEvents || !this.eventsPagination || this.eventsPage >= this.eventsPagination.totalPages) return
    this.isLoadingMoreEvents = true
    try {
      const nextPage = this.eventsPage + 1
      const res = await firstValueFrom(
        this.eventService.getEventsPaginated({ page: nextPage, limit: this.eventsPageSize })
      )
      if (res.success && res.data?.length) {
        this.events = [...this.events, ...res.data]
        this.eventsPage = nextPage
        this.eventsPagination = res.pagination ?? this.eventsPagination
      }
    } finally {
      this.isLoadingMoreEvents = false
    }
  }

  get filteredEvents(): Event[] {
    if (!this.eventSearchTerm.trim()) return this.events
    const q = this.eventSearchTerm.toLowerCase().trim()
    return this.events.filter(e => e.name.toLowerCase().includes(q))
  }

  getSelectedEventName(): string {
    const id = this.costForm.get('eventId')?.value
    if (!id) return 'Nenhum (opcional)'
    const e = this.events.find(ev => ev.id === id)
    return e?.name ?? 'Nenhum (opcional)'
  }

  selectEvent(event: Event | null): void {
    this.costForm.patchValue({ eventId: event?.id ?? '' })
    this.eventDropdownOpen = false
    this.eventSearchTerm = ''
  }

  closeEventDropdown(): void {
    this.eventDropdownOpen = false
  }

  /**
   * @Function - handleSubmit
   * @description - Handle form submission to create or update cost
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
      const amount = parseFloat(formValue.amount)

      if (this.isEditing && this.costId) {
        const updateData: UpdateCostRequest = {
          description: formValue.description,
          amount: Number.isFinite(amount) ? amount : undefined,
          category: formValue.category,
          eventId: formValue.eventId || undefined,
          notes: formValue.notes || undefined
        }
        const response = await firstValueFrom(
          this.costService.updateCost(this.costId, updateData)
        )
        if (response.success) {
          this.router.navigate(['/financeiro/custos'])
        } else {
          this.errorMessage = 'Erro ao atualizar custo'
        }
      } else {
        const createData: CreateCostRequest = {
          description: formValue.description,
          amount: Number.isFinite(amount) ? amount : 0,
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
      }
    } catch (error: unknown) {
      const err = error as { error?: { message?: string }; message?: string }
      this.errorMessage = err?.error?.message || err?.message || (this.isEditing ? 'Erro ao atualizar custo' : 'Erro ao criar custo')
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


