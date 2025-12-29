import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { ChecklistService } from '@core/services/checklist.service'
import type { 
  ChecklistTemplate, 
  ChecklistPhase, 
  ChecklistItemPriority,
  CreateChecklistTemplateRequest,
  UpdateChecklistTemplateRequest 
} from '@shared/models/api.types'

@Component({
  selector: 'app-template-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    LabelComponent
  ],
  templateUrl: './template-form.component.html'
})
export class TemplateFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly SaveIcon = Save
  readonly PlusIcon = Plus
  readonly Trash2Icon = Trash2
  readonly GripVerticalIcon = GripVertical

  templateForm!: FormGroup
  isEditing = false
  templateId: string | null = null
  isLoading = false
  isLoadingData = true
  errorMessage = ''

  eventTypes = [
    'Casamento',
    'Aniversário',
    'Corporativo',
    'Debutante',
    'Formatura',
    'Batizado',
    'Confraternização',
    'Outro'
  ]

  phases: { value: ChecklistPhase; label: string }[] = [
    { value: 'pre-event', label: 'Pré-evento' },
    { value: 'event-day', label: 'Dia do Evento' },
    { value: 'post-event', label: 'Pós-evento' }
  ]

  priorities: { value: ChecklistItemPriority; label: string }[] = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'critical', label: 'Crítica' }
  ]

  responsibleRoles = [
    'Cozinha',
    'Decoração',
    'Logística',
    'Atendimento',
    'Limpeza',
    'Coordenação',
    'Outro'
  ]

  constructor(
    private fb: FormBuilder,
    private checklistService: ChecklistService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm()
  }

  async ngOnInit(): Promise<void> {
    this.templateId = this.route.snapshot.paramMap.get('id')
    this.isEditing = !!this.templateId

    if (this.isEditing && this.templateId) {
      await this.loadTemplate(this.templateId)
    } else {
      // Add one empty item by default for new templates
      this.addItem()
    }
    
    this.isLoadingData = false
  }

  /**
   * @Function - initForm
   * @description - Initializes the template form with validators
   * @author - Vitor Hugo
   * @returns - void
   */
  private initForm(): void {
    this.templateForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      eventType: ['', [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
      isActive: [true],
      items: this.fb.array([])
    })
  }

  /**
   * @Function - items
   * @description - Returns the items FormArray
   * @author - Vitor Hugo
   * @returns - FormArray
   */
  get items(): FormArray {
    return this.templateForm.get('items') as FormArray
  }

  /**
   * @Function - createItemFormGroup
   * @description - Creates a new item form group
   * @author - Vitor Hugo
   * @param - item?: any - Optional item data for editing
   * @returns - FormGroup
   */
  private createItemFormGroup(item?: any): FormGroup {
    return this.fb.group({
      id: [item?.id || null],
      title: [item?.title || '', [Validators.required, Validators.maxLength(255)]],
      description: [item?.description || '', [Validators.maxLength(500)]],
      phase: [item?.phase || 'pre-event', [Validators.required]],
      daysBeforeEvent: [item?.daysBeforeEvent || null],
      priority: [item?.priority || 'medium', [Validators.required]],
      responsibleRole: [item?.responsibleRole || ''],
      sortOrder: [item?.sortOrder || this.items.length]
    })
  }

  /**
   * @Function - addItem
   * @description - Adds a new item to the items array
   * @author - Vitor Hugo
   * @returns - void
   */
  addItem(): void {
    this.items.push(this.createItemFormGroup())
  }

  /**
   * @Function - removeItem
   * @description - Removes an item from the items array
   * @author - Vitor Hugo
   * @param - index: number - Index of item to remove
   * @returns - void
   */
  removeItem(index: number): void {
    if (this.items.length > 0) {
      this.items.removeAt(index)
      // Update sort orders
      this.items.controls.forEach((control, i) => {
        control.get('sortOrder')?.setValue(i)
      })
    }
  }

  /**
   * @Function - moveItem
   * @description - Moves an item up or down in the list
   * @author - Vitor Hugo
   * @param - index: number - Current index
   * @param - direction: 'up' | 'down' - Direction to move
   * @returns - void
   */
  moveItem(index: number, direction: 'up' | 'down'): void {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= this.items.length) return

    const currentItem = this.items.at(index)
    this.items.removeAt(index)
    this.items.insert(newIndex, currentItem)

    // Update sort orders
    this.items.controls.forEach((control, i) => {
      control.get('sortOrder')?.setValue(i)
    })
  }

  /**
   * @Function - loadTemplate
   * @description - Loads template data for editing
   * @author - Vitor Hugo
   * @param - id: string - Template ID
   * @returns - Promise<void>
   */
  async loadTemplate(id: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.checklistService.getTemplateById(id))
      if (response.success && response.data) {
        const template = response.data
        this.templateForm.patchValue({
          name: template.name,
          eventType: template.eventType,
          description: template.description || '',
          isActive: template.isActive
        })

        // Clear existing items and add loaded items
        this.items.clear()
        if (template.items && template.items.length > 0) {
          template.items
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .forEach(item => {
              this.items.push(this.createItemFormGroup(item))
            })
        }
      } else {
        this.errorMessage = 'Erro ao carregar template'
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao carregar template'
    }
  }

  /**
   * @Function - handleSubmit
   * @description - Handles form submission
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleSubmit(): Promise<void> {
    if (this.templateForm.invalid) {
      this.markFormGroupTouched(this.templateForm)
      return
    }

    this.isLoading = true
    this.errorMessage = ''

    try {
      const formValue = this.templateForm.value

      if (this.isEditing && this.templateId) {
        // Update template info
        const updateData: UpdateChecklistTemplateRequest = {
          name: formValue.name,
          eventType: formValue.eventType,
          description: formValue.description || undefined,
          isActive: formValue.isActive
        }

        const response = await firstValueFrom(
          this.checklistService.updateTemplate(this.templateId, updateData)
        )

        if (response.success) {
          // Update items - for simplicity, we'll handle items separately
          // In a real app, you might want to batch these or have a dedicated endpoint
          await this.syncItems(this.templateId, formValue.items)
          this.router.navigate(['/cadastros/checklists/templates'])
        } else {
          this.errorMessage = 'Erro ao atualizar template'
        }
      } else {
        // Create new template with items
        const createData: CreateChecklistTemplateRequest = {
          name: formValue.name,
          eventType: formValue.eventType,
          description: formValue.description || undefined,
          isActive: formValue.isActive,
          items: formValue.items.map((item: any, index: number) => ({
            title: item.title,
            description: item.description || undefined,
            phase: item.phase,
            daysBeforeEvent: item.daysBeforeEvent || undefined,
            priority: item.priority,
            responsibleRole: item.responsibleRole || undefined,
            sortOrder: index
          }))
        }

        const response = await firstValueFrom(
          this.checklistService.createTemplate(createData)
        )

        if (response.success) {
          this.router.navigate(['/cadastros/checklists/templates'])
        } else {
          this.errorMessage = 'Erro ao criar template'
        }
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao salvar template'
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - syncItems
   * @description - Syncs items with the server (add, update, delete)
   * @author - Vitor Hugo
   * @param - templateId: string
   * @param - items: any[]
   * @returns - Promise<void>
   */
  private async syncItems(templateId: string, items: any[]): Promise<void> {
    // This is a simplified implementation
    // In production, you'd want more sophisticated diffing
    for (const item of items) {
      if (item.id) {
        // Update existing item
        await firstValueFrom(
          this.checklistService.updateTemplateItem(templateId, item.id, {
            title: item.title,
            description: item.description || undefined,
            phase: item.phase,
            daysBeforeEvent: item.daysBeforeEvent || undefined,
            priority: item.priority,
            responsibleRole: item.responsibleRole || undefined,
            sortOrder: item.sortOrder
          })
        )
      } else {
        // Add new item
        await firstValueFrom(
          this.checklistService.addTemplateItem(templateId, {
            title: item.title,
            description: item.description || undefined,
            phase: item.phase,
            daysBeforeEvent: item.daysBeforeEvent || undefined,
            priority: item.priority,
            responsibleRole: item.responsibleRole || undefined,
            sortOrder: item.sortOrder
          })
        )
      }
    }
  }

  /**
   * @Function - handleCancel
   * @description - Handles cancel button click
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancel(): void {
    this.router.navigate(['/cadastros/checklists/templates'])
  }

  /**
   * @Function - markFormGroupTouched
   * @description - Marks all controls in a form group as touched
   * @author - Vitor Hugo
   * @param - formGroup: FormGroup
   * @returns - void
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key)
      control?.markAsTouched()
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c)
          }
        })
      }
    })
  }

  /**
   * @Function - hasError
   * @description - Checks if a field has validation errors
   * @author - Vitor Hugo
   * @param - fieldName: string
   * @returns - boolean
   */
  hasError(fieldName: string): boolean {
    const field = this.templateForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }

  /**
   * @Function - hasItemError
   * @description - Checks if an item field has validation errors
   * @author - Vitor Hugo
   * @param - index: number
   * @param - fieldName: string
   * @returns - boolean
   */
  hasItemError(index: number, fieldName: string): boolean {
    const item = this.items.at(index)
    const field = item?.get(fieldName)
    return !!(field?.invalid && field.touched)
  }

  /**
   * @Function - getFieldError
   * @description - Gets error message for a field
   * @author - Vitor Hugo
   * @param - fieldName: string
   * @returns - string
   */
  getFieldError(fieldName: string): string {
    const field = this.templateForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      return 'Campo obrigatório'
    }
    if (field?.hasError('maxlength') && field.touched) {
      return 'Texto muito longo'
    }
    return ''
  }

  /**
   * @Function - getPhaseColor
   * @description - Returns CSS class for phase badge
   * @author - Vitor Hugo
   * @param - phase: ChecklistPhase
   * @returns - string
   */
  getPhaseColor(phase: ChecklistPhase): string {
    const colors: Record<ChecklistPhase, string> = {
      'pre-event': 'bg-blue-100 text-blue-700 border-blue-200',
      'event-day': 'bg-amber-100 text-amber-700 border-amber-200',
      'post-event': 'bg-green-100 text-green-700 border-green-200'
    }
    return colors[phase] || 'bg-gray-100 text-gray-700'
  }

  /**
   * @Function - getPhaseLabel
   * @description - Returns label for a phase value
   * @author - Vitor Hugo
   * @param - phaseValue: ChecklistPhase
   * @returns - string
   */
  getPhaseLabel(phaseValue: ChecklistPhase): string {
    const phase = this.phases.find(p => p.value === phaseValue)
    return phase?.label || 'Fase'
  }
}

