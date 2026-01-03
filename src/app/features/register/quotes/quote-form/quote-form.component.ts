import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms'
import { LucideAngularModule, ArrowLeft, Save, Plus, Trash2 } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { QuoteService } from '@core/services/quote.service'
import { ClientService } from '@core/services/client.service'
import { PackageService } from '@core/services/package.service'
import { EventService } from '@core/services/event.service'
import type { 
  CreateQuoteRequest, 
  UpdateQuoteRequest, 
  Client,
  Package as PackageType,
  Event
} from '@shared/models/api.types'

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent
  ],
  templateUrl: './quote-form.component.html'
})
export class QuoteFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly SaveIcon = Save
  readonly PlusIcon = Plus
  readonly Trash2Icon = Trash2

  quoteForm!: FormGroup
  isEditing: boolean = false
  quoteId: string | null = null
  isLoading: boolean = false
  isLoadingData: boolean = false
  errorMessage: string = ''

  clients: Client[] = []
  packages: PackageType[] = []
  events: Event[] = []

  private readonly fb = inject(FormBuilder)
  private readonly quoteService = inject(QuoteService)
  private readonly clientService = inject(ClientService)
  private readonly packageService = inject(PackageService)
  private readonly eventService = inject(EventService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)

  constructor() {
    this.quoteForm = this.fb.group({
      clientId: ['', [Validators.required]],
      eventId: [''],
      packageId: ['', [Validators.required]],
      items: this.fb.array([], [Validators.required]),
      validUntilDate: ['', [Validators.required]],
      notes: ['']
    })
  }

  get items(): FormArray {
    return this.quoteForm.get('items') as FormArray
  }

  async ngOnInit(): Promise<void> {
    await this.loadLookupData()
    
    this.quoteId = this.route.snapshot.paramMap.get('id')
    this.isEditing = !!this.quoteId

    if (this.isEditing && this.quoteId) {
      await this.loadQuote(this.quoteId)
    } else {
      this.addItem()
    }
  }

  async loadLookupData(): Promise<void> {
    try {
      this.isLoadingData = true
      const [clientsRes, packagesRes, eventsRes] = await Promise.all([
        firstValueFrom(this.clientService.getClients()),
        firstValueFrom(this.packageService.getPackages()),
        firstValueFrom(this.eventService.getEvents())
      ])

      if (clientsRes.success && clientsRes.data) {
        this.clients = clientsRes.data
      }
      if (packagesRes.success && packagesRes.data) {
        this.packages = packagesRes.data
      }
      if (eventsRes.success && eventsRes.data) {
        this.events = eventsRes.data
      }
    } catch {
      this.errorMessage = 'Erro ao carregar dados de referência'
    } finally {
      this.isLoadingData = false
    }
  }

  async loadQuote(id: string): Promise<void> {
    try {
      this.isLoadingData = true
      const response = await firstValueFrom(this.quoteService.getQuoteById(id))
      if (response.success && response.data) {
        const quote = response.data
        this.quoteForm.patchValue({
          clientId: quote.clientId,
          eventId: quote.eventId || '',
          packageId: quote.packageId,
          validUntilDate: quote.validUntilDate,
          notes: quote.notes || ''
        })

        // Clear existing items and add quote items
        while (this.items.length > 0) {
          this.items.removeAt(0)
        }

        quote.items.forEach(item => {
          this.items.push(
            this.fb.group({
              description: [item.description, [Validators.required]],
              quantity: [item.quantity, [Validators.required, Validators.min(1)]],
              unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
              totalPrice: [item.totalPrice, [Validators.required, Validators.min(0)]]
            })
          )
        })
      }
    } catch {
      this.errorMessage = 'Erro ao carregar orçamento'
    } finally {
      this.isLoadingData = false
    }
  }

  addItem(): void {
    this.items.push(
      this.fb.group({
        description: ['', [Validators.required]],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [0, [Validators.required, Validators.min(0)]],
        totalPrice: [0, [Validators.required, Validators.min(0)]]
      })
    )
  }

  removeItem(index: number): void {
    this.items.removeAt(index)
  }

  calculateItemTotal(index: number): void {
    const item = this.items.at(index)
    const quantity = item.get('quantity')?.value || 0
    const unitPrice = item.get('unitPrice')?.value || 0
    const total = quantity * unitPrice
    item.patchValue({ totalPrice: total }, { emitEvent: false })
  }

  get totalAmount(): number {
    return this.items.value.reduce((sum: number, item: Partial<{ totalPrice: number }>) => sum + (item.totalPrice || 0), 0)
  }

  async handleSubmit(): Promise<void> {
    if (this.quoteForm.invalid || this.items.length === 0) {
      Object.keys(this.quoteForm.controls).forEach(key => {
        this.quoteForm.controls[key].markAsTouched()
      })
      this.items.markAllAsTouched()
      return
    }

    this.isLoading = true
    this.errorMessage = ''

    try {
      const formValue = this.quoteForm.value
      
      if (this.isEditing && this.quoteId) {
        const updateData: UpdateQuoteRequest = {
          clientId: formValue.clientId,
          eventId: formValue.eventId || undefined,
          packageId: formValue.packageId,
          items: formValue.items,
          validUntilDate: formValue.validUntilDate,
          notes: formValue.notes || undefined
        }
        
        const response = await firstValueFrom(
          this.quoteService.updateQuote(this.quoteId, updateData)
        )
        
        if (response.success) {
          this.router.navigate(['/cadastros/orcamentos'])
        } else {
          this.errorMessage = 'Erro ao atualizar orçamento'
        }
      } else {
        const createData: CreateQuoteRequest = {
          clientId: formValue.clientId,
          eventId: formValue.eventId || undefined,
          packageId: formValue.packageId,
          items: formValue.items,
          validUntilDate: formValue.validUntilDate,
          notes: formValue.notes || undefined
        }
        
        const response = await firstValueFrom(
          this.quoteService.createQuote(createData)
        )
        
        if (response.success) {
          this.router.navigate(['/cadastros/orcamentos'])
        } else {
          this.errorMessage = 'Erro ao criar orçamento'
        }
      }
    } catch {
      this.errorMessage = 'Erro ao salvar orçamento'
    } finally {
      this.isLoading = false
    }
  }

  handleCancel(): void {
    this.router.navigate(['/cadastros/orcamentos'])
  }

  getFieldError(fieldName: string): string {
    const field = this.quoteForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      const fieldLabels: Record<string, string> = {
        clientId: 'Cliente',
        packageId: 'Pacote',
        validUntilDate: 'Data de Validade'
      }
      return `${fieldLabels[fieldName] || 'Campo'} é obrigatório`
    }
    return ''
  }

  hasError(fieldName: string): boolean {
    const field = this.quoteForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }
}
