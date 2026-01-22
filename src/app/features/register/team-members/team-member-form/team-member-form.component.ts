import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, X } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { LabelComponent } from '@shared/components/ui/label/label.component'
import { PhoneMaskDirective } from '@shared/directives/phone-mask.directive'
import { phoneValidator } from '@shared/validators'
import { TeamMemberService } from '@core/services/team-member.service'
import type { CreateTeamMemberRequest, UpdateTeamMemberRequest } from '@shared/models/api.types'

@Component({
  selector: 'app-team-member-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    LabelComponent,
    PhoneMaskDirective
  ],
  templateUrl: './team-member-form.component.html'
})
export class TeamMemberFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly SaveIcon = Save
  readonly XIcon = X

  teamMemberForm!: FormGroup
  isEditing: boolean = false
  memberId: string | null = null
  isLoading: boolean = false
  isLoadingData: boolean = false
  errorMessage: string = ''

  constructor(
    private fb: FormBuilder,
    private teamMemberService: TeamMemberService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.teamMemberForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      phone: ['', [Validators.required, phoneValidator(), Validators.minLength(10), Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(255)]],
      notes: ['']
    })
  }

  async ngOnInit(): Promise<void> {
    this.memberId = this.route.snapshot.paramMap.get('id')
    this.isEditing = !!this.memberId

    if (this.isEditing && this.memberId) {
      await this.loadTeamMember(this.memberId)
    }
  }

  async loadTeamMember(id: string): Promise<void> {
    try {
      this.isLoadingData = true
      const response = await firstValueFrom(this.teamMemberService.getTeamMemberById(id))
      if (response.success && response.data) {
        const member = response.data
        this.teamMemberForm.patchValue({
          name: member.name,
          email: member.email || '',
          phone: member.phone || '',
          notes: member.notes || ''
        })
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao carregar membro da equipe'
    } finally {
      this.isLoadingData = false
    }
  }

  async handleSubmit(): Promise<void> {
    if (this.teamMemberForm.invalid) {
      Object.keys(this.teamMemberForm.controls).forEach(key => {
        this.teamMemberForm.controls[key].markAsTouched()
      })
      return
    }

    this.isLoading = true
    this.errorMessage = ''

    try {
      const formValue = this.teamMemberForm.value
      
      if (this.isEditing && this.memberId) {
        const updateData: UpdateTeamMemberRequest = {
          name: formValue.name,
          phone: formValue.phone,
          email: formValue.email || null,
          notes: formValue.notes || undefined
        }
        
        const response = await firstValueFrom(
          this.teamMemberService.updateTeamMember(this.memberId, updateData)
        )
        
        if (response.success) {
          this.router.navigate(['/cadastros/equipe'])
        } else {
          this.errorMessage = 'Erro ao atualizar membro da equipe'
        }
      } else {
        const createData: CreateTeamMemberRequest = {
          name: formValue.name,
          phone: formValue.phone,
          email: formValue.email || undefined,
          notes: formValue.notes || undefined
        }
        
        const response = await firstValueFrom(
          this.teamMemberService.createTeamMember(createData)
        )
        
        if (response.success) {
          this.router.navigate(['/cadastros/equipe'])
        } else {
          this.errorMessage = 'Erro ao criar membro da equipe'
        }
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao salvar membro da equipe'
    } finally {
      this.isLoading = false
    }
  }

  handleCancel(): void {
    this.router.navigate(['/cadastros/equipe'])
  }

  getFieldError(fieldName: string): string {
    const field = this.teamMemberForm.get(fieldName)
    if (!field || !field.errors || !field.touched) {
      return ''
    }

    if (field.errors['required']) {
      return 'Este campo é obrigatório'
    }
    if (field.errors['minlength']) {
      return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`
    }
    if (field.errors['maxlength']) {
      return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`
    }
    if (field.errors['email']) {
      return 'Email inválido'
    }
    if (field.errors['phoneInvalid']) {
      return 'Telefone inválido'
    }

    return 'Campo inválido'
  }

  hasError(fieldName: string): boolean {
    const field = this.teamMemberForm.get(fieldName)
    return !!(field && field.invalid && field.touched)
  }
}
