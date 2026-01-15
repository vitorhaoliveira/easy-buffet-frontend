import { Component, OnInit, OnDestroy, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucideAngularModule, CheckCircle, AlertCircle, Calendar, Users, MapPin } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { QuoteService } from '@core/services/quote.service'
import { ToastService } from '@core/services/toast.service'
import type { Quote, AcceptQuoteRequest } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'
import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'

@Component({
  selector: 'app-proposal-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ConfirmationModalComponent
  ],
  templateUrl: './proposal-page.component.html',
  styleUrls: ['./proposal-page.component.css']
})
export class ProposalPageComponent implements OnInit, OnDestroy {
  readonly CheckCircleIcon = CheckCircle
  readonly AlertCircleIcon = AlertCircle
  readonly CalendarIcon = Calendar
  readonly UsersIcon = Users
  readonly MapPinIcon = MapPin

  private readonly quoteService = inject(QuoteService)
  private readonly toastService = inject(ToastService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly fb = inject(FormBuilder)

  quote: Quote | null = null
  isLoading: boolean = true
  isLoadingQuote: boolean = false
  isSubmittingAcceptance: boolean = false
  error: string = ''
  successMessage: string = ''
  token: string = ''
  
  acceptanceForm!: FormGroup
  showAcceptanceForm: boolean = false
  acceptanceSubmitted: boolean = false
  showRejectConfirmation: boolean = false
  isRejectingQuote: boolean = false
  isDownloadingPdf: boolean = false
  contractReady: boolean = false
  
  private contractCheckInterval?: any

  constructor() {
    this.acceptanceForm = this.fb.group({
      clientName: ['', [Validators.required]],
      clientEmail: ['', [Validators.email]],
      clientPhone: [''],
      cpf: [''],
      termsAccepted: [false, [Validators.requiredTrue]]
    })
  }

  async ngOnInit(): Promise<void> {
    this.token = this.route.snapshot.paramMap.get('token') || ''
    
    if (!this.token) {
      this.error = 'Token inválido ou expirado'
      this.isLoading = false
      return
    }

    await this.loadProposal()
  }

  ngOnDestroy(): void {
    // Limpar interval ao sair do componente
    if (this.contractCheckInterval) {
      clearInterval(this.contractCheckInterval)
    }
  }

  async loadProposal(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const response = await firstValueFrom(this.quoteService.getPublicQuote(this.token))
      
      if (response.success && response.data) {
        this.quote = response.data
        
        // Verificar se contrato foi gerado (se status é Aceito e existe PDF)
        const wasReady = this.contractReady
        this.contractReady = this.quote.status === 'Aceito' && !!this.quote.contract?.contractPdfPath
        
        // Log para debug
        if (this.contractCheckInterval) {
          console.log(`[loadProposal] Status: ${this.quote.status}, HasContract: ${!!this.quote.contract}, HasPDF: ${!!this.quote.contract?.contractPdfPath}, contractReady: ${this.contractReady}`)
        }
        
        // Pré-preencher nome do cliente se disponível
        if (this.quote.client?.name) {
          this.acceptanceForm.patchValue({
            clientName: this.quote.client.name
          })
        }
      } else {
        this.error = response.message || 'Erro ao carregar proposta'
      }
    } catch (err: unknown) {
      const error = err as { error?: { error?: { message: string }; message?: string }; message: string }
      if (error.error?.error?.message) {
        this.error = error.error.error.message
      } else if (error.error?.message) {
        this.error = error.error.message
      } else if (error.message) {
        this.error = error.message
      } else {
        this.error = 'Erro ao carregar proposta. Link pode estar expirado.'
      }
    } finally {
      this.isLoading = false
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  formatDate(dateString: string): string {
    return formatDateBR(dateString)
  }

  isTokenExpired(): boolean {
    if (!this.quote?.publicLinkTokenExpiresAt) return false
    return new Date(this.quote.publicLinkTokenExpiresAt) < new Date()
  }

  isQuoteExpired(): boolean {
    if (!this.quote?.validUntilDate) return false
    return new Date(this.quote.validUntilDate) < new Date()
  }

  getDaysUntilExpiry(): number {
    if (!this.quote?.validUntilDate) return 0
    const expiryDate = new Date(this.quote.validUntilDate)
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  toggleAcceptanceForm(): void {
    this.showAcceptanceForm = !this.showAcceptanceForm
    if (!this.showAcceptanceForm) {
      this.acceptanceForm.reset()
      this.acceptanceSubmitted = false
      this.successMessage = ''
    }
  }

  async downloadProposalPdf(): Promise<void> {
    // Verificar se contrato foi gerado (apenas para propostas aceitas)
    if (this.quote?.status === 'Aceito') {
      if (!this.contractReady) {
        this.error = 'O contrato está sendo gerado. Tente novamente em alguns instantes.'
        this.toastService.error('Contrato ainda não está pronto. Aguarde...')
        return
      }
    }

    try {
      this.isDownloadingPdf = true
      this.error = ''
      const pdf = await firstValueFrom(this.quoteService.downloadPublicQuotePdf(this.token))
      const filename = this.quote?.status === 'Aceito' 
        ? `contrato-${this.quote?.id.slice(0, 8)}.pdf`
        : `proposta-${this.quote?.id.slice(0, 8)}.pdf`
      this.triggerDownload(pdf, filename)
      this.toastService.success('PDF baixado com sucesso!')
    } catch (err: unknown) {
      const error = err as { error?: { error?: { code?: string; message: string }; message?: string }; message: string }
      
      // Verificar se é erro de contrato não gerado
      if (error.error?.error?.code === 'CONTRACT_NOT_FOUND') {
        this.error = 'Contrato ainda não foi gerado. Aguarde alguns instantes e tente novamente.'
        this.toastService.error('Contrato em processamento...')
        this.contractReady = false
      } else if (error.error?.error?.message) {
        this.error = error.error.error.message
      } else if (error.error?.message) {
        this.error = error.error.message
      } else if (error.message) {
        this.error = error.message
      } else {
        this.error = 'Erro ao baixar PDF'
      }
    } finally {
      this.isDownloadingPdf = false
    }
  }

  async handleAcceptance(): Promise<void> {
    if (this.acceptanceForm.invalid) {
      Object.keys(this.acceptanceForm.controls).forEach(key => {
        this.acceptanceForm.get(key)?.markAsTouched()
      })
      return
    }

    this.isSubmittingAcceptance = true
    this.error = ''
    this.successMessage = ''

    try {
      const acceptanceData: AcceptQuoteRequest = {
        clientName: this.acceptanceForm.value.clientName,
        clientEmail: this.acceptanceForm.value.clientEmail,
        clientPhone: this.acceptanceForm.value.clientPhone,
        cpf: this.acceptanceForm.value.cpf,
        termsAccepted: this.acceptanceForm.value.termsAccepted
      }

      const response = await firstValueFrom(
        this.quoteService.acceptPublicQuote(this.token, acceptanceData)
      )

      if (response.success) {
        this.acceptanceSubmitted = true
        this.successMessage = 'Proposta aceita com sucesso! Seu contrato está sendo gerado.'
        this.showAcceptanceForm = false
        
        // Parar qualquer verificação anterior
        if (this.contractCheckInterval) {
          clearInterval(this.contractCheckInterval)
        }
        
        // Recarregar proposta e verificar contrato a cada 3 segundos
        let attempts = 0
        const maxAttempts = 20 // 60 segundos de tentativas
        this.contractCheckInterval = setInterval(async () => {
          attempts++
          await this.loadProposal()
          
          console.log(`Verificação ${attempts}: contractReady=${this.contractReady}`)
          
          if (this.contractReady || attempts >= maxAttempts) {
            if (this.contractCheckInterval) {
              clearInterval(this.contractCheckInterval)
              this.contractCheckInterval = undefined
            }
            if (this.contractReady) {
              this.toastService.success('Contrato gerado com sucesso!')
            } else if (attempts >= maxAttempts) {
              this.toastService.warning('Timeout na geração do contrato. Tente recarregar a página.')
            }
          }
        }, 3000)
      } else {
        this.error = response.message || response.errors?.[0] || 'Erro ao aceitar proposta'
      }
    } catch (err: unknown) {
      const error = err as { error?: { error?: { message: string }; message?: string }; message: string }
      if (error.error?.error?.message) {
        this.error = error.error.error.message
      } else if (error.error?.message) {
        this.error = error.error.message
      } else if (error.message) {
        this.error = error.message
      } else {
        this.error = 'Erro ao aceitar proposta'
      }
    } finally {
      this.isSubmittingAcceptance = false
    }
  }

  openRejectConfirmation(): void {
    this.showRejectConfirmation = true
  }

  closeRejectConfirmation(): void {
    this.showRejectConfirmation = false
  }

  async confirmRejectQuote(): Promise<void> {
    await this.performRejectQuote()
    this.closeRejectConfirmation()
  }

  async handleRejectQuote(): Promise<void> {
    this.openRejectConfirmation()
  }

  private async performRejectQuote(): Promise<void> {
    try {
      this.isRejectingQuote = true
      this.error = ''
      
      const response = await firstValueFrom(
        this.quoteService.rejectPublicQuote(this.token, {
          reason: 'Rejeitado via link público'
        })
      )

      if (response.success) {
        this.successMessage = 'Proposta rejeitada. Você receberá contato em breve.'
        this.showAcceptanceForm = false
        
        setTimeout(() => {
          this.loadProposal()
        }, 2000)
      }
    } catch (err: unknown) {
      const error = err as { error?: { error?: { message: string }; message?: string }; message: string }
      if (error.error?.error?.message) {
        this.error = error.error.error.message
      } else if (error.error?.message) {
        this.error = error.error.message
      } else if (error.message) {
        this.error = error.message
      } else {
        this.error = 'Erro ao rejeitar proposta'
      }
    } finally {
      this.isRejectingQuote = false
    }
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  isContractPending(): boolean {
    return this.quote?.status === 'Aceito' && !this.contractReady
  }

  isBtnDownloadDisabled(): boolean {
    return this.isDownloadingPdf || this.isContractPending()
  }

  dismissContractLoading(): void {
    // Usuário pode descartar o aviso manualmente
    if (this.contractCheckInterval) {
      clearInterval(this.contractCheckInterval)
      this.contractCheckInterval = undefined
    }
    this.successMessage = ''
  }

  getFieldError(fieldName: string): string {
    const field = this.acceptanceForm.get(fieldName)
    if (field?.hasError('required') && field.touched) {
      const fieldLabels: Record<string, string> = {
        clientName: 'Nome completo',
        clientEmail: 'Email',
        termsAccepted: 'Aceitar termos'
      }
      return `${fieldLabels[fieldName] || 'Campo'} é obrigatório`
    }
    if (field?.hasError('email') && field.touched) {
      return 'Email inválido'
    }
    return ''
  }

  hasError(fieldName: string): boolean {
    const field = this.acceptanceForm.get(fieldName)
    return !!(field?.invalid && field.touched)
  }
}
