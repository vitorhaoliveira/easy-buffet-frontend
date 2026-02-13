import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { LucideAngularModule, CreditCard, Plus } from 'lucide-angular'

import { ContractDetailComponent } from '../../contracts/contract-detail/contract-detail.component'
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component'
import { EventService } from '@core/services/event.service'
import { ContractService } from '@core/services/contract.service'
import type { Event } from '@shared/models/api.types'

/**
 * @Function - EventPaymentsTabComponent
 * @description - Pagamentos tab in event hub: shows contract detail (parcelas, itens, pagamentos adicionais, comissão) or CTA to create contract
 * @author - Vitor Hugo
 */
@Component({
  selector: 'app-event-payments-tab',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, EmptyStateComponent, ContractDetailComponent],
  templateUrl: './event-payments-tab.component.html'
})
export class EventPaymentsTabComponent implements OnInit {
  readonly CreditCardIcon = CreditCard
  readonly PlusIcon = Plus

  eventId: string = ''
  event: Event | null = null
  contractId: string | null = null
  isLoading = true
  error = ''

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private contractService: ContractService
  ) {}

  async ngOnInit(): Promise<void> {
    this.eventId = this.route.parent?.snapshot.paramMap.get('eventId') || this.route.snapshot.paramMap.get('eventId') || ''
    if (!this.eventId) {
      this.error = 'ID do evento não informado'
      this.isLoading = false
      return
    }
    await this.resolveContract()
  }

  async resolveContract(): Promise<void> {
    try {
      const eventRes = await firstValueFrom(this.eventService.getEventById(this.eventId))
      if (!eventRes.success || !eventRes.data) {
        this.error = 'Evento não encontrado'
        this.isLoading = false
        return
      }
      this.event = eventRes.data
      if (this.event.contractId) {
        this.contractId = this.event.contractId
      } else {
        const contractsRes = await firstValueFrom(
          this.contractService.getContractsPaginated({ eventId: this.eventId, limit: 1 })
        )
        if (contractsRes.success && contractsRes.data?.length) {
          this.contractId = contractsRes.data[0].id
        }
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar dados'
    } finally {
      this.isLoading = false
    }
  }

  goToCreateContract(): void {
    const queryParams: any = { eventId: this.eventId }
    if (this.event?.clientId) queryParams.clientId = this.event.clientId
    this.router.navigate(['/cadastros/contratos/novo'], { queryParams })
  }
}
