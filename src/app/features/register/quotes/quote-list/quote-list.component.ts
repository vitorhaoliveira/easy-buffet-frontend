import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule, Plus, Edit, Trash2, FileText, DollarSign, Eye } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'

import { ButtonComponent } from '@shared/components/ui/button/button.component'
import { SearchBarComponent } from '@shared/components/ui/search-bar/search-bar.component'
import { ConfirmationModalComponent } from '@shared/components/ui/confirmation-modal/confirmation-modal.component'
import { SkeletonComponent } from '@shared/components/ui/skeleton/skeleton.component'
import { MobileCardComponent } from '@shared/components/ui/mobile-card/mobile-card.component'
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component'
import { 
  TableComponent, 
  TableHeaderComponent, 
  TableBodyComponent, 
  TableRowComponent, 
  TableHeadComponent, 
  TableCellComponent 
} from '@shared/components/ui/table/table.component'
import { QuoteService } from '@core/services/quote.service'
import { ClientService } from '@core/services/client.service'
import { ExportService } from '@shared/utils/export.service'
import type { Quote } from '@shared/models/api.types'
import { formatDateBR } from '@shared/utils/date.utils'

@Component({
  selector: 'app-quote-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    SearchBarComponent,
    ConfirmationModalComponent,
    SkeletonComponent,
    MobileCardComponent,
    EmptyStateComponent,
    TableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent
  ],
  templateUrl: './quote-list.component.html'
})
export class QuoteListComponent implements OnInit {
  readonly PlusIcon = Plus
  readonly EditIcon = Edit
  readonly Trash2Icon = Trash2
  readonly FileTextIcon = FileText
  readonly DollarSignIcon = DollarSign
  readonly EyeIcon = Eye

  private readonly quoteService = inject(QuoteService)
  private readonly clientService = inject(ClientService)
  private readonly exportService = inject(ExportService)
  public readonly router = inject(Router)

  quotes: Quote[] = []
  searchTerm: string = ''
  statusFilter: string = ''
  isLoading: boolean = true
  error: string = ''
  showDeleteModal: boolean = false
  quoteToDelete: Quote | null = null
  isDeleting: boolean = false

  async ngOnInit(): Promise<void> {
    await this.loadData()
  }

  async loadData(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      const response = await firstValueFrom(this.quoteService.getQuotes())
      if (response.success && response.data) {
        this.quotes = response.data
      } else {
        this.error = 'Erro ao carregar orçamentos'
      }
    } catch (err: unknown) {
      const error = err as { message: string }
      this.error = error.message || 'Erro ao carregar orçamentos'
    } finally {
      this.isLoading = false
    }
  }

  get filteredQuotes(): Quote[] {
    return this.quotes.filter(quote => {
      const matchSearch = !this.searchTerm || 
        (quote.client?.name?.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (quote.id?.toLowerCase().includes(this.searchTerm.toLowerCase()))
      
      const matchStatus = !this.statusFilter || quote.status === this.statusFilter
      
      return matchSearch && matchStatus
    })
  }

  get uniqueStatuses(): string[] {
    return ['Rascunho', 'Enviado', 'Aceito', 'Rejeitado', 'Expirado']
  }

  handleDeleteClick(quote: Quote): void {
    this.quoteToDelete = quote
    this.showDeleteModal = true
    this.error = ''
  }

  async handleConfirmDelete(): Promise<void> {
    if (!this.quoteToDelete) return

    try {
      this.isDeleting = true
      const response = await firstValueFrom(
        this.quoteService.deleteQuote(this.quoteToDelete.id)
      )
      if (response.success) {
        this.quotes = this.quotes.filter(q => q.id !== this.quoteToDelete!.id)
        this.showDeleteModal = false
        this.quoteToDelete = null
      } else {
        this.error = response.message || response.errors?.[0] || 'Erro ao excluir orçamento'
        this.showDeleteModal = false
        this.quoteToDelete = null
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
        this.error = 'Erro ao excluir orçamento'
      }
      this.showDeleteModal = false
      this.quoteToDelete = null
    } finally {
      this.isDeleting = false
    }
  }

  handleCancelDelete(): void {
    this.showDeleteModal = false
    this.quoteToDelete = null
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

  exportQuoteToPDF(quote: Quote): void {
    try {
      const quoteNumber = `#${quote.id.slice(0, 8).toUpperCase()}`
      const clientName = quote.client?.name || 'Cliente'
      const items = Array.isArray(quote.items) ? quote.items : []
      
      this.exportService.exportToPDF({
        title: `Orçamento ${quoteNumber}`,
        subtitle: `Cliente: ${clientName} | Data: ${this.formatDate(quote.createdAt)}`,
        filename: `orcamento-${quote.id.slice(0, 8)}-${clientName.replace(/\s/g, '-')}`,
        orientation: 'portrait',
        tables: [
          {
            title: 'Informações do Orçamento',
            headers: ['Campo', 'Valor'],
            rows: [
              ['Cliente', quote.client?.name || '-'],
              ['Email', quote.client?.email || '-'],
              ['Telefone', quote.client?.phone || '-'],
              ['Evento', quote.event?.name || '-'],
              ['Data do Evento', quote.event?.eventDate ? this.formatDate(quote.event.eventDate) : '-'],
              ['Pacote', quote.package?.name || '-'],
              ['Status', quote.status],
              ['Válido até', this.formatDate(quote.validUntilDate)],
            ]
          },
          {
            title: 'Itens do Orçamento',
            headers: ['Descrição', 'Qtd', 'Valor Unit.', 'Total'],
            rows: items.length > 0 ? items.map(item => [
              item.description,
              item.quantity.toString(),
              this.formatCurrency(item.unitPrice),
              this.formatCurrency(item.totalPrice)
            ]) : [['Nenhum item adicionado', '', '', '']]
          },
          {
            title: 'Resumo',
            headers: ['', ''],
            rows: [
              ['Valor Total', this.formatCurrency(quote.totalAmount)],
              ...(quote.notes ? [['Observações', quote.notes]] : [])
            ]
          }
        ]
      })
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      this.error = error instanceof Error ? error.message : 'Erro ao exportar PDF'
      setTimeout(() => this.error = '', 5000)
    }
  }

  // Método para teste de link público
  testPublicLink(quote: Quote): void {
    if (quote.publicLinkToken) {
      const publicLink = `${window.location.origin}/proposal/${quote.publicLinkToken}`
      window.open(publicLink, '_blank')
    } else {
      this.error = 'Este orçamento ainda não foi enviado. Clique em "Enviar" primeiro.'
      setTimeout(() => this.error = '', 5000)
    }
  }
}
