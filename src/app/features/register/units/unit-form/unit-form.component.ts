import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, X } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { SkeletonComponent } from '@shared/components/ui/skeleton/skeleton.component'
import { UnitService } from '@core/services/unit.service'
import type { CreateUnitRequest, UpdateUnitRequest } from '@shared/models/api.types'

@Component({
  selector: 'app-unit-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    LabelComponent,
    SkeletonComponent
  ],
  templateUrl: './unit-form.component.html'
})
export class UnitFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly SaveIcon = Save
  readonly XIcon = X

  unitForm!: FormGroup
  isEditing: boolean = false
  unitId: string | null = null
  isLoading: boolean = false
  isLoadingData: boolean = false
  errorMessage: string = ''

  constructor(
    private fb: FormBuilder,
    private unitService: UnitService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.unitForm = this.fb.group({
      name: ['', [Validators.required]],
      code: [''],
      color: ['#6c757d'],
      zipCode: [''],
      street: [''],
      number: [''],
      complement: [''],
      neighborhood: [''],
      city: [''],
      state: [''],
      notes: [''],
      isActive: [true]
    })
  }

  async ngOnInit(): Promise<void> {
    this.unitId = this.route.snapshot.paramMap.get('id')
    this.isEditing = !!this.unitId

    if (this.isEditing && this.unitId) {
      this.isLoadingData = true
      await this.loadUnit(this.unitId)
      this.isLoadingData = false
    }
  }

  /**
   * @Function - loadUnit
   * @description - Loads unit data for editing
   * @author - Vitor Hugo
   * @param - id: string - The unit ID
   * @returns - Promise<void>
   */
  async loadUnit(id: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.unitService.getUnitById(id))
      if (response.success && response.data) {
        const unit = response.data
        this.unitForm.patchValue({
          name: unit.name,
          code: unit.code || '',
          color: unit.color || '#6c757d',
          zipCode: unit.zipCode || '',
          street: unit.street || '',
          number: unit.number || '',
          complement: unit.complement || '',
          neighborhood: unit.neighborhood || '',
          city: unit.city || '',
          state: unit.state || '',
          notes: unit.notes || '',
          isActive: unit.isActive
        })
      } else {
        this.errorMessage = 'Erro ao carregar unidade'
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao carregar unidade'
    }
  }

  /**
   * @Function - handleSubmit
   * @description - Handles form submission for creating or updating a unit
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleSubmit(): Promise<void> {
    if (this.unitForm.invalid) {
      Object.keys(this.unitForm.controls).forEach(key => {
        this.unitForm.controls[key].markAsTouched()
      })
      return
    }

    this.isLoading = true
    this.errorMessage = ''

    try {
      const formValue = this.unitForm.value

      if (this.isEditing && this.unitId) {
        const updateData: UpdateUnitRequest = {
          name: formValue.name,
          code: formValue.code || undefined,
          color: formValue.color || undefined,
          zipCode: formValue.zipCode || undefined,
          street: formValue.street || undefined,
          number: formValue.number || undefined,
          complement: formValue.complement || undefined,
          neighborhood: formValue.neighborhood || undefined,
          city: formValue.city || undefined,
          state: formValue.state || undefined,
          notes: formValue.notes || undefined,
          isActive: formValue.isActive
        }
        const response = await firstValueFrom(
          this.unitService.updateUnit(this.unitId, updateData)
        )
        if (response.success) {
          this.router.navigate(['/cadastros/unidades'])
        } else {
          this.errorMessage = 'Erro ao atualizar unidade'
        }
      } else {
        const createData: CreateUnitRequest = {
          name: formValue.name,
          code: formValue.code || undefined,
          color: formValue.color || undefined,
          zipCode: formValue.zipCode || undefined,
          street: formValue.street || undefined,
          number: formValue.number || undefined,
          complement: formValue.complement || undefined,
          neighborhood: formValue.neighborhood || undefined,
          city: formValue.city || undefined,
          state: formValue.state || undefined,
          notes: formValue.notes || undefined
        }
        const response = await firstValueFrom(
          this.unitService.createUnit(createData)
        )
        if (response.success) {
          this.router.navigate(['/cadastros/unidades'])
        } else {
          this.errorMessage = 'Erro ao criar unidade'
        }
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao salvar unidade'
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - handleCancel
   * @description - Cancels the form and navigates back to the units list
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancel(): void {
    this.router.navigate(['/cadastros/unidades'])
  }

  /**
   * @Function - hasError
   * @description - Checks if a form field has an error and has been touched
   * @author - Vitor Hugo
   * @param - fieldName: string - The field name to check
   * @returns - boolean
   */
  hasError(fieldName: string): boolean {
    const field = this.unitForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }

  /**
   * @Function - getFieldError
   * @description - Gets the error message for a form field
   * @author - Vitor Hugo
   * @param - fieldName: string - The field name to get error for
   * @returns - string
   */
  getFieldError(fieldName: string): string {
    const field = this.unitForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      return 'Campo obrigatório'
    }
    return ''
  }
}

