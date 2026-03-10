import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { LucideAngularModule, TrendingUp, DollarSign, Users, Package, BarChart3, Pencil } from 'lucide-angular'

import { EventMarginService } from '@core/services/event-margin.service'
import type { EventMarginSummary } from '@shared/models/api.types'

const CATEGORY_LABELS: Record<string, string> = {
  staff: 'Equipe',
  food: 'Alimentação',
  decoration: 'Decoração',
  other: 'Outros'
}

/**
 * @Function - EventResultTabComponent
 * @description - Result tab in event hub: shows automatic margin summary (revenue, costs, team, supplies, profit and margin %)
 * @author - Vitor Hugo
 */
@Component({
  selector: 'app-event-result-tab',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './event-result-tab.component.html'
})
export class EventResultTabComponent implements OnInit {
  readonly TrendingUpIcon = TrendingUp
  readonly DollarSignIcon = DollarSign
  readonly UsersIcon = Users
  readonly PackageIcon = Package
  readonly BarChart3Icon = BarChart3
  readonly PencilIcon = Pencil

  eventId: string = ''
  summary: EventMarginSummary | null = null
  isLoading = true
  error = ''
  hasNoContract = false

  constructor(
    private readonly route: ActivatedRoute,
    private readonly eventMarginService: EventMarginService
  ) {}

  async ngOnInit(): Promise<void> {
    this.eventId = this.route.parent?.snapshot.paramMap.get('eventId') || this.route.snapshot.paramMap.get('eventId') || ''
    if (!this.eventId) {
      this.error = 'ID do evento não informado'
      this.isLoading = false
      return
    }
    await this.loadSummary()
  }

  /**
   * @Function - loadSummary
   * @description - Loads margin summary for the current event
   * @author - Vitor Hugo
   * @returns - Promise<void>
   */
  private async loadSummary(): Promise<void> {
    try {
      this.isLoading = true
      this.error = ''
      this.hasNoContract = false
      this.summary = await this.eventMarginService.getMarginSummaryPromise(this.eventId)
      if (this.summary === null) {
        this.error = 'Evento não encontrado'
      } else if (this.summary.revenue === 0) {
        this.hasNoContract = true
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar resultado'
      this.error = message
    } finally {
      this.isLoading = false
    }
  }

  /**
   * @Function - formatCurrency
   * @description - Formats number to Brazilian currency format
   * @author - Vitor Hugo
   * @param - value: number | string - Value to format
   * @returns - string - Formatted currency string
   */
  formatCurrency(value: number | string): string {
    const n = typeof value === 'number' ? value : parseFloat(String(value))
    if (!Number.isFinite(n)) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(n)
  }

  /**
   * @Function - formatPercent
   * @description - Formats margin percent for display
   * @author - Vitor Hugo
   * @param - value: number - Percent value
   * @returns - string - Formatted percent string
   */
  formatPercent(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value) + '%'
  }

  /**
   * @Function - translateCategory
   * @description - Returns Portuguese label for cost category
   * @author - Vitor Hugo
   * @param - category: string - Cost category key
   * @returns - string - Label in Portuguese
   */
  translateCategory(category: string): string {
    return CATEGORY_LABELS[category] ?? category
  }

  /**
   * @Function - formatDate
   * @description - Formats date string to Brazilian short date
   * @author - Vitor Hugo
   * @param - dateString: string - ISO date string
   * @returns - string - Formatted date
   */
  formatDate(dateString: string): string {
    if (!dateString) return '—'
    const d = new Date(dateString)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
}
