import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, X } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { SkeletonComponent } from '@shared/components/ui/skeleton/skeleton.component'
import { PhoneMaskDirective } from '@shared/directives/phone-mask.directive'
import { phoneValidator } from '@shared/validators'
import { SellerService } from '@core/services/seller.service'
import type { CreateSellerRequest, UpdateSellerRequest } from '@shared/models/api.types'

@Component({
  selector: 'app-seller-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    LabelComponent,
    SkeletonComponent,
    PhoneMaskDirective
  ],
  templateUrl: './seller-form.component.html'
})
export class SellerFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly SaveIcon = Save
  readonly XIcon = X

  sellerForm!: FormGroup
  isEditing: boolean = false
  sellerId: string | null = null
  isLoading: boolean = false
  isLoadingData: boolean = false
  errorMessage: string = ''

  constructor(
    private fb: FormBuilder,
    private sellerService: SellerService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.sellerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phone: ['', [Validators.required, phoneValidator()]],
      notes: ['']
    })
  }

  async ngOnInit(): Promise<void> {
    this.sellerId = this.route.snapshot.paramMap.get('id')
    this.isEditing = !!this.sellerId

    if (this.isEditing && this.sellerId) {
      await this.loadSeller(this.sellerId)
    }
  }

  async loadSeller(id: string): Promise<void> {
    try {
      this.isLoadingData = true
      const response = await firstValueFrom(this.sellerService.getSellerById(id))
      if (response.success && response.data) {
        const seller = response.data
        this.sellerForm.patchValue({
          name: seller.name,
          email: seller.email,
          phone: seller.phone,
          notes: seller.notes || ''
        })
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao carregar vendedor(a)'
    } finally {
      this.isLoadingData = false
    }
  }

  async handleSubmit(): Promise<void> {
    if (this.sellerForm.invalid) {
      Object.keys(this.sellerForm.controls).forEach(key => {
        this.sellerForm.controls[key].markAsTouched()
      })
      return
    }

    this.isLoading = true
    this.errorMessage = ''

    try {
      const formValue = this.sellerForm.value
      
      if (this.isEditing && this.sellerId) {
        const updateData: UpdateSellerRequest = {
          name: formValue.name,
          email: formValue.email,
          phone: formValue.phone,
          notes: formValue.notes || undefined
        }
        
        const response = await firstValueFrom(
          this.sellerService.updateSeller(this.sellerId, updateData)
        )
        
        if (response.success) {
          this.router.navigate(['/cadastros/vendedoras'])
        } else {
          this.errorMessage = 'Erro ao atualizar vendedor(a)'
        }
      } else {
        const createData: CreateSellerRequest = {
          name: formValue.name,
          email: formValue.email,
          phone: formValue.phone,
          notes: formValue.notes || undefined
        }
        
        const response = await firstValueFrom(
          this.sellerService.createSeller(createData)
        )
        
        if (response.success) {
          this.router.navigate(['/cadastros/vendedoras'])
        } else {
          this.errorMessage = 'Erro ao criar vendedor(a)'
        }
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao salvar vendedor(a)'
    } finally {
      this.isLoading = false
    }
  }

  handleCancel(): void {
    this.router.navigate(['/cadastros/vendedoras'])
  }

  getFieldError(fieldName: string): string {
    const field = this.sellerForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      const fieldLabels: Record<string, string> = {
        name: 'Nome',
        email: 'Email',
        phone: 'Telefone'
      }
      return `${fieldLabels[fieldName] || 'Campo'} é obrigatório`
    }
    if (field?.hasError('email') && field.touched) {
      return 'Email inválido'
    }
    if (field?.hasError('minlength') && field.touched) {
      return 'Nome deve ter no mínimo 3 caracteres'
    }
    if (field?.hasError('maxlength') && field.touched) {
      return 'Campo excede o tamanho máximo permitido'
    }
    if (field?.hasError('invalidPhone') && field.touched) {
      return 'Telefone inválido. Use o formato (XX) XXXXX-XXXX'
    }
    return ''
  }

  hasError(fieldName: string): boolean {
    const field = this.sellerForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }
}

