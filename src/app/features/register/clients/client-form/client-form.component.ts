import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, X } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { PhoneMaskDirective } from '@shared/directives/phone-mask.directive'
import { CpfMaskDirective } from '@shared/directives/cpf-mask.directive'
import { phoneValidator, cpfValidator } from '@shared/validators'
import { ClientService } from '@core/services/client.service'
import type { CreateClientRequest, UpdateClientRequest } from '@shared/models/api.types'

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    LabelComponent,
    PhoneMaskDirective,
    CpfMaskDirective
  ],
  templateUrl: './client-form.component.html'
})
export class ClientFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly SaveIcon = Save
  readonly XIcon = X

  clientForm!: FormGroup
  isEditing: boolean = false
  clientId: string | null = null
  isLoading: boolean = false
  isLoadingData: boolean = false
  errorMessage: string = ''

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, phoneValidator()]],
      cpf: ['', [cpfValidator()]],
      address: ['']
    })
  }

  async ngOnInit(): Promise<void> {
    this.clientId = this.route.snapshot.paramMap.get('id')
    this.isEditing = !!this.clientId

    if (this.isEditing && this.clientId) {
      await this.loadClient(this.clientId)
    }
  }

  async loadClient(id: string): Promise<void> {
    try {
      this.isLoadingData = true
      const response = await firstValueFrom(this.clientService.getClientById(id))
      if (response.success && response.data) {
        const client = response.data
        this.clientForm.patchValue({
          name: client.name,
          email: client.email || '',
          phone: client.phone || '',
          cpf: client.cpf || '',
          address: client.address || ''
        })
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao carregar cliente'
    } finally {
      this.isLoadingData = false
    }
  }

  async handleSubmit(): Promise<void> {
    if (this.clientForm.invalid) {
      Object.keys(this.clientForm.controls).forEach(key => {
        this.clientForm.controls[key].markAsTouched()
      })
      return
    }

    this.isLoading = true
    this.errorMessage = ''

    try {
      const formValue = this.clientForm.value
      
      if (this.isEditing && this.clientId) {
        const updateData: UpdateClientRequest = {
          name: formValue.name,
          email: formValue.email || undefined,
          phone: formValue.phone || undefined,
          cpf: formValue.cpf || undefined,
          address: formValue.address || undefined
        }
        
        const response = await firstValueFrom(
          this.clientService.updateClient(this.clientId, updateData)
        )
        
        if (response.success) {
          this.router.navigate(['/cadastros/clientes'])
        } else {
          this.errorMessage = 'Erro ao atualizar cliente'
        }
      } else {
        const createData: CreateClientRequest = {
          name: formValue.name,
          email: formValue.email || undefined,
          phone: formValue.phone || undefined,
          cpf: formValue.cpf || undefined,
          address: formValue.address || undefined
        }
        
        const response = await firstValueFrom(
          this.clientService.createClient(createData)
        )
        
        if (response.success) {
          this.router.navigate(['/cadastros/clientes'])
        } else {
          this.errorMessage = 'Erro ao criar cliente'
        }
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao salvar cliente'
    } finally {
      this.isLoading = false
    }
  }

  handleCancel(): void {
    this.router.navigate(['/cadastros/clientes'])
  }

  getFieldError(fieldName: string): string {
    const field = this.clientForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      const fieldLabels: Record<string, string> = {
        name: 'Nome',
        email: 'Email',
        phone: 'Telefone',
        cpf: 'CPF'
      }
      return `${fieldLabels[fieldName] || 'Campo'} é obrigatório`
    }
    if (field?.hasError('email') && field.touched) {
      return 'Email inválido'
    }
    if (field?.hasError('invalidPhone') && field.touched) {
      return 'Telefone inválido. Use o formato (XX) XXXXX-XXXX'
    }
    if (field?.hasError('invalidCpf') && field.touched) {
      return 'CPF inválido. Use o formato 000.000.000-00'
    }
    return ''
  }

  hasError(fieldName: string): boolean {
    const field = this.clientForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }
}

