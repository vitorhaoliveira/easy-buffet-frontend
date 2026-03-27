import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { Subject, takeUntil, filter } from 'rxjs'
import { LucideAngularModule, CreditCard, Plus } from 'lucide-angular'

import { ContractDetailComponent } from '../../contracts/contract-detail/contract-detail.component'
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component'
import { EventService } from '@core/services/event.service'
import { ContractService } from '@core/services/contract.service'
import { EventHubRefreshService } from '@core/services/event-hub-refresh.service'
import type { Event, EventHubData } from '@shared/models/api.types'

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
export class EventPaymentsTabComponent implements OnInit, OnDestroy {
  readonly CreditCardIcon = CreditCard
  readonly PlusIcon = Plus

  eventId: string = ''
  event: Event | null = null
  contractId: string | null = null
  isLoading = true
  error = ''

  private readonly destroy$ = new Subject<void>()

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private contractService: ContractService,
    private eventHubRefresh: EventHubRefreshService
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.parent?.snapshot.paramMap.get('eventId') || this.route.snapshot.paramMap.get('eventId') || ''
    if (!this.eventId) {
      this.error = 'ID do evento não informado'
      this.isLoading = false
      return
    }

    this.route.parent?.data.pipe(takeUntil(this.destroy$)).subscribe(() => {
      void this.resolveContract()
    })

    this.eventHubRefresh.refresh$
      .pipe(
        takeUntil(this.destroy$),
        filter((id) => id === this.eventId)
      )
      .subscribe(() => {
        void this.refreshContractLinkFromHub()
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  /**
   * @Function - applyHubData
   * @description - Maps event hub payload to local event + contract id (contract summary or event.contractId)
   * @param - hub: EventHubData
   * @returns - void
   */
  private applyHubData(hub: EventHubData): void {
    this.event = hub.event
    this.contractId = hub.event.contractId ?? hub.contract?.id ?? null
  }

  /**
   * @Function - supplementContractIdIfMissing
   * @description - Fallback when contract exists but ids were not on hub payload
   * @returns - Promise<void>
   */
  private async supplementContractIdIfMissing(): Promise<void> {
    if (this.contractId || !this.eventId) return
    const contractsRes = await firstValueFrom(
      this.contractService.getContractsPaginated({ eventId: this.eventId, limit: 1 })
    )
    if (contractsRes.success && contractsRes.data?.length) {
      this.contractId = contractsRes.data[0].id
    }
  }

  /**
   * @Function - refreshContractLinkFromHub
   * @description - Refetches hub without reference lists after dados save or to pick up new contract
   * @returns - Promise<void>
   */
  private async refreshContractLinkFromHub(): Promise<void> {
    if (!this.eventId) return
    try {
      const res = await firstValueFrom(
        this.eventService.getEventHub(this.eventId, { includeReferenceLists: false })
      )
      if (res.success && res.data) {
        this.applyHubData(res.data)
        await this.supplementContractIdIfMissing()
        this.error = ''
      }
    } catch {
      /* keep previous state */
    }
  }

  /**
   * @Function - resolveContract
   * @description - Uses route resolver hub data when available; otherwise GET event + contracts list
   * @returns - Promise<void>
   */
  async resolveContract(): Promise<void> {
    this.isLoading = true
    this.error = ''
    this.eventId = this.route.parent?.snapshot.paramMap.get('eventId') || this.route.snapshot.paramMap.get('eventId') || ''
    if (!this.eventId) {
      this.error = 'ID do evento não informado'
      this.isLoading = false
      return
    }
    try {
      const hub = this.route.parent?.snapshot.data['eventHub'] as EventHubData | null
      if (hub?.event) {
        this.applyHubData(hub)
        await this.supplementContractIdIfMissing()
        return
      }

      const eventRes = await firstValueFrom(this.eventService.getEventById(this.eventId))
      if (!eventRes.success || !eventRes.data) {
        this.error = 'Evento não encontrado'
        return
      }
      this.event = eventRes.data
      this.contractId = this.event.contractId ?? null
      await this.supplementContractIdIfMissing()
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
