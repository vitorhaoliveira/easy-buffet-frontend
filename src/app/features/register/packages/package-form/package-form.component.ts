import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, X } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { PackageService } from '@core/services/package.service'
import type { CreatePackageRequest, UpdatePackageRequest } from '@shared/models/api.types'

@Component({
  selector: 'app-package-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    LabelComponent
  ],
  templateUrl: './package-form.component.html'
})
export class PackageFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly SaveIcon = Save
  readonly XIcon = X

  packageForm!: FormGroup
  isEditing: boolean = false
  packageId: string | null = null
  isLoading: boolean = false
  isLoadingData: boolean = false
  errorMessage: string = ''

  constructor(
    private fb: FormBuilder,
    private packageService: PackageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.packageForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      description: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      duration: ['', [Validators.required]],
      notes: ['']
    })
  }

  async ngOnInit(): Promise<void> {
    this.packageId = this.route.snapshot.paramMap.get('id')
    this.isEditing = !!this.packageId

    if (this.isEditing && this.packageId) {
      await this.loadPackage(this.packageId)
    }
  }

  async loadPackage(id: string): Promise<void> {
    try {
      this.isLoadingData = true
      const response = await firstValueFrom(this.packageService.getPackageById(id))
      if (response.success && response.data) {
        const pkg = response.data
        this.packageForm.patchValue({
          name: pkg.name,
          type: pkg.type,
          description: pkg.description || '',
          price: pkg.price,
          duration: pkg.duration,
          notes: pkg.notes || ''
        })
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao carregar pacote'
    } finally {
      this.isLoadingData = false
    }
  }

  async handleSubmit(): Promise<void> {
    if (this.packageForm.invalid) {
      Object.keys(this.packageForm.controls).forEach(key => {
        this.packageForm.controls[key].markAsTouched()
      })
      return
    }

    this.isLoading = true
    this.errorMessage = ''

    try {
      const formValue = this.packageForm.value
      const price = parseFloat(formValue.price)
      
      if (this.isEditing && this.packageId) {
        const updateData: UpdatePackageRequest = {
          name: formValue.name,
          type: formValue.type,
          description: formValue.description || undefined,
          price: price,
          duration: formValue.duration,
          notes: formValue.notes || undefined
        }
        
        const response = await firstValueFrom(
          this.packageService.updatePackage(this.packageId, updateData)
        )
        
        if (response.success) {
          this.router.navigate(['/cadastros/pacotes'])
        } else {
          this.errorMessage = 'Erro ao atualizar pacote'
        }
      } else {
        const createData: CreatePackageRequest = {
          name: formValue.name,
          type: formValue.type,
          description: formValue.description || undefined,
          price: price,
          duration: formValue.duration,
          notes: formValue.notes || undefined
        }
        
        const response = await firstValueFrom(
          this.packageService.createPackage(createData)
        )
        
        if (response.success) {
          this.router.navigate(['/cadastros/pacotes'])
        } else {
          this.errorMessage = 'Erro ao criar pacote'
        }
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao salvar pacote'
    } finally {
      this.isLoading = false
    }
  }

  handleCancel(): void {
    this.router.navigate(['/cadastros/pacotes'])
  }

  hasError(fieldName: string): boolean {
    const field = this.packageForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }

  getFieldError(fieldName: string): string {
    const field = this.packageForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      return 'Campo obrigatório'
    }
    if (field?.hasError('min') && field.touched) {
      return 'Valor deve ser maior que zero'
    }
    return ''
  }
}

