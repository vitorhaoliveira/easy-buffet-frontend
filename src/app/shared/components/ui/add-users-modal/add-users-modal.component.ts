import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, Users, X } from 'lucide-angular'
import { ButtonComponent } from '../button/button.component'
import { LabelComponent } from '../label/label.component'

@Component({
  selector: 'app-add-users-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ButtonComponent, LabelComponent],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="handleBackdropClick($event)">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b">
            <div class="flex items-center space-x-3">
              <div class="p-2 rounded-full bg-blue-100">
                <lucide-icon [img]="UsersIcon" class="h-5 w-5 text-blue-600"></lucide-icon>
              </div>
              <h2 class="text-lg font-semibold text-gray-900">Adicionar Usuários Extras</h2>
            </div>
            <button 
              appButton
              variant="ghost"
              size="sm"
              (click)="onClose.emit()"
              [disabled]="loading"
            >
              <lucide-icon [img]="XIcon" class="h-4 w-4"></lucide-icon>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-4">
            <p class="text-sm text-gray-600">
              Adicione mais usuários à sua assinatura. 
              @if (isLifetimePlan) {
                O limite será atualizado imediatamente (plano lifetime).
              } @else {
                O limite será atualizado após o pagamento via Stripe.
              }
            </p>

            <form [formGroup]="form" (ngSubmit)="handleSubmit()" class="space-y-4">
              <!-- Quantity Input -->
              <div class="space-y-2">
                <label appLabel htmlFor="quantity">Quantidade de Usuários</label>
                <input
                  type="number"
                  id="quantity"
                  formControlName="quantity"
                  min="1"
                  max="100"
                  placeholder="Digite a quantidade"
                  class="flex min-h-[44px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
                @if (form.get('quantity')?.hasError('required') && form.get('quantity')?.touched) {
                  <p class="text-sm text-red-500">Quantidade é obrigatória</p>
                }
                @if (form.get('quantity')?.hasError('min') && form.get('quantity')?.touched) {
                  <p class="text-sm text-red-500">Mínimo de 1 usuário</p>
                }
                @if (form.get('quantity')?.hasError('max') && form.get('quantity')?.touched) {
                  <p class="text-sm text-red-500">Máximo de 100 usuários</p>
                }
              </div>

              <!-- Quick Select Buttons -->
              <div class="space-y-2">
                <label appLabel>Ou selecione rapidamente:</label>
                <div class="grid grid-cols-4 gap-2">
                  @for (option of quickOptions; track option) {
                    <button
                      type="button"
                      (click)="selectQuantity(option)"
                      [class]="'px-3 py-2 rounded-lg border text-sm font-medium transition-colors ' + (form.get('quantity')?.value === option ? 'bg-primary-500 text-white border-primary-500' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')"
                    >
                      {{ option }}
                    </button>
                  }
                </div>
              </div>

              <!-- Price Info -->
              @if (form.get('quantity')?.value && form.get('quantity')?.valid && !isLifetimePlan) {
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Preço por usuário:</span>
                      <span class="font-medium text-gray-900">R$ 79,00/mês</span>
                    </div>
                    <div class="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
                      <span class="text-gray-900">Total:</span>
                      <span class="text-primary-600">R$ {{ getTotalPrice() }},00/mês</span>
                    </div>
                  </div>
                </div>
              }
              
              @if (form.get('quantity')?.value && form.get('quantity')?.valid && isLifetimePlan) {
                <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-sm text-green-800 font-medium">
                      Plano Lifetime: Usuários serão adicionados sem custo adicional
                    </p>
                  </div>
                </div>
              }

              <!-- Actions -->
              <div class="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  appButton
                  type="button"
                  variant="outline"
                  (click)="onClose.emit()"
                  [disabled]="loading"
                >
                  Cancelar
                </button>
                <button
                  appButton
                  type="submit"
                  [disabled]="form.invalid || loading"
                  class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white"
                >
                  {{ loading ? 'Processando...' : 'Adicionar Usuários' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `
})
export class AddUsersModalComponent implements OnInit {
  @Input() isOpen: boolean = false
  @Input() loading: boolean = false
  @Input() isLifetimePlan: boolean = false
  
  @Output() onClose = new EventEmitter<void>()
  @Output() onAdd = new EventEmitter<number>()

  readonly UsersIcon = Users
  readonly XIcon = X
  readonly quickOptions = [1, 2, 5, 10]

  form!: FormGroup

  constructor(private fb: FormBuilder) {}

  /**
   * @Function - ngOnInit
   * @description - Initializes the form when component loads
   * @author - Vitor Hugo
   * @returns - void
   */
  ngOnInit(): void {
    this.form = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(100)]]
    })
  }

  /**
   * @Function - selectQuantity
   * @description - Sets the quantity value from quick select buttons
   * @author - Vitor Hugo
   * @param - quantity: number - Quantity to select
   * @returns - void
   */
  selectQuantity(quantity: number): void {
    this.form.patchValue({ quantity })
  }

  /**
   * @Function - getTotalPrice
   * @description - Calculates total price based on quantity
   * @author - Vitor Hugo
   * @returns - number - Total price
   */
  getTotalPrice(): number {
    const quantity = this.form.get('quantity')?.value || 0
    return quantity * 79
  }

  /**
   * @Function - handleSubmit
   * @description - Handles form submission and emits quantity
   * @author - Vitor Hugo
   * @returns - void
   */
  handleSubmit(): void {
    if (this.form.valid) {
      const quantity = this.form.get('quantity')?.value
      this.onAdd.emit(quantity)
    }
  }

  /**
   * @Function - handleBackdropClick
   * @description - Closes modal when clicking outside
   * @author - Vitor Hugo
   * @param - event: Event - Click event
   * @returns - void
   */
  handleBackdropClick(event: Event): void {
    if (event.target === event.currentTarget && !this.loading) {
      this.onClose.emit()
    }
  }
}

