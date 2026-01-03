import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute, RouterModule } from '@angular/router'
import { LucideAngularModule, ArrowLeft, FileDown, Send, CheckCircle, XCircle } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { QuoteService } from '@core/services/quote.service'
import { ExportService } from '@shared/utils/export.service'
import type { Quote } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-quote-preview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent
  ],
  templateUrl: './quote-preview.component.html'
})
export class QuotePreviewComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft
  readonly FileDownIcon = FileDown
  readonly SendIcon = Send
  readonly CheckCircleIcon = CheckCircle
  readonly XCircleIcon = XCircle

  private readonly quoteService = inject(QuoteService)
  private readonly exportService = inject(ExportService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)

  quote: Quote | null = null
  quoteId: string | null = null
  isLoading: boolean = true
  isExporting: boolean = false
  isProcessing: boolean = false
  errorMessage: string = ''
  successMessage: string = ''

  async ngOnInit(): Promise<void> {
    this.quoteId = this.route.snapshot.paramMap.get('id')
    
    if (this.quoteId) {
      await this.loadQuote(this.quoteId)
    } else {
      this.errorMessage = 'ID do orçamento não fornecido'
      this.isLoading = false
    }
  }

  async loadQuote(id: string): Promise<void> {
    try {
      this.isLoading = true
      this.errorMessage = ''
      const response = await firstValueFrom(this.quoteService.getQuoteById(id))
      
      if (response.success && response.data) {
        this.quote = response.data
      } else {
        this.errorMessage = 'Erro ao carregar orçamento'
      }
    } catch {
      this.errorMessage = 'Erro ao carregar orçamento'
    } finally {
      this.isLoading = false
    }
  }

  exportToPDF(): void {
    if (!this.quote) return

    this.isExporting = true
    this.errorMessage = ''

    try {
      const quoteNumber = `#${this.quote.id.slice(0, 8).toUpperCase()}`
      const clientName = this.quote.client?.name || 'Cliente'
      
      this.exportService.exportToPDF({
        title: `Orçamento ${quoteNumber}`,
        subtitle: `Cliente: ${clientName} | Data: ${this.formatDate(this.quote.createdAt)}`,
        filename: `orcamento-${this.quote.id.slice(0, 8)}-${clientName.replace(/\s/g, '-')}`,
        orientation: 'portrait',
        tables: [
          {
            title: 'Informações do Orçamento',
            headers: ['Campo', 'Valor'],
            rows: [
              ['Cliente', this.quote.client?.name || '-'],
              ['Email', this.quote.client?.email || '-'],
              ['Telefone', this.quote.client?.phone || '-'],
              ['Evento', this.quote.event?.name || '-'],
              ['Data do Evento', this.quote.event?.eventDate ? this.formatDate(this.quote.event.eventDate) : '-'],
              ...(this.quote.event?.eventTime ? [['Horário', this.formatTime(this.quote.event.eventTime)]] : []),
              ['Pacote', this.quote.package?.name || '-'],
              ['Status', this.quote.status],
              ['Válido até', this.formatDate(this.quote.validUntilDate)],
            ]
          },
          {
            title: 'Itens do Orçamento',
            headers: ['Descrição', 'Qtd', 'Valor Unit.', 'Total'],
            rows: (Array.isArray(this.quote.items) ? this.quote.items : []).length > 0 
              ? this.quote.items.map(item => [
                item.description,
                item.quantity.toString(),
                this.formatCurrency(item.unitPrice),
                this.formatCurrency(item.totalPrice)
              ])
              : [['Nenhum item adicionado', '', '', '']]
          },
          {
            title: 'Resumo',
            headers: ['', ''],
            rows: [
              ['Valor Total', this.formatCurrency(this.quote.totalAmount)],
              ...(this.quote.notes ? [['Observações', this.quote.notes]] : [])
            ]
          }
        ]
      })

      this.successMessage = 'PDF exportado com sucesso!'
      setTimeout(() => this.successMessage = '', 3000)
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      this.errorMessage = error instanceof Error 
        ? `Erro ao exportar PDF: ${error.message}` 
        : 'Erro desconhecido ao exportar PDF'
      setTimeout(() => this.errorMessage = '', 5000)
    } finally {
      this.isExporting = false
    }
  }

  async sendQuote(): Promise<void> {
    if (!this.quote || !this.quoteId) return

    try {
      this.isProcessing = true
      this.errorMessage = ''
      
      const response = await firstValueFrom(this.quoteService.sendQuote(this.quoteId))
      
      if (response.success) {
        this.successMessage = 'Orçamento enviado com sucesso!'
        await this.loadQuote(this.quoteId)
        setTimeout(() => this.successMessage = '', 3000)
      } else {
        this.errorMessage = 'Erro ao enviar orçamento'
      }
    } catch {
      this.errorMessage = 'Erro ao enviar orçamento'
    } finally {
      this.isProcessing = false
    }
  }

  async acceptQuote(): Promise<void> {
    if (!this.quote || !this.quoteId) return

    try {
      this.isProcessing = true
      this.errorMessage = ''
      
      const response = await firstValueFrom(this.quoteService.acceptQuote(this.quoteId))
      
      if (response.success) {
        this.successMessage = 'Orçamento aceito com sucesso!'
        await this.loadQuote(this.quoteId)
        setTimeout(() => this.successMessage = '', 3000)
      } else {
        this.errorMessage = 'Erro ao aceitar orçamento'
      }
    } catch {
      this.errorMessage = 'Erro ao aceitar orçamento'
    } finally {
      this.isProcessing = false
    }
  }

  async rejectQuote(): Promise<void> {
    if (!this.quote || !this.quoteId) return

    try {
      this.isProcessing = true
      this.errorMessage = ''
      
      const response = await firstValueFrom(this.quoteService.rejectQuote(this.quoteId))
      
      if (response.success) {
        this.successMessage = 'Orçamento rejeitado'
        await this.loadQuote(this.quoteId)
        setTimeout(() => this.successMessage = '', 3000)
      } else {
        this.errorMessage = 'Erro ao rejeitar orçamento'
      }
    } catch {
      this.errorMessage = 'Erro ao rejeitar orçamento'
    } finally {
      this.isProcessing = false
    }
  }

  goBack(): void {
    this.router.navigate(['/cadastros/orcamentos'])
  }

  editQuote(): void {
    if (this.quoteId) {
      this.router.navigate(['/cadastros/orcamentos/editar', this.quoteId])
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

  formatTime(timeString: string): string {
    if (!timeString) return '-'
    
    try {
      // Parse the ISO timestamp
      const date = new Date(timeString)
      
      // Format as HH:MM
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } catch {
      return timeString
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Rascunho':
        return 'bg-gray-100 text-gray-800'
      case 'Enviado':
        return 'bg-blue-100 text-blue-800'
      case 'Aceito':
        return 'bg-green-100 text-green-800'
      case 'Rejeitado':
        return 'bg-red-100 text-red-800'
      case 'Expirado':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  canSend(): boolean {
    return this.quote?.status === 'Rascunho' || this.quote?.status === 'Rejeitado'
  }

  canAccept(): boolean {
    return this.quote?.status === 'Enviado'
  }

  canReject(): boolean {
    return this.quote?.status === 'Enviado'
  }

  canEdit(): boolean {
    return this.quote?.status === 'Rascunho' || this.quote?.status === 'Rejeitado'
  }
}
