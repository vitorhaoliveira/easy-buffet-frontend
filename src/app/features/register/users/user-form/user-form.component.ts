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
import { UserService } from '@core/services/user.service'
import type { CreateUserRequest, UpdateUserRequest, UserPermissions } from '@shared/models/api.types'

@Component({
  selector: 'app-user-form',
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
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly SaveIcon = Save
  readonly XIcon = X

  userForm!: FormGroup
  permissionsForm!: FormGroup
  isEditing: boolean = false
  userId: string | null = null
  isLoading: boolean = false
  isLoadingData: boolean = false
  errorMessage: string = ''

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForms()
  }

  /**
   * @Function - initializeForms
   * @description - Initializes the user form and permissions form with validators
   * @author - Vitor Hugo
   * @returns - void
   */
  private initializeForms(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', []],
      phone: ['', [phoneValidator()]],
      role: ['Auxiliar', [Validators.required]],
      status: ['Ativo', [Validators.required]]
    })

    this.permissionsForm = this.fb.group({
      dashboardView: [true],
      cadastrosCreate: [false],
      cadastrosEdit: [false],
      cadastrosDelete: [false],
      cadastrosView: [true],
      financeiroCreate: [false],
      financeiroEdit: [false],
      financeiroDelete: [false],
      financeiroView: [false],
      relatoriosView: [false],
      relatoriosExport: [false]
    })
  }

  /**
   * @Function - ngOnInit
   * @description - Lifecycle hook that runs when component initializes
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async ngOnInit(): Promise<void> {
    this.userId = this.route.snapshot.paramMap.get('id')
    this.isEditing = !!this.userId

    if (this.isEditing && this.userId) {
      this.userForm.get('password')?.clearValidators()
      this.userForm.get('password')?.updateValueAndValidity()
      await this.loadUser(this.userId)
    } else {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)])
      this.userForm.get('password')?.updateValueAndValidity()
    }
  }

  /**
   * @Function - loadUser
   * @description - Loads user data from API and populates the form
   * @author - Vitor Hugo
   * @param - id: string - User ID to load
   * @returns - Promise<void>
   */
  async loadUser(id: string): Promise<void> {
    try {
      this.isLoadingData = true
      const response = await firstValueFrom(this.userService.getUserById(id))
      if (response.success && response.data) {
        const user = response.data
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          status: user.status
        })

        if (user.permissions) {
          this.permissionsForm.patchValue({
            dashboardView: user.permissions.dashboard.view,
            cadastrosCreate: user.permissions.cadastros.create,
            cadastrosEdit: user.permissions.cadastros.edit,
            cadastrosDelete: user.permissions.cadastros.delete,
            cadastrosView: user.permissions.cadastros.view,
            financeiroCreate: user.permissions.financeiro.create,
            financeiroEdit: user.permissions.financeiro.edit,
            financeiroDelete: user.permissions.financeiro.delete,
            financeiroView: user.permissions.financeiro.view,
            relatoriosView: user.permissions.relatorios.view,
            relatoriosExport: user.permissions.relatorios.export
          })
        }
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao carregar usuário'
    } finally {
      this.isLoadingData = false
    }
  }

  /**
   * @Function - getPermissionsObject
   * @description - Converts form values to UserPermissions object
   * @author - Vitor Hugo
   * @returns - UserPermissions - Structured permissions object
   */
  private getPermissionsObject(): UserPermissions {
    const perms = this.permissionsForm.value
    return {
      dashboard: {
        view: perms.dashboardView
      },
      cadastros: {
        create: perms.cadastrosCreate,
        edit: perms.cadastrosEdit,
        delete: perms.cadastrosDelete,
        view: perms.cadastrosView
      },
      financeiro: {
        create: perms.financeiroCreate,
        edit: perms.financeiroEdit,
        delete: perms.financeiroDelete,
        view: perms.financeiroView
      },
      relatorios: {
        view: perms.relatoriosView,
        export: perms.relatoriosExport
      }
    }
  }

  /**
   * @Function - handleSubmit
   * @description - Handles form submission for creating or updating a user
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  async handleSubmit(): Promise<void> {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.controls[key].markAsTouched()
      })
      return
    }

    this.isLoading = true
    this.errorMessage = ''

    try {
      const formValue = this.userForm.value
      
      if (this.isEditing && this.userId) {
        const updateData: UpdateUserRequest = {
          name: formValue.name,
          email: formValue.email,
          phone: formValue.phone || undefined,
          status: formValue.status
        }
        
        const response = await firstValueFrom(
          this.userService.updateUser(this.userId, updateData)
        )
        
        if (response.success) {
          const permissions = this.getPermissionsObject()
          await firstValueFrom(
            this.userService.updateUserPermissions(this.userId, { permissions })
          )
          this.router.navigate(['/cadastros/usuarios'])
        } else {
          this.errorMessage = 'Erro ao atualizar usuário'
        }
      } else {
        const createData: CreateUserRequest = {
          name: formValue.name,
          email: formValue.email,
          password: formValue.password,
          phone: formValue.phone || undefined,
          role: formValue.role,
          permissions: this.getPermissionsObject()
        }
        
        const response = await firstValueFrom(
          this.userService.createUser(createData)
        )
        
        if (response.success) {
          this.router.navigate(['/cadastros/usuarios'])
        } else {
          this.errorMessage = 'Erro ao criar usuário'
        }
      }
    } catch (error: any) {
      if (error.error?.error?.message) {
        this.errorMessage = error.error.error.message
      } else if (error.error?.message) {
        this.errorMessage = error.error.message
      } else {
        this.errorMessage = error.message || 'Erro ao salvar usuário'
      }
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - handleCancel
   * @description - Navigates back to users list
   * @author - Vitor Hugo
   * @returns - void
   */
  handleCancel(): void {
    this.router.navigate(['/cadastros/usuarios'])
  }

  /**
   * @Function - getFieldError
   * @description - Returns the error message for a form field
   * @author - Vitor Hugo
   * @param - fieldName: string - Name of the form field
   * @returns - string - Error message or empty string
   */
  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      const fieldLabels: Record<string, string> = {
        name: 'Nome',
        email: 'Email',
        password: 'Senha',
        phone: 'Telefone',
        role: 'Função'
      }
      return `${fieldLabels[fieldName] || 'Campo'} é obrigatório`
    }
    if (field?.hasError('email') && field.touched) {
      return 'Email inválido'
    }
    if (field?.hasError('minlength') && field.touched) {
      if (fieldName === 'password') {
        return 'Senha deve ter pelo menos 6 caracteres'
      }
      return 'Nome deve ter pelo menos 3 caracteres'
    }
    if (field?.hasError('invalidPhone') && field.touched) {
      return 'Telefone inválido. Use o formato (XX) XXXXX-XXXX'
    }
    return ''
  }

  /**
   * @Function - hasError
   * @description - Checks if a form field has an error and has been touched
   * @author - Vitor Hugo
   * @param - fieldName: string - Name of the form field
   * @returns - boolean - True if field has error and is touched
   */
  hasError(fieldName: string): boolean {
    const field = this.userForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }

  /**
   * @Function - setRolePermissions
   * @description - Sets default permissions based on selected role
   * @author - Vitor Hugo
   * @param - event: Event - Change event from role select
   * @returns - void
   */
  setRolePermissions(event: Event): void {
    const role = (event.target as HTMLSelectElement).value
    
    if (role === 'Administrador') {
      this.permissionsForm.patchValue({
        dashboardView: true,
        cadastrosCreate: true,
        cadastrosEdit: true,
        cadastrosDelete: true,
        cadastrosView: true,
        financeiroCreate: true,
        financeiroEdit: true,
        financeiroDelete: true,
        financeiroView: true,
        relatoriosView: true,
        relatoriosExport: true
      })
    } else {
      this.permissionsForm.patchValue({
        dashboardView: true,
        cadastrosCreate: false,
        cadastrosEdit: false,
        cadastrosDelete: false,
        cadastrosView: true,
        financeiroCreate: false,
        financeiroEdit: false,
        financeiroDelete: false,
        financeiroView: false,
        relatoriosView: false,
        relatoriosExport: false
      })
    }
  }
}

